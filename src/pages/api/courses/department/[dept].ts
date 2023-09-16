import type { NextApiRequest, NextApiResponse } from "next";
import type { CourseObject, ErrorObject } from "@/pages/api/courses";

import abbr_map from "@/data/11034_80.json";

import rateLimit from "@/lib/rate-limit";

import { conn } from "@/pages/api/courses";

type ResponseData = {
  success: boolean;
  data: CourseObject[] | null;
  error?: ErrorObject;
};

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds,
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

// flipped version of the abbr_map
const full_dept_names = new Set(Object.values(abbr_map));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      data: null,
      error: {
        message: "Method not allowed. Please make a GET request instead.",
        code: "method_not_allowed",
      },
    });
  }

  try {
    await limiter.check(res, 10, "CACHE_TOKEN");
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

    // TODO: allow variants of valid department names. Ex: "computer science" should be valid for.
    // TODO: issue is that if we capitalize the first letter of each word, words like "and" will be capitalized

    // check if the department is valid
    if (
      !abbr_map.hasOwnProperty(dept.toUpperCase()) &&
      !full_dept_names.has(clean_dept)
    ) {
      return res.status(404).json({
        success: false,
        data: null,
        error: {
          message: "No department found with the given parameters.",
          code: "not_found",
        },
      });
    }

    const query_res = await conn.execute(
      "SELECT * FROM courses WHERE department = ?",
      [clean_dept]
    );

    return res.status(200).json({
      success: true,
      data: query_res.size > 0 ? (query_res.rows as CourseObject[]) : null,
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
