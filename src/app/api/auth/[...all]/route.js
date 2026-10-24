import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = toNextJsHandler(auth);

export const GET = async (req) => {
  try {
    return await handlers.GET(req);
  } catch (err) {
    console.error("Better-Auth GET Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

export const POST = async (req) => {
  try {
    return await handlers.POST(req);
  } catch (err) {
    console.error("Better-Auth POST Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};

