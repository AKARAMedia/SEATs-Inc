CREATE TABLE "application_files" (
	"application_id" integer PRIMARY KEY NOT NULL,
	"content_type" text DEFAULT 'application/pdf' NOT NULL,
	"data" "bytea" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer,
	"job_title" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"lang" text DEFAULT 'en' NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"cv_name" text DEFAULT '' NOT NULL,
	"cv_size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_en" text NOT NULL,
	"title_ja" text DEFAULT '' NOT NULL,
	"department" text DEFAULT '' NOT NULL,
	"location" text DEFAULT 'Phnom Penh' NOT NULL,
	"type" text DEFAULT 'Full-time' NOT NULL,
	"description_en" text DEFAULT '' NOT NULL,
	"description_ja" text DEFAULT '' NOT NULL,
	"open" boolean DEFAULT true NOT NULL,
	"closes_at" timestamp with time zone,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_by" text DEFAULT '' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_files" ADD CONSTRAINT "application_files_application_id_job_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."job_applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_applications" ADD CONSTRAINT "job_applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "job_applications_job_idx" ON "job_applications" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "job_applications_created_idx" ON "job_applications" USING btree ("created_at");