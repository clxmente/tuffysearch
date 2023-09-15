import requests, bs4

PageElement = bs4.element.Tag | bs4.element.NavigableString | None


class CourseDepartments:
    """A class that contains the department abbreviations and their full names. Subject to change every catalog year."""

    def __init__(self, navoid: int, catoid: int):
        """Initializes the CourseDepartments class. To find the navoid and catoid, go to https://catalog.fullerton.edu -> Course Descriptions -> Prefix and Course Index.

        Args:
            navoid (int): found in URL query params
            catoid (int): found in URL query params
        """
        self.navoid = navoid
        self.catoid = catoid
        self.URL = f"https://catalog.fullerton.edu/content.php?catoid={self.catoid}&navoid={self.navoid}&print"

        self.abbr_map = self.__build_abbr_map()

        # for some reason not every department is in the table 😀😀😀😀😀😀😀😀😀😀😀😀
        self.abbr_map["EGEC"] = "Electrical and Computer Engineering"

    def __build_abbr_map(self):
        """Builds a dictionary mapping department abbreviations to their full name."""
        page = requests.get(self.URL)
        soup = bs4.BeautifulSoup(page.text, "html.parser")

        outer_table: PageElement = soup.find_all("table", class_="table_default")[-1]

        inner_table = outer_table.find("table")

        abbr_map = {}

        row: PageElement
        for row in inner_table.find_all("tr"):
            info = row.find_all("td")

            if len(info) < 5:
                continue

            # row structure: [abbr1, name1, whitespace, name2, abbr2]
            # 1 weird row where the second td is a whole table so its a bit hacky
            abbr = info[0].text.strip()
            name = info[1].text.strip()

            if abbr and name:
                abbr_map[abbr] = name

            abbr = info[-1].text.strip()
            name = info[-2].text.strip()

            if abbr and name:
                abbr_map[abbr] = name

        return abbr_map

    def get_department_name(self, abbr: str) -> str:
        return self.abbr_map.get(abbr, "UNKNOWN")

    def print_department_names(self):
        for abbr, name in self.abbr_map.items():
            print(f"{abbr} - {name}")
