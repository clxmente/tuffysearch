import type { NextApiRequest, NextApiResponse } from "next";
import type { CourseObject, ErrorObject } from "@/pages/api/courses";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
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
    await limiter.check(res, 100, "CACHE_TOKEN");
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
          message: "Course not found.",
          code: "course_not_found",
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
