import type { NextApiRequest, NextApiResponse } from "next";

import abbr_map from "@/data/11034_80.json";

import rateLimit from "@/lib/rate-limit";

import { connect } from "@planetscale/database";

export const conn = connect({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
});

export type CourseObject = {
  title: string;
  description: string;
  department: string;
  course_id: number;
  course_code: string;
};

export type ErrorObject = {
  message: string;
  code: string;
};

type ResponseData = {
  success: boolean;
  data: CourseObject[] | CourseObject | null;
  error?: ErrorObject;
};

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds,
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

const full_dept_names = new Set(Object.values(abbr_map));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  if (req.method !== "GET") {
    res.status(405).json({
      success: false,
      data: null,
      error: {
        message: "Method not allowed. Please make a GET request instead.",
        code: "method_not_allowed",
      },
    });
  }

  const { course_id, course_code, dept } = req.query;

  // we won't handle the case where multiple are provided
  // instead we'll just handle them in order of course_id, course_code, dept
  // if none are provided, we'll return all courses (TEMPORARILY DISABLED)
  if (course_id) {
    return getByID(req, res);
  } else if (course_code) {
    return getByCourseCode(req, res);
  } else if (dept) {
    return getByDepartment(req, res);
  }

  try {
    await limiter.check(res, 10, "DEFAULT_CACHE_TOKEN"); // 10 requests per minute
  } catch {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        message:
          "Too many requests. Rate Limit exceeded. 10 requests per minute allowed.",
        code: "rate_limited",
      },
    });
  }
  /* ---------------------- TODO: find best way to cache ---------------------- */
  try {
    // const _maxAge = 1 * 60 * 60 * 24 * 7; // 1 week
    // res.setHeader(
    //   "Cache-Control",
    //   `public, s-maxage=${_maxAge}, stale-while-revalidate`,
    // );

    const query_res = await conn.execute("SELECT * FROM courses");

    if (query_res.size === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "No courses found.",
          code: "not_found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: query_res.rows as CourseObject[],
    });

    // return res.status(503).json({
    //   success: false,
    //   data: null,
    //   error: {
    //     message: "This endpoint is temporarily disabled.",
    //     code: "temporarily_disabled",
    //   },
    // });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        message: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        code: "internal_server_error",
      },
    });
  }
}

async function getByID(req: NextApiRequest, res: NextApiResponse) {
  try {
    await limiter.check(res, 50, "GLOBAL_CACHE_TOKEN"); // 50 requests per minute
  } catch {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        message:
          "Too many requests. Rate Limit exceeded. 50 requests per minute allowed.",
        code: "rate_limited",
      },
    });
  }

  try {
    const { course_id } = req.query;

    const int_course_id = parseInt(course_id as string);

    if (isNaN(int_course_id)) {
      throw new Error("Invalid course_id");
    }

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE course_id = ?",
      [int_course_id],
    );

    if (query_res.size === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          message: `Course with course_id ${int_course_id} not found`,
          code: "not_found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: query_res.rows[0] as CourseObject,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        message: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        code: "internal_server_error",
      },
    });
  }
}

async function getByCourseCode(req: NextApiRequest, res: NextApiResponse) {
  try {
    await limiter.check(res, 50, "GLOBAL_CACHE_TOKEN"); // 50 requests per minute
  } catch {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        message:
          "Too many requests. Rate Limit exceeded. 50 requests per minute allowed.",
        code: "rate_limited",
      },
    });
  }

  try {
    const { course_code } = req.query;

    if (typeof course_code !== "string") {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Invalid request. Please check your request and try again.",
          code: "invalid_request",
        },
      });
    }

    // cleaning up course_code
    // course_code in the paramaters should contain a dash but we need them to be space separated
    // we should also make sure that the course_code is all uppercase

    let clean_cc = course_code.toUpperCase();
    clean_cc = clean_cc.replace("-", " ").replace("_", " ");

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE course_code = ?",
      [clean_cc],
    );

    if (query_res.size === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          message: `Course with course_code ${course_code} not found`,
          code: "not_found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: query_res.rows as CourseObject[],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        message: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        code: "internal_server_error",
      },
    });
  }
}

async function getByDepartment(req: NextApiRequest, res: NextApiResponse) {
  try {
    await limiter.check(res, 50, "GLOBAL_CACHE_TOKEN"); // 50 requests per minute
  } catch {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        message:
          "Too many requests. Rate Limit exceeded. 50 requests per minute allowed.",
        code: "rate_limited",
      },
    });
  }

  try {
    const { dept } = req.query;

    if (typeof dept !== "string") {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "Invalid request. Please check your request and try again.",
          code: "invalid_request",
        },
      });
    }

    // if its an abbreviation, convert it to the full name
    let clean_dept = abbr_map.hasOwnProperty(dept.toUpperCase())
      ? abbr_map[dept.toUpperCase() as keyof typeof abbr_map]
      : dept;

    // now clean up the department name in case it has a dash or underscore
    clean_dept = clean_dept.replace("-", " ").replace("_", " ");

    // TODO: allow variants of valid department names. Ex: "computer science" should be valid.
    // TODO: issue is that if we capitalize the first letter of each word, words like "and" will be capitalized

    // for now we'll just check if the given department is valid
    if (
      !abbr_map.hasOwnProperty(dept.toUpperCase()) &&
      !full_dept_names.has(clean_dept)
    ) {
      return res.status(400).json({
        success: false,
        data: null,
        error: {
          message: "No department found with the given parameters.",
          code: "bad_request",
        },
      });
    }

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE department = ?",
      [clean_dept],
    );

    if (query_res.size === 0) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "No courses found for the given department.",
          code: "not_found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: query_res.rows as CourseObject[],
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: null,
      error: {
        message: `Internal server error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        code: "internal_server_error",
      },
    });
  }
}
