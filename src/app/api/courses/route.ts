import { NextRequest, NextResponse } from "next/server";

import abbr_map from "@/data/11034_80.json";

import rateLimit from "@/lib/app-rate-limit";

import { connect } from "@planetscale/database";

export const runtime = "edge";
export const preferredRegion = "pdx1"; // us-west-2 (same as planetscale db)

export const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

const limiter = rateLimit({
  uniqueTokenPerInterval: 250,
  interval: 60000,
});

const full_dept_names = new Set(Object.values(abbr_map));

export async function GET(request: NextRequest) {
  const response = NextResponse.next();

  const { searchParams } = new URL(request.url);
  const course_id = searchParams.get("course_id");
  const course_code = searchParams.get("course_code");
  const dept = searchParams.get("dept");

  // we won't handle the case where multiple are provided
  // instead we'll just handle them in order of course_id, course_code, dept
  // if none are provided, we'll return all courses

  if (course_id || course_code || dept) {
    try {
      await limiter.check(response, 250, "GLOBAL_TOKEN"); // 250 requests per minute
    } catch {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: "Too many requests. Rate Limit exceeded.",
            code: "rate_limited",
          },
        },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit":
              response.headers.get("X-RateLimit-Limit") ?? "-1",
            "X-RateLimit-Remaining":
              response.headers.get("X-RateLimit-Remaining") ?? "-1",
          },
        },
      );
    }

    if (course_id) return getByID(course_id, response);
    else if (course_code) return getByCode(course_code, response);
    else if (dept) return getByDept(dept, response);
  }

  try {
    await limiter.check(response, 50, "GETALL_GLOBAL_TOKEN"); // 50 requests per minute
  } catch {
    return NextResponse.json(
      { message: "rate-limited" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  }

  // get all courses
  const query_res = await conn.execute("SELECT * FROM courses");

  const max_age = 60 * 60 * 24 * 7 * 3; // 3 weeks in seconds
  return NextResponse.json(
    { success: true, data: query_res.rows },
    {
      status: 200,
      headers: {
        "CDN-Cache-Control": `max-age=${max_age}, s-maxage=${max_age}`,
        "X-RateLimit-Limit": response.headers.get("X-RateLimit-Limit") ?? "-1",
        "X-RateLimit-Remaining":
          response.headers.get("X-RateLimit-Remaining") ?? "-1",
      },
    },
  );
}

/* -------------------------------------------------------------------------- */
/*                          handling each query param                         */
/* -------------------------------------------------------------------------- */
/* ----------------------------------- id ----------------------------------- */
async function getByID(id: string, response: NextResponse) {
  try {
    const course_id = parseInt(id);

    if (isNaN(course_id)) {
      throw new Error("Invalid course_id");
    }

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE course_id = ?",
      [course_id],
    );

    // if course wasn't found, return 404
    if (query_res.size === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: `Course with course_id ${course_id} not found`,
            code: "not_found",
          },
        },
        {
          status: 404,
          headers: {
            "X-RateLimit-Limit":
              response.headers.get("X-RateLimit-Limit") ?? "-1",
            "X-RateLimit-Remaining":
              response.headers.get("X-RateLimit-Remaining") ?? "-1",
          },
        },
      );
    }

    // return course
    return NextResponse.json(
      {
        success: true,
        data: query_res.rows,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: `Internal server error: ${
            e instanceof Error ? e.message : "Unknown error"
          }`,
          code: "internal_server_error",
        },
      },
      {
        status: 500,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  }
}

/* ---------------------------------- code ---------------------------------- */
async function getByCode(code: string, response: NextResponse) {
  try {
    // cleaning up the course code
    let course_code = code.toUpperCase();
    course_code = course_code.replace("-", " ").replace("_", " ");

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE course_code = ?",
      [course_code],
    );

    // if course wasn't found, return 404
    if (query_res.size === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: `Course with course_code ${course_code} not found`,
            code: "not_found",
          },
        },
        {
          status: 404,
          headers: {
            "X-RateLimit-Limit":
              response.headers.get("X-RateLimit-Limit") ?? "-1",
            "X-RateLimit-Remaining":
              response.headers.get("X-RateLimit-Remaining") ?? "-1",
          },
        },
      );
    }

    // return course
    return NextResponse.json(
      {
        success: true,
        data: query_res.rows,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: `Internal server error: ${
            e instanceof Error ? e.message : "Unknown error"
          }`,
          code: "internal_server_error",
        },
      },
      {
        status: 500,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  }
}

/* ---------------------------------- dept ---------------------------------- */
async function getByDept(department: string, response: NextResponse) {
  try {
    // cleaning up the department name
    // first we'll check if its an abbreviation and convert it to the full name
    let dept = abbr_map.hasOwnProperty(department.toUpperCase())
      ? abbr_map[department.toUpperCase() as keyof typeof abbr_map]
      : department;

    // now clean up the department name in case it has a dash or underscore
    dept = dept.replace("-", " ").replace("_", " ");

    // TODO: allow valid variants of valid department names. Ex: "computer science" should be valid.
    // TODO: issue is that if we capitalize the first letter of each word, words like "and" will be capitalized

    // for now we'll just check if the given department is valid
    if (
      !abbr_map.hasOwnProperty(department.toUpperCase()) &&
      !full_dept_names.has(dept)
    ) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: "No department found with the given parameters.",
            code: "bad_request",
          },
        },
        {
          status: 400,
          headers: {
            "X-RateLimit-Limit":
              response.headers.get("X-RateLimit-Limit") ?? "-1",
            "X-RateLimit-Remaining":
              response.headers.get("X-RateLimit-Remaining") ?? "-1",
          },
        },
      );
    }

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE department = ?",
      [dept],
    );

    // if course wasn't found, return 404
    if (query_res.size === 0) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: {
            message: `No courses found for the given department.`,
            code: "not_found",
          },
        },
        {
          status: 404,
          headers: {
            "X-RateLimit-Limit":
              response.headers.get("X-RateLimit-Limit") ?? "-1",
            "X-RateLimit-Remaining":
              response.headers.get("X-RateLimit-Remaining") ?? "-1",
          },
        },
      );
    }

    // return courses
    return NextResponse.json(
      {
        success: true,
        data: query_res.rows,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          message: `Internal server error: ${
            e instanceof Error ? e.message : "Unknown error"
          }`,
          code: "internal_server_error",
        },
      },
      {
        status: 500,
        headers: {
          "X-RateLimit-Limit":
            response.headers.get("X-RateLimit-Limit") ?? "-1",
          "X-RateLimit-Remaining":
            response.headers.get("X-RateLimit-Remaining") ?? "-1",
        },
      },
    );
  }
}
