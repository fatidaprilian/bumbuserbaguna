// User roles — const assertion + union type (preferred over enum, per TypeScript stack rules)

export const USER_ROLES = ["student", "teacher", "admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];
