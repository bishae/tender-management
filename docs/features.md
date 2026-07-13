# Smart Tender Management System — Features

Feature catalog for the Zero Gravity Smart Tender Management System (dual-scenario procurement platform).

## Dual-scenario platform (organization-based)

- **Buyer organizations** — internal procurement teams that create and approve tenders (Creator portal)
- **Vendor organizations** — external partners that discover and respond to published tenders (Bidder portal)
- Portal access is derived from organization membership, not a self-selected user role

## Organizations, domains, and membership

- Organizations are typed as Buyer or Vendor
- Each organization can register one or more email domains
- On signup, if the user’s email domain matches a registered domain, they are auto-added as an organization member
- If the domain is not registered, signup still succeeds but portal access is blocked until a platform admin attaches the user
- Platform admins manage organizations, domains, groups, and memberships via the Admin UI
- Optional `PLATFORM_ADMIN_EMAIL` seeds the first platform admin on signup

## Organization groups

- Each organization can define named groups (e.g. Department Head, Finance, Procurement)
- Group membership is managed by platform admins
- Groups are the unit of tender approval (any one member of the active group can approve)

## Tender Creator workflow (Buyer)

- Secure authentication (email/password and Microsoft Entra ID SSO)
- Tender initiation from the creator dashboard
- Configuration: requirements, timelines, and evaluation rules
- Configurable ordered approval chain: select which groups must approve and in what order
- Submit for multi-level approval before publication (or publish directly when no groups are selected)
- Publication to the Vendor / ZG Bidder portal after the approval chain completes
- Monitoring of incoming bids and notifications (planned)

## ZG Bidder workflow (Vendor)

- Partner authentication via bidder portal (domain membership or admin attach)
- Tender discovery with filters (category, expertise)
- Requirements, specs, and criteria review
- AI-assisted proposal drafting and summaries (planned)
- Document compilation and quick compliance checks (planned)
- Final AI-driven compliance check before submit (planned)
- Secure encrypted bid submission (planned)
- Real-time bid status tracking (planned)
- Automated alerts for status changes, clarifications, or results (planned)
- Secure post-submission communication channel (planned)

## Multi-level approval workflow

- Approval levels are not fixed globally — each tender defines an ordered list of organization groups
- Example chain: Departmental Review → Financial Oversight → Executive Authorization
- Only the current step’s group can act; any member of that group may approve or reject
- Approve advances to the next step; the final approval publishes the tender
- Reject returns the tender to draft for revision

## AI-powered features

- Intelligent bid evaluation (scoring and ranking from technical specs and historical performance)
- AI-assisted proposal drafting (templates and content suggestions)
- Compliance verification on uploaded documents
- Risk and sentiment analysis (NLP for red flags and inconsistencies)
- Whisper API transcription support

## Document management and security

- Secure S3 cloud storage (encrypted, non-enumerable paths)
- Automated version control
- Role-based / organization-based access control (RBAC)
- Comprehensive audit logging (upload, download, and related actions)

## Notifications and analytics

- Real-time system and email notifications
- Strategic analytics dashboards (tender distribution, bidder participation, approval efficiency)
- Automated reporting (procurement trends, vendor performance)

## Platform / cross-cutting

- End-to-end tender lifecycle (create → approve → publish → bid → evaluate → award)
- Type-safe full stack (React, tRPC, TypeScript)
- Web-based application (no native mobile in current scope)
- Admin console for organizations, domains, groups, and user assignment

## Out of current scope

- Native mobile application
- Deep third-party ERP / financial system integrations
- Post-award contract execution and performance monitoring
- Future enhancements: blockchain audit trails, predictive tender success analytics
