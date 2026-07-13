import { z } from "zod";

export const ORG_TYPES = ["buyer", "vendor"] as const;
export type OrgType = (typeof ORG_TYPES)[number];
export const orgTypeSchema = z.enum(ORG_TYPES);

export const ORG_TYPE_LABELS: Record<OrgType, string> = {
	buyer: "Buyer",
	vendor: "Vendor",
};

export const ORG_ROLES = ["member", "org_admin"] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const TENDER_STATUSES = [
	"draft",
	"pending_approval",
	"published",
	"closed",
	"rejected",
] as const;
export type TenderStatus = (typeof TENDER_STATUSES)[number];
export const tenderStatusSchema = z.enum(TENDER_STATUSES);

export const APPROVAL_STEP_STATUSES = [
	"pending",
	"approved",
	"rejected",
	"skipped",
] as const;
export type ApprovalStepStatus = (typeof APPROVAL_STEP_STATUSES)[number];

export type UserMembership = {
	organizationId: number;
	organizationName: string;
	organizationType: OrgType;
	orgRole: OrgRole;
	isPlatformAdmin: boolean;
};

export function extractEmailDomain(email: string): string | null {
	const at = email.lastIndexOf("@");
	if (at < 0 || at === email.length - 1) return null;
	return email.slice(at + 1).toLowerCase().trim();
}

export function normalizeDomain(domain: string): string {
	return domain
		.trim()
		.toLowerCase()
		.replace(/^@/, "")
		.replace(/\.$/, "");
}

export function isBuyerMembership(
	membership: UserMembership | null | undefined,
): boolean {
	return membership?.organizationType === "buyer";
}

export function isVendorMembership(
	membership: UserMembership | null | undefined,
): boolean {
	return membership?.organizationType === "vendor";
}

export function dashboardPathForMembership(
	membership: UserMembership | null | undefined,
	isPlatformAdmin = false,
): string {
	if (membership?.organizationType === "buyer") return "/creator";
	if (membership?.organizationType === "vendor") return "/bidder";
	if (isPlatformAdmin || membership?.isPlatformAdmin) return "/admin";
	return "/pending";
}
