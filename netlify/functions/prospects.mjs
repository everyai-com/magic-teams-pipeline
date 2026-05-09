import { getStore } from "@netlify/blobs";

// Pre-seeded with Satya's current pipeline from strategy.md
const INITIAL_DATA = {
  prospects: [
    {
      id: "1",
      name: "Colleen",
      company: "",
      email: "",
      status: "warm",
      nextAction: "Send proposal after discovery call",
      followUpDate: "2026-05-09",
      potentialValue: "",
      source: "Midori referral",
      notes: "Discovery done 2026-05-05. Interested. Midori referral — priority.",
      createdAt: "2026-05-07T00:00:00Z",
      updatedAt: "2026-05-07T00:00:00Z"
    },
    {
      id: "2",
      name: "Bondada Group CFO",
      company: "Bondada Group",
      email: "",
      status: "contacted",
      nextAction: "Follow up call — reach out 2 days before May 10",
      followUpDate: "2026-05-10",
      potentialValue: "Enterprise",
      source: "Direct",
      notes: "They have an internal AI team. Positioning: augmenting not replacing. Reach out ~May 10.",
      createdAt: "2026-05-07T00:00:00Z",
      updatedAt: "2026-05-07T00:00:00Z"
    },
    {
      id: "3",
      name: "Brandy Wong",
      company: "",
      email: "",
      status: "new",
      nextAction: "Send DM immediately — overdue",
      followUpDate: "2026-05-08",
      potentialValue: "$5K+",
      source: "Midori referral",
      notes: "Midori referral. DM is pending and overdue. Highest priority outreach.",
      createdAt: "2026-05-07T00:00:00Z",
      updatedAt: "2026-05-07T00:00:00Z"
    },
    {
      id: "4",
      name: "Midori Verity",
      company: "",
      email: "",
      status: "warm",
      nextAction: "Book Session 4 — capture testimonial",
      followUpDate: "2026-05-09",
      potentialValue: "Referrals unlock",
      source: "Pilot client",
      notes: "Pilot ~99% done. Session 4 needed for testimonial. Referrals: Colleen, Chris, Nicholas. Brandy Wong priority.",
      createdAt: "2026-05-07T00:00:00Z",
      updatedAt: "2026-05-07T00:00:00Z"
    },
    {
      id: "5",
      name: "Jamie Nicholas",
      company: "RealEstateAgentPro.ai",
      email: "",
      status: "contacted",
      nextAction: "Keep momentum on platform development",
      followUpDate: "2026-05-15",
      potentialValue: "LPT brokerage domino",
      source: "Direct",
      notes: "Platform in development with Jamie. Max Mills-Zikmund is entry point to LPT brokerage.",
      createdAt: "2026-05-07T00:00:00Z",
      updatedAt: "2026-05-07T00:00:00Z"
    }
  ]
};

export default async (req, context) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  const store = getStore({ name: "pipeline", consistency: "strong" });

  // GET — return all prospects
  if (req.method === "GET") {
    try {
      let data = await store.get("prospects", { type: "json" });
      if (!data) {
        data = INITIAL_DATA;
        await store.set("prospects", JSON.stringify(data));
      }
      return Response.json(data, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    } catch (err) {
      // Fallback to initial data if blobs not available (local dev)
      return Response.json(INITIAL_DATA, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    }
  }

  // POST — save all prospects
  if (req.method === "POST") {
    // Auth check
    const token = process.env.ACCESS_TOKEN;
    if (token) {
      const authHeader = req.headers.get("Authorization") || "";
      if (authHeader !== `Bearer ${token}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    try {
      const body = await req.json();
      await store.set("prospects", JSON.stringify(body));
      return Response.json({ ok: true, savedAt: new Date().toISOString() }, {
        headers: { "Access-Control-Allow-Origin": "*" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config = {
  path: "/api/prospects"
};
