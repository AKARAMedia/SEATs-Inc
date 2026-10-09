CREATE TABLE "page_views_daily" (
	"day" date NOT NULL,
	"path" text NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "page_views_daily_day_path_pk" PRIMARY KEY("day","path")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitors_daily" (
	"day" date NOT NULL,
	"hash" text NOT NULL,
	CONSTRAINT "visitors_daily_day_hash_pk" PRIMARY KEY("day","hash")
);
--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contact_messages" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
-- Messages received before the inbox existed count as already read
UPDATE "contact_messages" SET "read_at" = "created_at";