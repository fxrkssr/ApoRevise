# āPO Michelin Experience Skill

This project defines the high-end ordering experience for āPO, a Michelin-standard fishery catalog.

## Design Philosophy
- **Luxury Aesthetic:** Uses a Deep Charcoal background (`oklch(12% 0.02 240)`) with Gold accents to signify premium quality.
- **Story-Driven:** Focuses on the "Fisherman's Handpick" narrative, sourcing directly from artisanal fisheries in Koh Lipe and Phuket.
- **User-Friendly Multi-Selection:** Allows chefs and high-end customers to select multiple items across categories and review them in a summary dock before ordering via Line OA.
- **Real-Time Inventory:** Connects directly to a Google Sheets API to ensure that only the daily available catch is displayed.

## Key Technical Features
- **Responsive 2-Column Grid:** Optimized for mobile scrolling, showing 2 items per row to reduce vertical travel while maintaining clarity.
- **Unique Selection Logic:** Every item is assigned a `uniqueId` (Code + Row Index) to prevent selection collisions, even if items share the same product code.
- **Source Filtering:** Dedicated filters for "Koh Lipe" and "Phuket" to highlight the diversity of the catch.
- **Line OA Integration:** Automatically compiles the selected items into a professional message for the Line Official Account.

## Operational Workflow
1. **Update Google Sheets:** Fisherman or staff update the available catch, weight, and price in the shared Google Sheet.
2. **Instant Sync:** The website fetches the latest data on load (or refresh).
3. **Selection & Summary:** User taps fish cards to select, reviews the floating dock, and clicks "Order".
4. **Checkout:** The summary modal provides a final check before opening Line.

## File Structure
- `index.html`: The main application entry point (Standalone).
- `mppkllsa-logo-apo.png`: The primary brand identity logo.
- `SKILL.md`: Design and operational guidelines.
