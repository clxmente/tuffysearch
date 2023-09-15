import os, json, MySQLdb

from dotenv import load_dotenv
from rich.console import Console
from MySQLdb.cursors import Cursor
from MySQLdb.connections import Connection

console = Console()

load_dotenv()


def get_db_cursor() -> tuple[Connection, Cursor] | tuple[None, None]:
    try:
        connection: Connection = MySQLdb.connect(
            host=os.getenv("DATABASE_HOST"),
            user=os.getenv("DATABASE_USERNAME"),
            password=os.getenv("DATABASE_PASSWORD"),
            db=os.getenv("DATABASE"),
            autocommit=True,
            ssl_mode="VERIFY_IDENTITY",
            ssl={"ca": "/etc/ssl/certs/ca-certificates.crt"},
        )
    except MySQLdb.OperationalError as e:
        console.print(f"[bold red]❌ MySQL Operational Error: {e}[/bold red]")
        return None, None

    cursor: Cursor = connection.cursor()

    return connection, cursor


def init_table(cursor: Cursor) -> None:
    with open(os.path.join(os.getcwd(), "scripts", "init.sql"), "r") as f:
        sql = f.read()

    cursor.execute(sql)

    console.print("[bold green]✅ Successfully initialized courses table[/bold green]")


def generate_tuple(course: dict[str, str | int]) -> tuple[str, str, str, str, str]:
    return (
        course["course_id"],
        course["title"],
        course["description"],
        course["department"],
        course["course_code"],
    )


def insert_courses(cursor: Cursor, filename: str) -> int:
    with console.status("[bold blue]Inserting courses..."):
        with open(os.path.join(os.getcwd(), "data", filename), "r") as f:
            courses = json.load(f)

        insert_query = """
        INSERT INTO courses (course_id, title, description, department, course_code)
        VALUES (%s, %s, %s, %s, %s)
        """

        flattened_courses = [
            generate_tuple(courses[course_id]) for course_id in courses
        ]

        # execute many and then print the number of rows inserted
        rows_inserted = cursor.executemany(insert_query, flattened_courses)

        console.print(
            f"[bold green]✅ Successfully inserted {rows_inserted} courses[/bold green]"
        )

        return 0


if __name__ == "__main__":
    conn, cursor = get_db_cursor()

    if cursor is None:
        console.print("[bold red]❌ Failed to get database cursor[/bold red]")
        exit(1)

    try:
        init_table(cursor)
        insert_courses(cursor, "2023-2024_catalog.json")
    except MySQLdb.OperationalError as e:
        console.print(f"[bold red]❌ Error while executing sql: {e}[/bold red]")
        exit(1)
    finally:
        cursor.close()
        conn.close()
