TRENDINGDAILYFINDS REAL ADMIN PANEL

This package uses:
- Plain HTML/CSS/JavaScript
- Supabase Authentication
- Supabase PostgreSQL database

SETUP

1. Create a Supabase project.
2. Open SQL Editor and run supabase.sql.
3. Go to Authentication -> Users and create your admin email/password.
4. In Supabase Project Settings -> API, copy:
   - Project URL
   - anon/public key
5. Open admin.js and replace:
   PASTE_YOUR_SUPABASE_PROJECT_URL_HERE
   PASTE_YOUR_SUPABASE_ANON_KEY_HERE
6. Upload admin.html, admin.css and admin.js to your GitHub repository.
7. Open:
   https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/admin.html

IMPORTANT SECURITY
- Only use the Supabase anon/public key in the browser.
- NEVER put the Supabase service_role/secret key in admin.js.
- The database policies allow public reading of active products and authenticated users to manage products.
- For a single-owner site, only create your own admin user in Supabase Authentication.

WHAT IT DOES
- Secure email/password login through Supabase Auth
- Add products
- Edit products
- Delete products
- Set price
- Set category
- Set rating/review count
- Add image URL
- Add AliExpress/affiliate URL
- Add badge
- Enable/disable products

NEXT STEP
The public index.html should be updated to read active products from the Supabase products table. The current admin panel is ready for that integration.
