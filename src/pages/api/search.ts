import type { NextApiRequest, NextApiResponse } from "next";

import OpenAI from "openai";
import rateLimit from "@/lib/rate-limit";

import { Pinecone } from "@pinecone-database/pinecone";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
  environment: "gcp-starter",
});

const index = pinecone.Index("tuffysearch");

const limiter = rateLimit({
  interval: 60 * 1000, // 60 seconds,
  uniqueTokenPerInterval: 500, // Max 500 users per second
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.status(405).json({
      success: false,
      data: null,
      error: {
        message: "Method not allowed. Please make a POST request instead.",
        code: "method_not_allowed",
      },
    });
  }

  try {
    await limiter.check(res, 100, "CACHE_TOKEN"); // 100 requests per minute
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

  const { search_query } = JSON.parse(req.body);

  if (!search_query) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        message: "Please provide a search query.",
        code: "missing_search_query",
      },
    });
  }

  // TODO: cleanup search_query

  try {
    // openai call to get the vector
    const response = await openai.embeddings.create({
      input: search_query,
      model: "text-embedding-ada-002",
    });

    // extract vector from the response
    const vector = response.data[0].embedding;

    // query pinecone for similar vectors
    const results = await index.query({
      vector,
      topK: 20,
      includeMetadata: true,
      includeValues: false,
    });

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      return res.status(500).json({
        success: false,
        data: null,
        error: {
          message: error.message,
          code: "openai_api_error",
        },
      });
    } else if (error instanceof Error) {
      return res.status(500).json({
        success: false,
        data: null,
        error: {
          message: error.message,
          code: "internal_server_error",
        },
      });
    } else {
      return res.status(500).json({
        success: false,
        data: null,
        error: {
          message: "Internal Server Error",
          code: "internal_server_error",
        },
      });
    }
  }
}
