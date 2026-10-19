ALTER TABLE "jobs" ADD COLUMN "site" text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "salary_range" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "work_days" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "wp_id" integer;