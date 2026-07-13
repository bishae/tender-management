import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { extractEmailDomain } from "~/lib/org";
import { db } from "~/server/db";
import {
	organizationDomains,
	organizationMembers,
	user,
} from "~/server/db/schema";

function resolveBaseURL(): string | undefined {
	if (env.BETTER_AUTH_URL) {
		return env.BETTER_AUTH_URL.replace(/\/$/, "");
	}
	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
	}
	return undefined;
}

const baseURL = resolveBaseURL();

const microsoftClientId = env.MICROSOFT_CLIENT_ID;
const microsoftClientSecret = env.MICROSOFT_CLIENT_SECRET;
const microsoftTenantId = env.MICROSOFT_TENANT_ID;

const trustedOrigins = [
	"http://localhost:3000",
	...(baseURL ? [baseURL] : []),
];

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	...(baseURL ? { baseURL } : {}),
	trustedOrigins,
	emailAndPassword: {
		enabled: true,
	},
	...(microsoftClientId && microsoftClientSecret && microsoftTenantId
		? {
				socialProviders: {
					microsoft: {
						clientId: microsoftClientId,
						clientSecret: microsoftClientSecret,
						tenantId: microsoftTenantId,
						prompt: "select_account" as const,
						...(baseURL
							? {
									redirectURI: `${baseURL}/api/auth/callback/microsoft`,
								}
							: {}),
					},
				},
			}
		: {}),
	user: {
		additionalFields: {
			isPlatformAdmin: {
				type: "boolean",
				required: false,
				defaultValue: false,
				input: false,
			},
		},
	},
	databaseHooks: {
		user: {
			create: {
				after: async (createdUser) => {
					const email = createdUser.email.toLowerCase();
					const adminEmail = env.PLATFORM_ADMIN_EMAIL?.toLowerCase();

					if (adminEmail && email === adminEmail) {
						await db
							.update(user)
							.set({ isPlatformAdmin: true })
							.where(eq(user.id, createdUser.id));
					}

					const domain = extractEmailDomain(email);
					if (!domain) return;

					const domainRow = await db.query.organizationDomains.findFirst({
						where: eq(organizationDomains.domain, domain),
					});
					if (!domainRow) return;

					await db
						.insert(organizationMembers)
						.values({
							organizationId: domainRow.organizationId,
							userId: createdUser.id,
							orgRole: "member",
						})
						.onConflictDoNothing();
				},
			},
		},
	},
});

export type Session = typeof auth.$Infer.Session;
