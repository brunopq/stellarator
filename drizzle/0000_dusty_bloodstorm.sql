CREATE TYPE "public"."form_field_types" AS ENUM('text', 'textarea', 'number', 'date', 'checkbox');--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"form_template_id" char(12) NOT NULL,
	"name" text NOT NULL,
	"required" boolean NOT NULL,
	"type" "form_field_types" NOT NULL,
	"order" smallint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"form_template_id" char(12) NOT NULL,
	"submitter_id" char(12) NOT NULL,
	"submitted_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submission_fields" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"form_submission_id" char(12) NOT NULL,
	"form_field_id" char(12) NOT NULL,
	"text_value" text,
	"textarea_value" text,
	"number_value" integer,
	"date_value" timestamp with time zone,
	"checkbox_value" boolean,
	CONSTRAINT "only_one_field_value_check" CHECK ((
        CASE WHEN "form_submission_fields"."text_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."number_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."textarea_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."checkbox_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."date_value" IS NOT NULL THEN 1 ELSE 0 END
      ) = 1)
);
--> statement-breakpoint
CREATE TABLE "form_templates" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_template_id_form_templates_id_fk" FOREIGN KEY ("form_template_id") REFERENCES "public"."form_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_template_id_form_templates_id_fk" FOREIGN KEY ("form_template_id") REFERENCES "public"."form_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission_fields" ADD CONSTRAINT "form_submission_fields_form_submission_id_form_submissions_id_fk" FOREIGN KEY ("form_submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submission_fields" ADD CONSTRAINT "form_submission_fields_form_field_id_form_fields_id_fk" FOREIGN KEY ("form_field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;