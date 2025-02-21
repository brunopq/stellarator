import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { formSubmission, formSubmissionFields } from "../db/schema"
import { db } from "../db"

const newFormSubmissionWithFieldsSchema = z.object({
  formTemplateId: z.string(),
  filledFields: z.array(
    z.object({
      formFieldId: z.string(),
      textValue: z.string().optional(),
      textAreaValue: z.string().optional(),
      numberValue: z.number().optional(),
      dateValue: z.date().optional(),
      checkboxValue: z.boolean().optional(),
    }),
  ),
})

export type NewFormSubmissionWithFields = z.infer<
  typeof newFormSubmissionWithFieldsSchema
>

class FormSubmissionService {}

export default new FormSubmissionService()
