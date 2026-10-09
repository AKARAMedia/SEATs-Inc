CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"user_name" text DEFAULT '' NOT NULL,
	"action" text NOT NULL,
	"target_type" text DEFAULT '' NOT NULL,
	"target_id" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "glossary" (
	"id" serial PRIMARY KEY NOT NULL,
	"term_en" text NOT NULL,
	"term_ja" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_items" (
	"key" text PRIMARY KEY NOT NULL,
	"segments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"dirty" boolean DEFAULT false NOT NULL,
	"published_at" timestamp with time zone,
	"updated_by" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "translation_memory" (
	"source_hash" text PRIMARY KEY NOT NULL,
	"source_text" text NOT NULL,
	"target" text NOT NULL,
	"uses" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity" text NOT NULL,
	"data" jsonb NOT NULL,
	"user_name" text DEFAULT '' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "activity_log_created_idx" ON "activity_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "versions_entity_idx" ON "versions" USING btree ("entity","created_at");