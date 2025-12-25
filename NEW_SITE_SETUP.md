# Pure Fire Nutritional - New Website Setup

## Quick Start

1. **Install dependencies:**
```bash
cd /workspaces/purefire-website
npm install react react-dom wouter lucide-react
npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer typescript @types/react @types/react-dom
```

2. **Initialize Tailwind:**
```bash
npx tailwindcss init -p
```

3. **Copy product images:**
You'll need to copy the product images from the original repo:
```bash
cp -r /workspaces/Purefirenutritional/client/public/products/* ./public/products/
cp /workspaces/Purefirenutritional/client/public/*.jpeg ./public/
```

4. **Update files:**
- Update `vite.config.ts` with path alias for `@`:
  ```typescript
  import path from 'path'
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  }
  ```

- Update `package.json` scripts:
  ```json
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
  ```

- Update `tailwind.config.js`:
  ```javascript
  module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: { extend: {} },
    plugins: []
  }
  ```

5. **Run dev server:**
```bash
npm run dev
```

6. **Build for production:**
```bash
npm run build
```

## File Structure

```
src/
├── components/
│   ├── Navigation.tsx      # Main nav with orange/rose gradient
│   ├── Footer.tsx          # Newsletter + links + social
│   └── ProductCard.tsx     # Reusable product card
├── pages/
│   ├── Home.tsx            # Hero + benefits + featured products
│   ├── Products.tsx        # Products grid with category filter
│   ├── ProductDetail.tsx   # Product details, variants, add to cart
│   ├── About.tsx           # About, mission, disclaimer
│   └── FAQ.tsx             # FAQ accordion
├── data/
│   └── products.ts         # Product data with pricing
├── App.tsx                 # Router setup
├── main.tsx                # Entry point
└── index.css               # Tailwind styles
```

## Color Scheme

- Primary: Orange (#f97316) to Rose (#f43f5e) gradient
- Text: White on gradient backgrounds, dark gray on white
- Accents: Orange and rose for interactive elements

## Features Included

✅ Product listing with filtering by category
✅ Product detail page with variants and pricing
✅ Responsive design (mobile, tablet, desktop)
✅ Newsletter signup in footer
✅ About page with mission and disclaimer
✅ FAQ accordion section
✅ Star ratings on products
✅ Add to cart (button feedback)
✅ Translucent desktop navigation
✅ All original images and logos

## Next Steps

1. Push to GitHub
2. Deploy to Vercel
3. Add backend integration for cart/orders
4. Configure Stripe for payments
5. Set up email notifications

## Notes

- All product data, pricing, and descriptions are from the original site
- Images and logos are copied from the original repo
- Design matches the original orange/rose theme
- Fully responsive on all devices
- Ready for integration with backend APIs
