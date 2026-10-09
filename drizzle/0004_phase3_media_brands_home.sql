CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"logo_url" text NOT NULL,
	"logo_width" integer NOT NULL,
	"logo_height" integer NOT NULL,
	"href" text DEFAULT '' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"desktop_height" integer DEFAULT 100 NOT NULL,
	"mobile_height" integer DEFAULT 150 NOT NULL,
	"mobile_row" integer DEFAULT 150 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "home_banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"href" text DEFAULT '' NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "home_slides" (
	"id" serial PRIMARY KEY NOT NULL,
	"image_url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"filename" text DEFAULT '' NOT NULL,
	"content_type" text DEFAULT '' NOT NULL,
	"width" integer DEFAULT 0 NOT NULL,
	"height" integer DEFAULT 0 NOT NULL,
	"size" integer DEFAULT 0 NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"uploaded_by" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_url_unique" UNIQUE("url")
);
--> statement-breakpoint
-- Start with the content the home page had when it was hard-coded
INSERT INTO "brands" ("name", "logo_url", "logo_width", "logo_height", "sort_order", "desktop_height", "mobile_height", "mobile_row") VALUES
  ('LOKA Japanese Foods & Beverage', '/media/elementor/thumbs/LOKA-logo1-1-r2hzw3mcwn006p03ye21f4gn18nz3tjei56b00risc.png', 200, 150, 1, 104, 150, 150),
  ('S.E.A.T.S Farm', '/media/elementor/thumbs/seatsfarm-logo-r2hzx57wi0fh33hhuub46uz2sninnponzb9q737rvg.png', 200, 150, 2, 104, 150, 150),
  ('NOVA Marketing', '/media/2026/09/NOVA-Logo-Final.png', 3000, 3000, 3, 178, 299, 222),
  ('PISA Food Retail', '/media/elementor/thumbs/PISA-Logo-1-scaled-rtfht309vqbcrdp9l0r7gjw96gz7s6b0y7gam9ofz0.png', 200, 150, 4, 116, 150, 139),
  ('SELECT STORE SORA', '/media/2026/09/SELECT-STORE-SORA-Logo.png', 3740, 1083, 5, 48, 83, 111),
  ('Japan Farm Products', '/media/2026/09/Janpan-Farm-Product-logo.png', 3980, 3879, 6, 104, 222, 223),
  ('Phsar Ichiba', '/media/2026/09/wordmark.png', 562, 311, 7, 59, 126, 158);
--> statement-breakpoint
INSERT INTO "home_slides" ("image_url", "sort_order") VALUES
  ('/media/2025/09/Untitled-design4.jpg', 1),
  ('/media/2025/01/stock-photo-central-phnom-penh-city-modern-urban-skyscraper-buildings-skyline-cambodia.jpg', 2),
  ('/media/2025/01/Untitled-2.jpg', 3),
  ('/media/2025/09/Untitled-design3.jpg', 4);
--> statement-breakpoint
INSERT INTO "home_banners" ("image_url", "width", "height", "href", "alt", "sort_order") VALUES
  ('/media/2025/01/seats-inc-career.jpg', 1024, 162, 'https://seatsinc-career.com/', 'S.E.A.T.S Inc. careers', 1),
  ('/media/2026/09/banner.jpg', 768, 175, '/jp/', 'Recruiting (Japanese)', 2);
