const SHEET_ID = "1681oFVd80odwKx_9mx5aG4-NOVLGIC7Sxu4RmwMr3mA";
const SHEET_NAME = encodeURIComponent("Stock ที่จะขายให้ลูกค้า");
const GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function parseGviz(text) {
  // Strip: /*O_o*/\ngoogle.visualization.Query.setResponse({...});
  const json = text.replace(/^[^(]+\(/, "").replace(/\);?\s*$/, "");
  const { rows } = JSON.parse(json).table;

  return rows
    .map(row => row.c.map(cell => (cell ? cell.v : null)))
    .filter(r => (r[9] || "") === "พร้อมขาย")
    .map(r => ({
      name:     String(r[0] || ""),
      code:     String(r[1] || ""),
      weight:   r[2] || 0,
      source:   String(r[3] || ""),
      date:     String(r[4] || ""),
      priceKg:  r[5] || 0,
      total:    r[6] || 0,
      image:    String(r[7] || ""),
      category: String(r[10] || "ปลา"),
      unit:     String(r[11] || "kg"),
    }));
}

export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    try {
      const res = await fetch(GVIZ_URL);
      const text = await res.text();
      const data = parseGviz(text);

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
