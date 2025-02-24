import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { formSubmission, formSubmissionFields } from "../db/schema"
import { db } from "../db"
import { formFieldSchema, formTemplateSchema } from "../FormTemplateService"

const formSubmissionSchema = createSelectSchema(formSubmission)
export type FormSubmission = z.infer<typeof formSubmissionSchema>

const formSubmissionFieldSchema = createSelectSchema(formSubmissionFields)
export type FormSubmissionField = z.infer<typeof formSubmissionFieldSchema>

const fullFormSubmissionFieldSchema = formSubmissionFieldSchema.extend({
  formField: formFieldSchema,
})

type FullFormSubmissionFieldSchema = z.infer<
  typeof fullFormSubmissionFieldSchema
>

const formSubmissionWithFieldsSchema = formSubmissionSchema.extend({
  fields: z.array(formSubmissionFieldSchema),
})

export type FormSubmissionWithFields = z.infer<
  typeof formSubmissionWithFieldsSchema
>

const fullFormSubmissionSchema = formSubmissionSchema.extend({
  formTemplate: formTemplateSchema,
  formSubmissionFields: z.array(fullFormSubmissionFieldSchema),
})
export type FullFormSubmission = z.infer<typeof fullFormSubmissionSchema>

const newFormSubmissionFieldSchema = z.object({
  formFieldId: z.string(),
  textValue: z.string().optional(),
  textAreaValue: z.string().optional(),
  numberValue: z.number().optional(),
  dateValue: z.date().optional(),
  checkboxValue: z.boolean().optional(),
})

const newFormSubmissionSchema = z.object({
  formTemplateId: z.string(),
  submitterId: z.string().optional().default("123"),
})

const newFormSubmissionWithFieldsSchema = z.object({
  formTemplateId: z.string(),
  filledFields: z.array(newFormSubmissionFieldSchema),
})

export type NewFormSubmission = z.infer<typeof newFormSubmissionSchema>

export type NewFormSubmissionWithFields = z.infer<
  typeof newFormSubmissionWithFieldsSchema
>

class FormSubmissionService {
  async listByUser(uid: string) {
    return await db.query.formSubmission.findMany({
      // where: (fs, {eq}) => eq(fs.submitterId, uid),
      with: {
        formSubmissionFields: { with: { formField: true } },
        formTemplate: true,
      },
    })
  }

  async create(newFormSubmission: NewFormSubmission): Promise<FormSubmission> {
    return await db.insert(formSubmission).values({
      formTemplateId: newFormSubmission.formTemplateId,
      submitterId: newFormSubmission.submitterId,
    })
  }

  async get(formSubmissionId: string) {
    return await db.query.formSubmission.findFirst({
      where: (fs, { eq }) => eq(fs.id, formSubmissionId),
      with: {
        formSubmissionFields: { with: { formField: true } },
        formTemplate: { with: { formFields: true } },
      },
    })
  }
}

export default new FormSubmissionService()
