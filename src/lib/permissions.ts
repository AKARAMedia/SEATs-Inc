import type { Role } from "@/db/schema";

// What each role may do. Shared by server checks and the admin menu.
const PERMS = {
  /** Open the news list and post editor (translators see JP fields only) */
  viewPosts: ["admin", "editor", "translator", "hr"],
  /** Create, edit English, publish and delete posts */
  editPosts: ["admin", "editor", "hr"],
  /** Edit Japanese text */
  translate: ["admin", "editor", "translator"],
  /** Home page, brands, media library, pages */
  content: ["admin", "editor", "hr"],
  messages: ["admin", "editor", "hr"],
  /** Job posts and applications (CVs contain personal data) */
  careers: ["admin", "editor", "hr"],
  users: ["admin"],
  settings: ["admin"],
  activity: ["admin"],
} as const satisfies Record<string, readonly Role[]>;

export type Perm = keyof typeof PERMS;

export function can(role: Role, perm: Perm) {
  return (PERMS[perm] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, { label: string; description: string }> = {
  admin: { label: "Admin", description: "Full access, including users and settings" },
  editor: { label: "Editor", description: "Manage content and messages" },
  translator: { label: "Translator", description: "Edit Japanese text only" },
  hr: { label: "HR Team", description: "Manage careers, messages, and content" },
};
