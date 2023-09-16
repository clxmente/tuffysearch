import type { NextApiRequest, NextApiResponse } from "next";

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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
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

  try {
    await limiter.check(res, 3, "CACHE_TOKEN"); // 3 requests per minute
  } catch {
    return res.status(429).json({
      success: false,
      data: null,
      error: {
        message:
          "Too many requests. Rate Limit exceeded. 3 requests per minute allowed.",
        code: "rate_limited",
      },
    });
  }

  return res.status(503).json({
    success: false,
    data: null,
    error: {
      message: "Service unavailable",
      code: "service_unavailable",
    },
  });
}
