// Company pages editable in admin → Pages. Each page's content is the set of constants its
// component already used; those constants stay as the defaults, and saved edits must keep their shape.
import { CEO } from "@/content/pages/ceo-message";
import { HISTORY, HISTORY_TITLE } from "@/content/pages/history";
import { LOKA } from "@/content/pages/loka-japanese-foods-beverage";
import { NOVA } from "@/content/pages/nova-marketing";
import { CAREER } from "@/content/pages/option-career";
import { AWARDS, FACTS, IN_ACTION, OFFICES, OVERVIEW_TITLE, SERVICES } from "@/content/pages/overview";
import {
  DOMAINS,
  PHILOSOPHY_CLOSING,
  PHILOSOPHY_HEADING,
  PHILOSOPHY_TEXT,
  PHILOSOPHY_TITLE,
  VALUES,
  VALUES_INTRO,
  VALUES_TITLE,
} from "@/content/pages/philosophy-our-value";
import { PISA } from "@/content/pages/pisa-food-retail";

export type PageDef = {
  title: string;
  path: string;
  description: string;
  defaults: Record<string, unknown>;
  /** Arrays whose length must not change (layout depends on it). "*" matches any list index. */
  fixed?: string[];
  /** Friendlier names for keys, by path or by key */
  labels?: Record<string, string>;
};

const def = <T extends Record<string, unknown>>(d: Omit<PageDef, "defaults"> & { defaults: T }) => d;

export const PAGES = {
  overview: def({
    title: "Overview",
    path: "/overview/",
    description: "Company facts, offices, services and photo galleries",
    defaults: { OVERVIEW_TITLE, FACTS, OFFICES, SERVICES, AWARDS, IN_ACTION },
    fixed: ["FACTS"],
    labels: { OVERVIEW_TITLE: "Page title", FACTS: "Company facts", OFFICES: "Offices", SERVICES: "Our services", AWARDS: "Awards and honors", IN_ACTION: "Business in action", map: "Google Maps embed link" },
  }),
  history: def({
    title: "History",
    path: "/history/",
    description: "The company timeline, year by year",
    defaults: { HISTORY_TITLE, HISTORY },
    labels: { HISTORY_TITLE: "Page title", HISTORY: "Timeline" },
  }),
  "philosophy-our-value": def({
    title: "Philosophy & Our Value",
    path: "/philosophy-our-value/",
    description: "Philosophy, business domains and the 12 action guidelines",
    defaults: { PHILOSOPHY_TITLE, PHILOSOPHY_HEADING, PHILOSOPHY_TEXT, DOMAINS, PHILOSOPHY_CLOSING, VALUES_TITLE, VALUES_INTRO, VALUES },
    // Two accordion columns
    fixed: ["VALUES"],
    labels: {
      PHILOSOPHY_TITLE: "Philosophy title",
      PHILOSOPHY_HEADING: "Philosophy heading",
      PHILOSOPHY_TEXT: "Philosophy text",
      DOMAINS: "Business domains",
      PHILOSOPHY_CLOSING: "Closing text",
      VALUES_TITLE: "Values title",
      VALUES_INTRO: "Values introduction",
      VALUES: "Action guidelines (left and right column)",
    },
  }),
  "ceo-message": def({
    title: "CEO Message",
    path: "/ceo-message/",
    description: "Message, photo, profile and links",
    defaults: { CEO },
    labels: { CEO: "CEO Message" },
  }),
  "loka-japanese-foods-beverage": def({
    title: "LOKA Japanese Foods & Beverage",
    path: "/loka-japanese-foods-beverage/",
    description: "Food import & wholesale business page",
    defaults: { LOKA },
    fixed: ["LOKA.uniqueness.rows.*.images", "LOKA.future.rows.*.images", "LOKA.strength.text"],
    labels: { LOKA: "LOKA page" },
  }),
  "nova-marketing": def({
    title: "NOVA Marketing",
    path: "/nova-marketing/",
    description: "Digital marketing business page",
    defaults: { NOVA },
    fixed: ["NOVA.solution.text", "NOVA.vision.outro"],
    labels: { NOVA: "NOVA page" },
  }),
  "pisa-food-retail": def({
    title: "PISA Food Retail",
    path: "/pisa-food-retail/",
    description: "Food retail business and SELECT STORE SORA",
    defaults: { PISA },
    fixed: ["PISA.gallery"],
    labels: { PISA: "PISA page", gallery: "Photo gallery (two rows)" },
  }),
  "option-career": def({
    title: "Recruit (Option Career)",
    path: "/option-career/",
    description: "Recruiting page text, buttons and images (job posts are under Careers)",
    defaults: { CAREER },
    fixed: ["CAREER.buttons"],
    labels: { CAREER: "Recruit page" },
  }),
};

export type PageKey = keyof typeof PAGES;
export const PAGE_KEYS = Object.keys(PAGES) as PageKey[];
export type PageContent<K extends PageKey> = (typeof PAGES)[K]["defaults"];

export function isPageKey(k: string): k is PageKey {
  return k in PAGES;
}
