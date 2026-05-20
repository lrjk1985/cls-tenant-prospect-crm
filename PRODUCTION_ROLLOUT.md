# Tenant Prospect CRM Production Rollout

## Backend

- Supabase project: `Prospect CRM`
- Project ref: `dnmfqcjownhzngjdngdi`
- App URL: `https://tenant-prospect-crm.vercel.app`
- Storage bucket: `crm-files`
- Upload limit: 10 MB

## Supabase Setup Completed

- Created shared CRM database tables.
- Enabled Row Level Security on every CRM table.
- Created private Supabase Storage bucket for uploaded files.
- Added Storage access policies for active logged-in users.
- Added `profiles` table for admin/member access.
- Added signup trigger: first user becomes active admin, later users start inactive member.
- Deployed admin-only Edge Function: `manage-users`.
- Ran Supabase security advisor and cleared security warnings.

## Manual Supabase Dashboard Step

Open Supabase Dashboard > Authentication > URL Configuration:

- Set Site URL to `https://tenant-prospect-crm.vercel.app`
- Add Redirect URL `https://tenant-prospect-crm.vercel.app/**`

This is needed for email confirmation and invite links to land back on the CRM.

## First Admin

1. Redeploy the app to Vercel.
2. Open the live URL.
3. Create the first account.
4. The first account becomes the active admin automatically.
5. Use the Admin tab to invite or activate other users.

## Backups

Supabase database backups cover database records. Supabase Storage files are not part of database backups, so uploaded PDFs/photos should be backed up separately once the app is in day-to-day use.

Recommended operating procedure:

- Use Supabase database backups for records.
- Keep local/source copies of important PDFs/photos.
- Periodically export or mirror the `crm-files` Storage bucket for operational backup.

## Redeploy

From Terminal:

```bash
cd "/Users/kennethlee/Documents/Codex/2026-04-28/i-am-a-landlord-i-would/Tenant Prospect CRM"
export PATH="$HOME/.nvm/versions/node/v24.15.0/bin:$PATH"
vercel deploy --prod
```
