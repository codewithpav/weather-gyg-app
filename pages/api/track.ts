import type { NextApiRequest, NextApiResponse } from "next";

type TrackBody = {
  name?: string;
  payload?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const body = (req.body || {}) as TrackBody;
  if (!body.name || typeof body.name !== "string") {
    return res.status(400).json({ error: "Invalid event payload." });
  }

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.info("[track]", {
      name: body.name,
      payload: body.payload || {},
      timestamp: body.timestamp || new Date().toISOString(),
      path: body.path || "",
    });
  }

  return res.status(204).end();
}
