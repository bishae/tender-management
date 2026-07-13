# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Settings page (`/settings`) to link or unlink Microsoft Entra ID from an authenticated account
- Microsoft Entra ID SSO via Better Auth (`socialProviders.microsoft`)
- Landing page and Better Auth email/password authentication
- Buyer and Vendor organizations with domains, members, and groups
- Domain-based auto-membership on signup; `/pending` for users without an org
- Platform admin UI (`/admin`) to manage orgs, domains, groups, and user assignment
- Creator portal: tender CRUD, ordered group approval chains, submit/approve/reject/publish, approvals inbox
- Bidder portal: published tender discovery with category/expertise filters
- `PLATFORM_ADMIN_EMAIL` env for seeding the first platform admin on signup
- Feature catalog updates in `docs/features.md`
- DB repair scripts under `scripts/` for org schema and timestamptz alignment

### Changed

- Portal access is driven by organization membership instead of a signup role picker or hard-coded L1–L3 user roles
- Creator, admin, and bidder portals use a collapsible sidebar instead of a top navigation bar
- App typography now uses Noto Sans instead of Outfit and Syne
- UI component headings use the same Noto Sans font as the rest of the app

### Fixed

- Microsoft SSO `invalid_code` on Vercel by aligning Better Auth `baseURL`, trusted origins, and Entra redirect URI
- Microsoft SSO `account_not_linked` by trusting Microsoft for automatic account linking on matching email

### Removed

- Per-user `role` field and signup role selection
