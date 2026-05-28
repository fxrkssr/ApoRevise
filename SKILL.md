# āPO Michelin Experience Design System

## Visual Identity
- **Logo:** 300px height, centered.
- **Background:** Deep Obsidian (#060b13).
- **Surface:** #0a101a (Slightly lighter than background for cards).
- **Accent:** Gold (oklch(78% 0.10 85)).
- **Typography:**
    - Display: Cormorant Garamond (Serif)
    - Body: Prompt (Thai) / Inter (English)

## Features
- **Real-time Data:** Fetches directly from Google Sheets API.
- **Multi-Selection:** Customers can select multiple items to order.
- **Dynamic Filtering:** Supports filtering by source (หลีเป๊ะ, ภูเก็ต) and category (The Fish, Shell & Sea).
- **Mobile Optimized:** 2-column grid on mobile to reduce scrolling.
- **One-Tap Checkout:** Generates a pre-filled Line message with all selected items.

## Development Notes
- Selection bug was fixed by assigning a `uniqueId` based on the row index from the API response.
- Background color was updated to match the high-end reference site provided.
