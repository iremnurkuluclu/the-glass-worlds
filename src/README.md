# The Glass Worlds

The Glass Worlds is a bilingual snow-globe workshop and shop experience built
with React, Vite, Supabase and Framer Motion. Visitors can discover the making
process, reserve a workshop, buy snow-globe kits, explore maker-created globes
and manage their account from one responsive website.

## Main features

- Turkish and English interface controlled from the homepage
- Supabase email/password authentication
- Workshop reservation with participant selection
- Snow-globe kit and maker marketplace
- Favorites, shopping cart and checkout preview
- “Added to cart” confirmation and continue-shopping action
- Customer account with:
  - profile details
  - workshop registrations
  - order history
  - expandable delivery-status timeline
  - support requests
- Owner-only administration panel with:
  - overview metrics
  - product management
  - messages and support requests
  - orders and workshop statistics
  - member search
  - account enable/disable controls
  - protected member deletion

## Recent updates

- Reordered the workshop reservation and making-process navigation items.
- Added cart support for maker-created snow globes.
- Added favorites to the Christmas Bear and Little Prince products.
- Added bilingual maker names, product stories and descriptions.
- Updated the White Swan by Derya and A Piece of the Sea by Peter.
- Removed customer tracking codes while keeping an expandable delivery timeline.
- Added workshop reservations to checkout and account history.
- Added an owner-only member-management screen.
- Added secure Supabase Edge Function actions for disabling and deleting members.

## Technology

- React 19
- Vite 8
- React Router
- Framer Motion
- Supabase Auth, Database, Storage and Edge Functions

## Local setup

Requirements:

- Node.js 20 or newer
- A Supabase project

Install dependencies:

```bash
npm install
```

Create a local `.env` file:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Run the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

## Supabase member-management setup

1. Run `supabase/admin-members.sql` in Supabase SQL Editor.
2. Add the Edge Function secret:

```text
ADMIN_EMAIL=nirem587@gmail.com
```

3. Deploy `supabase/functions/admin-users/index.ts` as the Edge Function used by
   the application. In this project the deployed function is named
   `hyper-responder`.
4. Never place the Supabase service-role/secret key in `src`, `.env` or GitHub.

Detailed Turkish instructions are available in
[`ADMIN-UYE-KURULUMU.md`](./ADMIN-UYE-KURULUMU.md).

## Important payment note

The current checkout is a demonstration/preview flow. It records the order in
Supabase but does not charge a real bank card. A production payment provider
such as Stripe must be integrated before accepting real payments.

## Project structure

```text
src/                         React application
src/assets/                  Production images and visual assets
supabase/admin-members.sql   Member-management database update
supabase/functions/          Protected server-side admin actions
public/                      Public assets
```

## Security

- The admin route is visible only to the configured owner account.
- Member actions are re-verified by the server-side Edge Function.
- The owner account cannot disable or delete itself.
- Deleted accounts are anonymized while historical order records are retained.
- Environment files and credentials are excluded from Git.

