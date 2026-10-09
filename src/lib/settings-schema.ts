import { z } from "zod";

// Admin-editable site settings. Defaults are the values the site shipped with, so an empty
// settings table renders exactly as before. Shared by the server (validation) and admin forms.

const L = (en: string, ja: string) => z.object({ en: z.string().trim().max(2000), ja: z.string().trim().max(2000) }).default({ en, ja });
const url = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//.test(v) || v.startsWith("/"), "Must start with https://");
const email = z.string().trim().max(320).refine((v) => v === "" || z.email().safeParse(v).success, "Invalid email address");

export const SOCIAL_NETWORKS = ["facebook", "x", "instagram", "youtube", "tiktok", "telegram", "linkedin", "note"] as const;
export const SOCIAL_LABELS: Record<(typeof SOCIAL_NETWORKS)[number], string> = {
  facebook: "Facebook",
  x: "X (Twitter)",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  telegram: "Telegram",
  linkedin: "LinkedIn",
  note: "note",
};

export const SETTINGS_SCHEMA = {
  company: z.object({
    phone: z.string().trim().max(50).default("+855 23 966 313"),
    phoneNote: L("(English / Khmer / Japanese)", "(日本語/英語/クメール語)"),
    businessDays: L("Monday to Saturday, excluding public holidays", "月曜日から土曜日(祝日を除く)"),
    address: L(
      "No.54 & 56, Street 388, Sangkat Toul Svay Prey 1, Khan Boeng Keng Kang, Phnom Penh, Cambodia.",
      "No.54 & 56, Street 388, Sangkat Toul Svay Prey 1, Khan Boeng Keng Kang, Phnom Penh, Cambodia.",
    ),
    inquiryEmail: email.default("general@seats-inc.com"),
    recruitEmail: email.default("hr-recruiting@seats-inc.com"),
    mapUrl: url.default("https://maps.app.goo.gl/NVLMhrNkBYBsuVHA6"),
  }),
  social: z.object({
    links: z
      .array(z.object({ network: z.enum(SOCIAL_NETWORKS), url: url.refine((v) => v !== "", "Enter a link") }))
      .max(12)
      .default([
        { network: "facebook", url: "https://www.facebook.com/seatsinccambodia/" },
        { network: "x", url: "https://x.com/seatscoo" },
        { network: "instagram", url: "https://www.instagram.com/seatsinc_cambodia/" },
        { network: "youtube", url: "https://www.youtube.com/@seatsinc5038/featured" },
        { network: "note", url: "https://note.com/mine_blog" },
      ]),
  }),
  seo: z.object({
    siteTitle: z.string().trim().min(1).max(120).default("S.E.A.T.S Inc. (シーツインク)"),
    description: L(
      "S.E.A.T.S Inc. is a Japanese-owned enterprise based in Phnom Penh, Cambodia since 2013, combining Japanese expertise with Cambodian potential.",
      "S.E.A.T.S Inc.は、2013年からカンボジア・プノンペンに拠点を置く日系企業です。日本で培った専門知識とカンボジアの可能性を組み合わせたビジネスを展開しています。",
    ),
    shareImage: url.default(""),
  }),
  contact: z.object({
    notifyEmails: z.array(email.refine((v) => v !== "")).max(10).default([]),
    autoReply: z.boolean().default(false),
    autoReplySubject: L("Thank you for contacting S.E.A.T.S Inc.", "S.E.A.T.S Inc.へのお問い合わせありがとうございます"),
    autoReplyBody: L(
      "Dear {name},\n\nThank you for your message. We have received it and will get back to you as soon as possible.\n\nS.E.A.T.S Inc.",
      "{name} 様\n\nお問い合わせいただきありがとうございます。内容を確認のうえ、担当者より折り返しご連絡いたします。\n\nS.E.A.T.S Inc.",
    ),
  }),
  maintenance: z.object({
    enabled: z.boolean().default(false),
    message: L(
      "Our website is currently under maintenance. Please check back soon.",
      "現在ウェブサイトのメンテナンスを行っております。しばらくしてから再度アクセスしてください。",
    ),
  }),
} as const;

export type SettingsGroup = keyof typeof SETTINGS_SCHEMA;
export type Settings = { [K in SettingsGroup]: z.output<(typeof SETTINGS_SCHEMA)[K]> };
export const SETTINGS_GROUPS = Object.keys(SETTINGS_SCHEMA) as SettingsGroup[];

/** Parse a stored value, falling back to defaults for anything missing or invalid. */
export function parseGroup<K extends SettingsGroup>(key: K, value: unknown): Settings[K] {
  const schema = SETTINGS_SCHEMA[key];
  const res = schema.safeParse(value ?? {});
  return (res.success ? res.data : schema.parse({})) as Settings[K];
}
