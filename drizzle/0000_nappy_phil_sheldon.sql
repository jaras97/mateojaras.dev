CREATE TYPE "public"."availability" AS ENUM('open', 'from_date', 'closed');--> statement-breakpoint
CREATE TYPE "public"."experience_type" AS ENUM('employment', 'freelance');--> statement-breakpoint
CREATE TYPE "public"."locale" AS ENUM('en', 'es');--> statement-breakpoint
CREATE TYPE "public"."skill_category" AS ENUM('frontend', 'state', 'testing', 'backend', 'ai', 'tools');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"message" text NOT NULL,
	"locale" "locale" NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "education" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"institution" text NOT NULL,
	"program_en" text NOT NULL,
	"program_es" text NOT NULL,
	"start_date" date,
	"end_date" date,
	"status_en" text,
	"status_es" text
);
--> statement-breakpoint
CREATE TABLE "experience_projects" (
	"experience_id" uuid NOT NULL,
	"project_id" uuid NOT NULL,
	CONSTRAINT "experience_projects_experience_id_project_id_pk" PRIMARY KEY("experience_id","project_id")
);
--> statement-breakpoint
CREATE TABLE "experience_skills" (
	"experience_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "experience_skills_experience_id_skill_id_pk" PRIMARY KEY("experience_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "experiences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"company" text NOT NULL,
	"role_en" text NOT NULL,
	"role_es" text NOT NULL,
	"type" "experience_type" NOT NULL,
	"location" text,
	"start_date" date NOT NULL,
	"end_date" date,
	"bullets_en" text[] DEFAULT '{}' NOT NULL,
	"bullets_es" text[] DEFAULT '{}' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_skills" (
	"project_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL,
	CONSTRAINT "project_skills_project_id_skill_id_pk" PRIMARY KEY("project_id","skill_id")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"slug" text NOT NULL,
	"title_en" text NOT NULL,
	"title_es" text NOT NULL,
	"tagline_en" text,
	"tagline_es" text,
	"problem_en" text,
	"problem_es" text,
	"role_en" text,
	"role_es" text,
	"solution_en" text,
	"solution_es" text,
	"case_study_en" jsonb,
	"case_study_es" jsonb,
	"results_en" text[],
	"results_es" text[],
	"metrics_en" jsonb,
	"metrics_es" jsonb,
	"tech_decisions_en" jsonb,
	"tech_decisions_es" jsonb,
	"live_url" text,
	"repo_url" text,
	"cover_image" text,
	"media" jsonb,
	"featured" boolean DEFAULT false NOT NULL,
	"started_at" date,
	"finished_at" date
);
--> statement-breakpoint
CREATE TABLE "resume_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"locale" "locale" NOT NULL,
	"version" integer NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"pdf_url" text NOT NULL,
	"overrides" jsonb
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"headline_en" text NOT NULL,
	"headline_es" text NOT NULL,
	"bio_en" text NOT NULL,
	"bio_es" text NOT NULL,
	"now_en" jsonb,
	"now_es" jsonb,
	"availability_status" "availability" DEFAULT 'open' NOT NULL,
	"available_from" date,
	"timezone" text DEFAULT 'America/Bogota' NOT NULL,
	"location" text DEFAULT 'Medellín, Colombia' NOT NULL,
	"languages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"email" text NOT NULL,
	"calendar_url" text,
	"github_url" text,
	"linkedin_url" text,
	"seo_title_en" text,
	"seo_title_es" text,
	"seo_description_en" text,
	"seo_description_es" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "status" DEFAULT 'draft' NOT NULL,
	"visible" boolean DEFAULT true NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"category" "skill_category" NOT NULL,
	"icon" text,
	"years_used" integer,
	"featured" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_projects" ADD CONSTRAINT "experience_projects_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_experience_id_experiences_id_fk" FOREIGN KEY ("experience_id") REFERENCES "public"."experiences"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "experience_skills" ADD CONSTRAINT "experience_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_skills" ADD CONSTRAINT "project_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status","visible","order");--> statement-breakpoint
CREATE UNIQUE INDEX "resume_locale_version_idx" ON "resume_versions" USING btree ("locale","version");--> statement-breakpoint
CREATE UNIQUE INDEX "skills_name_idx" ON "skills" USING btree ("name");