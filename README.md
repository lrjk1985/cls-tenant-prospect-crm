# Tenant Prospect CRM

A production-ready CRM for tracking tenant prospects, units, agents, and timestamped interactions.

Dates in the CRM use `DD-MM-YYYY` format.

## Open the CRM

Open `index.html` in a browser.

## Demo Deploy To Vercel

This demo version can be deployed as a static Vercel site.

The current version uses Supabase Auth, shared Supabase database tables, and private Supabase Storage.

Recommended demo deployment path:

1. Put the files in this folder into a GitHub repository.
2. In Vercel, choose Add New Project.
3. Import that GitHub repository.
4. Use the default framework/static settings.
5. Deploy.

## Production Setup

This app is connected to the Supabase project `Prospect CRM`.

Production backend pieces:

- Supabase Auth email/password login.
- Shared Supabase database tables for prospects, prospect interactions, units, unit files, agents, agent notes, and user profiles.
- Private Supabase Storage bucket `crm-files` with a 10 MB file limit.
- Admin/member roles through the `profiles` table.
- Admin-only Edge Function `manage-users` for inviting and approving users.
- Row Level Security enabled on all CRM tables and Storage files.

First user flow:

1. Open the deployed app.
2. Create the first account.
3. The first account becomes the active admin automatically.
4. Use the Admin tab to invite or activate other users.

Supabase dashboard setting still required:

1. Open Supabase Dashboard > Authentication > URL Configuration.
2. Set Site URL to `https://tenant-prospect-crm.vercel.app`.
3. Add `https://tenant-prospect-crm.vercel.app/**` as an allowed redirect URL.

Backup note: Supabase database backups cover database records. Storage files are separate from database backups, so important uploaded files should also be backed up or mirrored from Supabase Storage when the app is used operationally.

## What It Does

- Add tenant prospects with name, business name, agency, agent, building, unit number, trade, contact number, email, Telegram handle, website, social media, and status.
- Record interaction notes with automatic date and time stamps.
- Attach one file to an interaction. Attachments are saved in private Supabase Storage and should be 10 MB or smaller.
- Search prospects by name, business, building, unit number, trade, phone, email, Telegram, website, social media, status, interaction note, contact date, or contact year.
- Filter prospects by contacted date, year, or trade.
- Show the 3 most recently active prospects by default, with the full list available through search or filters.
- Import prospects from CSV.
- Export prospects and interactions to CSV. Prospect exports include one row per interaction, plus interaction number, interaction total, and attachment file details when present.
- Manage units in a separate Units tab with pricing, availability, floor plan PDFs, M&E PDFs, and photos.
- Manage agents in a separate Agents tab with contact details, grading, and timestamped notes.
- Save records in the shared Supabase cloud database.

## CSV Import

The prospect import accepts a header row with these columns:

```csv
Name,Business Name,Agency,Agent,Building,Unit Number,Trade,Contact Number,Email Address,Telegram Handle,Website,Social Media,Status,Interaction Timestamp,Interaction Note
```

Name, trade, and contact number are required when saving prospects in the app and when importing CSV rows. If interaction timestamp and interaction note are included, the CRM imports those into the prospect timeline.

Timestamps can use `DD-MM-YYYY HH:mm`, such as `28-04-2026 10:30`.

The unit import accepts a header row with these columns:

```csv
Unit Number,Price Per Square Foot,Last Date of Operation,Available Date,Current Price,Market Price
```

Unit number is required. Dates should use `DD-MM-YYYY`, such as `15-05-2026`. Unit CSV imports update existing units when the unit number already exists.

The agent import accepts a header row with these columns:

```csv
Agent Name,Agency,Contact Number,Email Address,Telegram Handle,Website,Social Media,Grade,Interaction Timestamp,Interaction Note
```

Agent name is required. Grades can be `A`, `B`, `C`, or `Watchlist`. Agent CSV imports update existing agents when the agent name, agency, phone, email, and Telegram handle match.

## Files

- [index.html](index.html) - the app screen
- [styles.css](styles.css) - the visual design
- [app.js](app.js) - the CRM behavior and local saving
- [tenant-prospect-import-template.csv](tenant-prospect-import-template.csv) - prospect import template
- [unit-import-template.csv](unit-import-template.csv) - unit import template
- [agent-import-template.csv](agent-import-template.csv) - agent import template
