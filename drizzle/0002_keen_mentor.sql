ALTER TABLE "education" ADD COLUMN "draft" jsonb;--> statement-breakpoint
ALTER TABLE "experiences" ADD COLUMN "draft" jsonb;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "draft" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "status" "status" DEFAULT 'published' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "draft" jsonb;--> statement-breakpoint
ALTER TABLE "skills" ADD COLUMN "draft" jsonb;