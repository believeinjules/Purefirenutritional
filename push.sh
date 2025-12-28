#!/bin/bash
cd /workspaces/Purefirenutritional
git config user.email "copilot@github.com"
git config user.name "GitHub Copilot"
git add client/src/pages/ProductDetail.tsx
git commit -m "ProductDetail: Complete UI with images, pricing, benefits, cart, wishlist, and related products"
git push origin main
echo "Push complete"
