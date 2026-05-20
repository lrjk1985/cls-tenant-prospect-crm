# Tenant Prospect CRM V2 Staging

## Branch

- Git branch: `v2`
- Local folder: `/Users/kennethlee/Documents/Codex/2026-04-28/i-am-a-landlord-i-would/TenantCRM-Git`

## Supabase Staging

- Project name: `Tenant Prospect CRM V2 Staging`
- Project ref: `jzrpwwoszryntudsxida`
- URL: `https://jzrpwwoszryntudsxida.supabase.co`
- Storage bucket: `crm-files`
- Upload limit: 10 MB

The V2 branch points to this staging Supabase project. Do not point V2 preview work at production unless preparing a controlled release.

## First V2 Admin

After deploying the V2 preview URL:

1. Open the V2 preview URL.
2. Create the first account.
3. The first account becomes the active admin for staging.
4. Use the Admin tab to invite or approve staging users.

## Supabase Auth Redirects

Add the V2 preview URL to Supabase Authentication > URL Configuration before testing email confirmation or invites.
