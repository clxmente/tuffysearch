/* ------------------------ Initialize Courses Table ------------------------ */

CREATE TABLE
    IF NOT EXISTS courses (
        course_id INT NOT NULL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        department VARCHAR(50) NOT NULL,
        course_code VARCHAR(10) NOT NULL,
        INDEX course_code (course_code),
        INDEX department (department)
    );