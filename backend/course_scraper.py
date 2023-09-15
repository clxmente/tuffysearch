import os, bs4, json, requests

from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from modules.console import console
from concurrent.futures import ThreadPoolExecutor
from modules.course_departments import CourseDepartments
from rich.progress import TaskID, Progress, BarColumn, SpinnerColumn, TextColumn

PageElement = bs4.element.Tag | bs4.element.NavigableString | None

EXPANDED_URLS = [
    f"https://catalog.fullerton.edu/content.php?catoid=80&navoid=11056&filter[27]=-1&filter[29]=&filter[keyword]=&filter[32]=1&filter[cpage]={i}&filter[exact_match]=1&filter[item_type]=3&filter[only_active]=1&filter[3]=1&expand=1&print#acalog_template_course_filter"
    for i in range(1, 40)
]

UNEXPANDED_URLS = [
    f"https://catalog.fullerton.edu/content.php?catoid=80&navoid=11056&filter[27]=-1&filter[29]=&filter[keyword]=&filter[32]=1&filter[cpage]={i}&filter[exact_match]=1&filter[item_type]=3&filter[only_active]=1&filter[3]=1&print#acalog_template_course_filter"
    for i in range(1, 40)
]


def get_courses_table(soup: bs4.BeautifulSoup) -> PageElement:
    return soup.find_all("table", class_="table_default")[-1]


def get_course_id(unexpanded_element: PageElement) -> int:
    href_value = unexpanded_element.find("a")["href"]
    course_id = href_value.split("coid=")[1]

    return int(course_id)


def get_course_info(
    expanded_element: PageElement, course_id: int, CD: CourseDepartments
) -> dict[str, str]:
    """Returns a dictionary containing the course information.

    Args:
        expanded_element (PageElement): The element from the table containing the course information.
        course_id (int): The id of the course. Taken from unexpanded version <a> tag.
        CD (CourseDepartments): An instance of the CourseDeparments class. Used to find the full department name.

    Returns:
        dict[str, str]: A dictionary containing the course information.

    Example Course:
        {
            "title": "Financial Accounting",\n
            "description": "Accounting concepts and techniques essential to the ...",\n
            "department": "Accounting",\n
            "course_code": "ACCT 201A",\n
            "course_id": 537360,\n
        }
    """
    course_header = expanded_element.find("h3").text.strip()

    course_code = course_header.split("-", maxsplit=1)[0]
    course_title = course_header.split("-", maxsplit=1)[1]
    course_title = course_title.split("(")[0].strip()
    course_description = (
        expanded_element.find("h3").find_next_sibling("hr").next_sibling.strip()
    )

    department_abbr = course_code.split(" ")[0]
    course_number = course_code.split(" ")[1]

    course = {
        "title": course_title.strip(),
        "description": course_description.strip(),
        "department": CD.get_department_name(department_abbr),
        "course_code": course_code.strip(),
        "course_id": course_id,
    }

    if CD.get_department_name(department_abbr) == "UNKNOWN":
        print(f"Unknown department: {department_abbr} {course_number}")

    return course


def loop_through_courses(
    expanded_table: PageElement,
    unexpanded_table: PageElement,
    courses: dict[str, dict[str, str]],
    CD: CourseDepartments,
) -> None:
    """Loop through individual page of courses and add them to the courses dictionary.

    Args:
        expanded_table (PageElement): Page element containing the expanded course information. Used for getting the course description.
        unexpanded_table (PageElement): Page element containing the unexpanded course information. Used for getting the course id.
        courses (dict[str, dict[str, str]]): Dictionary containing all the courses. Keys are course ids.
        CD (CourseDepartments): CourseDepartments class instance used for getting the department name.
    """

    # ! For some reason, the table body is not found in da soup.
    # expanded_body = expanded_table.find("tbody")
    # unexpanded_body = unexpanded_table.find("tbody")

    expanded_row: PageElement
    unexpanded_row: PageElement
    for expanded_row, unexpanded_row in zip(
        expanded_table.find_all("tr"), unexpanded_table.find_all("tr"), strict=True
    ):
        # check to make sure there are two td elements in this tag, else skip
        # Section headers have 1 td element
        if (
            len(expanded_row.find_all("td")) != 2
            or len(unexpanded_row.find_all("td")) != 2
        ):
            continue

        expanded_course_element = expanded_row.find_all("td")[1]
        unexpanded_course_element = unexpanded_row.find_all("td")[1]

        course_id = get_course_id(unexpanded_course_element)

        course = get_course_info(
            expanded_element=expanded_course_element, course_id=course_id, CD=CD
        )

        courses[course_id] = course


job_progress = Progress(
    TextColumn("[bold blue]{task.description}", justify="left"),
    BarColumn(bar_width=None),
    SpinnerColumn(finished_text="✅"),
)


def process_page(
    expanded_url: str,
    unexpanded_url: str,
    courses: dict[str, dict[str, str]],
    CD: CourseDepartments,
    task_id: TaskID,
) -> None:
    expanded_page = requests.get(expanded_url)
    job_progress.update(task_id, advance=0.25)
    unexpanded_page = requests.get(unexpanded_url)
    job_progress.update(task_id, advance=0.25)

    expanded_soup = bs4.BeautifulSoup(expanded_page.text, "html.parser")
    job_progress.update(task_id, advance=0.125)
    unexpanded_soup = bs4.BeautifulSoup(unexpanded_page.text, "html.parser")
    job_progress.update(task_id, advance=0.125)

    expanded_table = get_courses_table(expanded_soup)
    unexpanded_table = get_courses_table(unexpanded_soup)

    loop_through_courses(
        expanded_table=expanded_table,
        unexpanded_table=unexpanded_table,
        courses=courses,
        CD=CD,
    )
    job_progress.update(task_id, advance=0.25)
    overall_progress.update(overall_task, advance=1)


overall_progress = Progress(
    TextColumn("[bold blue]{task.description}", justify="left"),
    BarColumn(bar_width=None),
    TextColumn("[bold blue]{task.completed}/{task.total}"),
)
overall_task = overall_progress.add_task("All Pages", total=len(EXPANDED_URLS))

progress_table = Table().grid()
progress_table.add_row(
    Panel.fit(
        overall_progress, title="[b]All Pages", border_style="green", padding=(2, 2)
    )
)
progress_table.add_row(
    Panel.fit(job_progress, title="[b]Pages", border_style="red", padding=(2, 2))
)

if __name__ == "__main__":
    CourseDepartments = CourseDepartments(navoid=11034, catoid=80)

    Courses = {}
    with Live(progress_table, refresh_per_second=10):
        with ThreadPoolExecutor() as pool:
            for i, (expanded_url, unexpanded_url) in enumerate(
                zip(EXPANDED_URLS, UNEXPANDED_URLS)
            ):
                task_id = job_progress.add_task(f"Page {i + 1}", total=1)
                pool.submit(
                    process_page,
                    expanded_url,
                    unexpanded_url,
                    Courses,
                    CourseDepartments,
                    task_id,
                )

    filename = "2023-2024_catalog.json"
    with open(os.path.join(os.getcwd(), "data", filename), "w") as f:
        json.dump(Courses, f, indent=2)
