import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	pgTableCreator,
	primaryKey,
	text,
	timestamp,
	unique,
} from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `pg-drizzle_${name}`);

export const posts = createTable(
	"post",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("created_by_idx").on(t.createdById),
		index("name_idx").on(t.name),
	],
);

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.$defaultFn(() => false)
		.notNull(),
	image: text("image"),
	isPlatformAdmin: boolean("is_platform_admin")
		.$defaultFn(() => false)
		.notNull(),
	createdAt: timestamp("created_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedAt: timestamp("updated_at")
		.$defaultFn(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").notNull(),
	updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
	updatedAt: timestamp("updated_at").$defaultFn(
		() => /* @__PURE__ */ new Date(),
	),
});

export const organizations = createTable(
	"organization",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		name: d.varchar({ length: 256 }).notNull(),
		type: d.varchar({ length: 32 }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("organization_type_idx").on(t.type)],
);

export const organizationDomains = createTable(
	"organization_domain",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		domain: d.varchar({ length: 255 }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		unique("organization_domain_unique").on(t.domain),
		index("organization_domain_org_idx").on(t.organizationId),
	],
);

export const organizationMembers = createTable(
	"organization_member",
	(d) => ({
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		orgRole: d.varchar({ length: 32 }).notNull().default("member"),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		primaryKey({ columns: [t.organizationId, t.userId] }),
		index("organization_member_user_idx").on(t.userId),
	],
);

export const organizationGroups = createTable(
	"organization_group",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		name: d.varchar({ length: 256 }).notNull(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [index("organization_group_org_idx").on(t.organizationId)],
);

export const groupMembers = createTable(
	"group_member",
	(d) => ({
		groupId: d
			.integer()
			.notNull()
			.references(() => organizationGroups.id, { onDelete: "cascade" }),
		userId: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		primaryKey({ columns: [t.groupId, t.userId] }),
		index("group_member_user_idx").on(t.userId),
	],
);

export const tenders = createTable(
	"tender",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		title: d.varchar({ length: 256 }).notNull(),
		description: d.text().notNull().default(""),
		category: d.varchar({ length: 128 }).notNull().default(""),
		expertise: d.varchar({ length: 128 }).notNull().default(""),
		requirements: d.text().notNull().default(""),
		evaluationRules: d.text().notNull().default(""),
		submissionDeadline: d.timestamp({ withTimezone: true }),
		clarificationDeadline: d.timestamp({ withTimezone: true }),
		status: d.varchar({ length: 32 }).notNull().default("draft"),
		organizationId: d
			.integer()
			.notNull()
			.references(() => organizations.id),
		createdById: d
			.varchar({ length: 255 })
			.notNull()
			.references(() => user.id),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
		updatedAt: d.timestamp({ withTimezone: true }).$onUpdate(() => new Date()),
	}),
	(t) => [
		index("tender_created_by_idx").on(t.createdById),
		index("tender_status_idx").on(t.status),
		index("tender_category_idx").on(t.category),
		index("tender_organization_idx").on(t.organizationId),
	],
);

export const tenderApprovalSteps = createTable(
	"tender_approval_step",
	(d) => ({
		id: d.integer().primaryKey().generatedByDefaultAsIdentity(),
		tenderId: d
			.integer()
			.notNull()
			.references(() => tenders.id, { onDelete: "cascade" }),
		groupId: d
			.integer()
			.notNull()
			.references(() => organizationGroups.id),
		stepOrder: integer("step_order").notNull(),
		status: d.varchar({ length: 32 }).notNull().default("pending"),
		actedById: d.varchar({ length: 255 }).references(() => user.id),
		actedAt: d.timestamp({ withTimezone: true }),
		note: d.text(),
		createdAt: d
			.timestamp({ withTimezone: true })
			.$defaultFn(() => new Date())
			.notNull(),
	}),
	(t) => [
		index("tender_approval_step_tender_idx").on(t.tenderId),
		index("tender_approval_step_group_idx").on(t.groupId),
		unique("tender_approval_step_order_unique").on(t.tenderId, t.stepOrder),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	account: many(account),
	session: many(session),
	tenders: many(tenders),
	memberships: many(organizationMembers),
	groupMemberships: many(groupMembers),
}));

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
	domains: many(organizationDomains),
	members: many(organizationMembers),
	groups: many(organizationGroups),
	tenders: many(tenders),
}));

export const organizationDomainsRelations = relations(
	organizationDomains,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organizationDomains.organizationId],
			references: [organizations.id],
		}),
	}),
);

export const organizationMembersRelations = relations(
	organizationMembers,
	({ one }) => ({
		organization: one(organizations, {
			fields: [organizationMembers.organizationId],
			references: [organizations.id],
		}),
		user: one(user, {
			fields: [organizationMembers.userId],
			references: [user.id],
		}),
	}),
);

export const organizationGroupsRelations = relations(
	organizationGroups,
	({ one, many }) => ({
		organization: one(organizations, {
			fields: [organizationGroups.organizationId],
			references: [organizations.id],
		}),
		members: many(groupMembers),
		approvalSteps: many(tenderApprovalSteps),
	}),
);

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	group: one(organizationGroups, {
		fields: [groupMembers.groupId],
		references: [organizationGroups.id],
	}),
	user: one(user, {
		fields: [groupMembers.userId],
		references: [user.id],
	}),
}));

export const tendersRelations = relations(tenders, ({ one, many }) => ({
	createdBy: one(user, {
		fields: [tenders.createdById],
		references: [user.id],
	}),
	organization: one(organizations, {
		fields: [tenders.organizationId],
		references: [organizations.id],
	}),
	approvalSteps: many(tenderApprovalSteps),
}));

export const tenderApprovalStepsRelations = relations(
	tenderApprovalSteps,
	({ one }) => ({
		tender: one(tenders, {
			fields: [tenderApprovalSteps.tenderId],
			references: [tenders.id],
		}),
		group: one(organizationGroups, {
			fields: [tenderApprovalSteps.groupId],
			references: [organizationGroups.id],
		}),
		actedBy: one(user, {
			fields: [tenderApprovalSteps.actedById],
			references: [user.id],
		}),
	}),
);
