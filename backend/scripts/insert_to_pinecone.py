import os, json, time, openai, pinecone

from rich.live import Live
from rich.panel import Panel
from dotenv import load_dotenv
from rich.progress import TaskID, Progress, BarColumn, SpinnerColumn, TextColumn

load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
pinecone.init(api_key=os.getenv("PINECONE_API_KEY"), environment="gcp-starter")
index = pinecone.Index("tuffysearch")


def get_embedding(text: str, model="text-embedding-ada-002"):
    text = text.strip()
    return openai.Embedding.create(input=[text], model=model)["data"][0]["embedding"]


def get_vector_objects() -> list[tuple[str, list[float], dict[str, str]]]:
    """Generate vectors for each course in the course catalog by using OpenAI's API.

    Returns:
        list[tuple[str, list[float], dict[str,str]]]: A list of vector tuples for each course in the course catalog.
    """

    vectors = []
    error_course_ids = []
    i = 0
    for course_id, course in catalog.items():
        overall_progress.update(overall_task_id, advance=0.25)

        curr_vector = {}
        curr_vector["id"] = course_id
        curr_vector["metadata"] = {
            "title": course["title"],
            "course_code": course["course_code"],
            "description": course["description"],
        }

        curr_text = f"{course['department']} {course['title']} {course['description']}"
        overall_progress.update(overall_task_id, advance=0.25)

        # shoutout danny for this rate limiting idea 🔥🔥
        if i % 1500 == 0 and i != 0:
            overall_progress.console.print(
                "[bold yellow]⏳ Waiting 30 seconds for OpenAI API Rate Limits...[/bold yellow]"
            )
            time.sleep(30)
            overall_progress.console.print(
                "[bold green]✅ Waited 30 seconds[/bold green]"
            )

        try:
            curr_vector["vector"] = get_embedding(curr_text)
        except openai.APIError as e:
            overall_progress.console.print(
                f"[bold red]❌ APIError getting vector for {course_id}[/bold red]"
            )
            overall_progress.console.print(f"[bold red]{e}[/bold red]")
            error_course_ids.append(course_id)
            continue
        except Exception as e:
            overall_progress.console.print(
                f"[bold red]❌ Error getting vector for {course_id}[/bold red]"
            )
            overall_progress.console.print(f"[bold red]{e}[/bold red]")
            error_course_ids.append(course_id)
            continue

        # ig pinecone needs a list of tuples
        vectors.append(
            (curr_vector["id"], curr_vector["vector"], curr_vector["metadata"])
        )
        i += 1
        overall_progress.update(overall_task_id, advance=0.50)

    overall_progress.console.print(
        "[bold green]✅ Successfully generated vectors[/bold green]"
    )

    j = 0
    while len(error_course_ids) > 0:
        # try and get vectors for the courses that errored out
        overall_progress.console.print(
            "[bold yellow]⏳ Trying to get vectors for errored courses...[/bold yellow]"
        )

        # treat this like a stack
        course_id = error_course_ids.pop()

        curr_vector = {}
        curr_vector["id"] = course_id
        curr_vector["metadata"] = {
            "title": catalog[course_id]["title"],
            "course_code": catalog[course_id]["course_code"],
            "description": catalog[course_id]["description"],
        }

        curr_text = f"{catalog[course_id]['department']} {catalog[course_id]['title']} {catalog[course_id]['description']}"

        if (j % 1500 == 0 and j != 0) or (i % 1500 == 0 and i != 0):
            overall_progress.console.print(
                "[bold yellow]⏳ Waiting 30 seconds for OpenAI API Rate Limits...[/bold yellow]"
            )
            time.sleep(30)
            overall_progress.console.print(
                "[bold green]✅ Waited 30 seconds[/bold green]"
            )

        try:
            curr_vector["vector"] = get_embedding(curr_text)
        except openai.APIError as e:
            overall_progress.console.print(
                f"[bold red]❌ APIError getting vector for {course_id}[/bold red]"
            )
            overall_progress.console.print(f"[bold red]{e}[/bold red]")
            error_course_ids.append(course_id)
            continue
        except Exception as e:
            overall_progress.console.print(
                f"[bold red]❌ Error getting vector for {course_id}[/bold red]"
            )
            overall_progress.console.print(f"[bold red]{e}[/bold red]")
            error_course_ids.append(course_id)
            continue

        vectors.append(
            (curr_vector["id"], curr_vector["vector"], curr_vector["metadata"])
        )

    return vectors


def insert_vectors(vectors: list[tuple[str, list[float], dict[str, str]]]):
    subset = []
    for idx, vector_tuple in enumerate(vectors):
        subset.append(vector_tuple)
        if idx % 100 == 0 and idx != 0:
            index.upsert(subset)
            overall_progress.update(insert_task_id, advance=100)
            subset.clear()

    # insert the remaining vectors
    if subset:
        index.upsert(subset)
        overall_progress.update(insert_task_id, advance=len(subset))


if __name__ == "__main__":
    start_time = time.time()

    COURSE_CATALOG_FILENAME = "2023-2024_catalog.json"

    with open(os.path.join(os.getcwd(), "data", COURSE_CATALOG_FILENAME)) as f:
        catalog = json.load(f)

    overall_progress = Progress(
        TextColumn("[bold blue]{task.description}", justify="left"),
        SpinnerColumn(finished_text="✅"),
        BarColumn(bar_width=None),
        TextColumn("[bold blue]{task.completed}/{task.total}"),
    )
    overall_task_id = overall_progress.add_task(
        "Getting vectors...", total=len(catalog)
    )

    live = Live(
        Panel.fit(
            overall_progress, border_style="green", title=f"{__file__}", padding=(4, 4)
        )
    )

    with live:
        vectors = get_vector_objects()

        insert_task_id = overall_progress.add_task(
            "Inserting vectors...", total=len(vectors)
        )
        insert_vectors(vectors)

    end_time = time.time()

    overall_progress.console.print(
        f"[bold green]✅ Successfully inserted {len(vectors)} vectors in {int((end_time - start_time) // 60)}m {int((end_time - start_time) % 60)}s[/bold green]"
    )
