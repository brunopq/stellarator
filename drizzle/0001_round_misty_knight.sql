ALTER TABLE "form_submission_fields" DROP CONSTRAINT "only_one_field_value_check";--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "submitted_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "form_submissions" ALTER COLUMN "submitted_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "form_submission_fields" ADD CONSTRAINT "only_one_field_value_check" CHECK ((
        CASE WHEN "form_submission_fields"."text_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."number_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."textarea_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."checkbox_value" IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN "form_submission_fields"."date_value" IS NOT NULL THEN 1 ELSE 0 END
      ) = 1);--> statement-breakpoint
ALTER TABLE "public"."form_fields" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."form_field_types";--> statement-breakpoint
CREATE TYPE "public"."form_field_types" AS ENUM('text', 'textarea', 'number', 'date', 'checkbox');--> statement-breakpoint
ALTER TABLE "public"."form_fields" ALTER COLUMN "type" SET DATA TYPE "public"."form_field_types" USING "type"::"public"."form_field_types";