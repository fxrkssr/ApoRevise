const GAS_URL =
  "https://script.google.com/macros/s/AKfycbxxjhG6wbxg9Okvui3_wW0DlUhxGXwPSP5aCOzeM7ahevlD4cYv4HicKsI3I5ilUTLK2A/exec";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      const res = await fetch(GAS_URL, { redirect: "follow" });
      const data = await res.json();

      return new Response(JSON.stringify(data), {
        headers: {
          ...CORS,
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=120",
        },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: String(err) }), {
        status: 502,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }
  },
};
