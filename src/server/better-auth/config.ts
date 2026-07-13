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

const microsoftClientId = env.MICROSOFT_CLIENT_ID;
const microsoftClientSecret = env.MICROSOFT_CLIENT_SECRET;
const microsoftTenantId = env.MICROSOFT_TENANT_ID;

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	...(env.BETTER_AUTH_URL ? { baseURL: env.BETTER_AUTH_URL } : {}),
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
