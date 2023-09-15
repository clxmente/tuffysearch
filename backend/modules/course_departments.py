import os, bs4, json, requests

from modules.console import console

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
        self.__save_abbr_map()

    def __build_abbr_map(self):
        """Builds a dictionary mapping department abbreviations to their full name."""
        _status = console.status("[bold blue]Building department abbreviation map...")
        _status.start()
        if self.__map_exists():
            filename = f"{self.navoid}_{self.catoid}.json"

            with open(os.path.join(os.getcwd(), "data", filename), "r") as f:
                abbr_map = json.load(f)

            _status.stop()
            console.print("[bold green]✅ Using existing dept map.")

            return abbr_map

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

        # for some reason not every department is in the table 😀😀😀😀😀😀😀😀😀😀😀😀
        abbr_map["EGEC"] = "Electrical and Computer Engineering"

        _status.stop()
        console.print("[bold green]✅ Finished building map.")

        return abbr_map

    def __save_abbr_map(self):
        if self.__map_exists():
            return

        filename = f"{self.navoid}_{self.catoid}.json"

        # create data directory if it doesn't exist
        if not os.path.exists(os.path.join(os.getcwd(), "data")):
            os.mkdir(os.path.join(os.getcwd(), "data"))

        with open(os.path.join(os.getcwd(), "data", filename), "w") as f:
            json.dump(self.abbr_map, f, indent=2)

    def __map_exists(self) -> bool:
        filename = f"{self.navoid}_{self.catoid}.json"

        return os.path.exists(os.path.join(os.getcwd(), "data", filename))

    def get_department_name(self, abbr: str) -> str:
        return self.abbr_map.get(abbr, "UNKNOWN")

    def print_department_names(self):
        for abbr, name in self.abbr_map.items():
            print(f"{abbr} - {name}")
