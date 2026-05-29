---
name: apo-revise
description: >
  Context สำหรับโปรเจกต์ ApoRevise — เว็บแคตตาล็อกอาหารทะเลลักซ์ชัวรี่ āPO
  ใช้ skill นี้ทุกครั้งที่ทำงานในโปรเจกต์นี้ เพื่อเข้าใจ architecture,
  การ deploy, และ decision ต่างๆ ที่ผ่านมา
---

# āPO — ApoRevise Project Context

## ภาพรวม

เว็บแคตตาล็อกอาหารทะเลสำหรับลูกค้า premium ชื่อ **āPO** (APO = ทะเล ภาษาไทย)
ลูกค้าเปิดเว็บ เลือกปลา แล้วกดส่งคำสั่งซื้อเข้า Line OA ของเชฟโดยตรง

**Stack:** HTML ไฟล์เดียว + Cloudflare Worker + Google Sheets

---

## Architecture

```
index.html  (GitHub Pages)
    │
    │  fetch()
    ▼
Cloudflare Worker  (apo-api.fxrkssr.workers.dev)
    │
    │  fetch gviz API
    ▼
Google Sheets  (public)
Sheet ID: 1681oFVd80odwKx_9mx5aG4-NOVLGIC7Sxu4RmwMr3mA
Sheet name: "Stock ที่จะขายให้ลูกค้า"
```

### ทำไมถึงใช้ Cloudflare Worker แทน GAS ตรงๆ

GAS (Google Apps Script) มีปัญหาหลายอย่างบนมือถือ:
- Cold start 15–20 วินาที
- Google block server-side fetch → คืน HTML แทน JSON
- CORS ทำงานได้แค่บน browser (in-app browser LINE/Facebook มักบล็อก)

**Worker แก้ปัญหาได้เพราะ:**
- ดึงข้อมูลจาก **gviz API** ของ Sheets ตรงๆ (ไม่ผ่าน GAS)
- gviz API ทำงาน server-side ได้ถ้า Sheet เป็น public
- Worker ตั้ง `Access-Control-Allow-Origin: *` เอง
- Response time < 100ms (edge, ไม่มี cold start)

---

## Files สำคัญ

| File | หน้าที่ |
|---|---|
| `index.html` | ทั้งหมด — UI, CSS, JS ในไฟล์เดียว |
| `worker/src/index.js` | Cloudflare Worker — ดึง gviz, parse, return JSON |
| `worker/wrangler.toml` | Config Worker (name: `apo-api`) |
| `apps-script/WebApp.gs` | GAS เดิม — ยังอยู่แต่ไม่ได้ใช้แล้ว |

---

## Google Sheets Column Map

| Col | Index | Field | หมายเหตุ |
|---|---|---|---|
| A | 0 | name | ชื่อปลา |
| B | 1 | code | รหัส |
| C | 2 | weight | น้ำหนัก (number) |
| D | 3 | source | แหล่งที่มา เช่น หลีเป๊ะ, ภูเก็ต |
| E | 4 | date | วันที่ |
| F | 5 | priceKg | ราคา/กก. (number) |
| G | 6 | total | ยอดรวม (number) |
| H | 7 | image | URL รูป (Google Drive) |
| I | 8 | — | ไม่ได้ใช้ |
| J | 9 | status | **filter: เฉพาะแถวที่ = "พร้อมขาย"** |
| K | 10 | category | "ปลา" หรือ "หอย/ทะเล" |
| L | 11 | unit | "kg" หรือ "กก." |

---

## Worker — วิธี Deploy

```bash
cd worker
npx wrangler login   # ครั้งแรกครั้งเดียว
npx wrangler deploy
```

URL หลัง deploy: `https://apo-api.fxrkssr.workers.dev`

### Worker Logic (worker/src/index.js)

1. Fetch `https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet=...`
2. Strip wrapper `/*O_o*/\ngoogle.visualization.Query.setResponse(...)` ออก
3. Parse JSON → `table.rows`
4. Map `row.c[i].v` → object fields ตาม column map ข้างบน
5. Filter เฉพาะ `r[9] === "พร้อมขาย"`
6. Return JSON พร้อม `Access-Control-Allow-Origin: *` และ `Cache-Control: public, max-age=120`

---

## CSS — สิ่งที่ต้องระวัง

### oklch fallback pattern (สำคัญมาก)

**ผิด** — browser เก็บค่าสุดท้าย, hex fallback ไม่ทำงานเลย:
```css
/* อย่าทำแบบนี้ */
:root {
  --bg: #1a3a68;
  --bg: oklch(28% 0.07 240);  /* ← ทับค่าแรกทิ้ง */
}
```

**ถูก** — ใช้ `@supports`:
```css
:root { --bg: #1a3a68; }   /* hex fallback สำหรับ browser เก่า */
@supports (color: oklch(0% 0 0)) {
  :root { --bg: oklch(28% 0.07 240); }   /* modern browser */
}
```

### Color Scheme (Ocean Blue)

```css
--bg:         #1a3a68   /* deep ocean navy */
--surface:    #234a7e   /* card/surface */
--fg:         #d8eeff   /* text สีฟ้าอ่อน */
--muted:      #5a96c8   /* text รอง */
--gold:       #c9a84c   /* accent — warm contrast กับ blue */
--gold-glow:  rgba(201, 168, 76, 0.3)
--border:     #2d5a86
```

Sticky nav bar ต้องใช้ `background: var(--bg)` เต็มๆ ห้ามใช้ rgba + backdrop-filter เพราะจะทำให้เห็นเป็นลายคาด

---

## JS — สิ่งที่ต้องระวัง

### render() guard

```js
function render() {
  if (allItems.length === 0) return;  // อย่าลบออก!
  // ...
}
```

ถ้าลบออก: user กด tab/chip ก่อน data โหลดเสร็จ → `root.innerHTML = ''` → หน้าว่าง → loading indicator หาย → `showError()` ก็ทำงานไม่ได้เพราะ element ถูกลบไปแล้ว

### loadData()

ใช้ `fetch()` ธรรมดา (Worker จัดการ CORS ให้แล้ว) + 10s timeout:

```js
function loadData() {
  var errorTimer = setTimeout(showError, 10000);
  fetch(API_URL)
    .then(r => r.json())
    .then(data => { clearTimeout(errorTimer); processData(data); })
    .catch(() => { clearTimeout(errorTimer); showError(); });
}
```

---

## Order Flow

1. User เลือกรายการ → กด "สั่งซื้อสินค้า"
2. Modal แสดงสรุป
3. กด "ส่งเข้า Line" → เปิด Line OA `@885iivsu`
4. ข้อความที่ส่ง (neutral — ห้ามใส่ครับ/ค่ะ หรือ define gender):

```
สนใจสั่งซื้อ
- ปลาเก๋าลายเมฆ/Cloudy Grouper (5 kg) : 2,300 ฿
- ปลาอีคุดปากหมู/Harry Hot Lips (4 kg) : 1,920 ฿
ยอดรวม 4,220 ฿
```

---

## Tabs และ Filter

| Tab | `category` ใน Sheets |
|---|---|
| The Fish | "ปลา" |
| Shell & Sea | "หอย/ทะเล" |

Filter chips: ทั้งหมด / จากหลีเป๊ะ / จากภูเก็ต — match กับ field `source`
