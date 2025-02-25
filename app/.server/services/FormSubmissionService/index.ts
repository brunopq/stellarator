import { createSelectSchema, createInsertSchema } from "drizzle-zod"
import { z } from "zod"

import { formSubmission, formSubmissionFields } from "../db/schema"
import { db } from "../db"
import { formFieldSchema, formTemplateSchema } from "../FormTemplateService"
import { eq } from "drizzle-orm"

// submission
const formSubmissionSchema = createSelectSchema(formSubmission)
export type FormSubmission = z.infer<typeof formSubmissionSchema>

const newFormSubmissionSchema = z.object({
  formTemplateId: z.string(),
  submitterId: z.string().optional().default("123"),
})
export type NewFormSubmission = z.infer<typeof newFormSubmissionSchema>

// fields
const formSubmissionFieldSchema = createSelectSchema(formSubmissionFields)
export type FormSubmissionField = z.infer<typeof formSubmissionFieldSchema>

const newFormSubmissionFieldSchema = z.object({
  formFieldId: z.string(),
  formSubmissionId: z.string(),
  textValue: z.string().optional(),
  textAreaValue: z.string().optional(),
  numberValue: z.number().optional(),
  dateValue: z.date().optional(),
  checkboxValue: z.boolean().optional(),
})
type NewFormSubmissionField = z.infer<typeof newFormSubmissionFieldSchema>

export const syncFieldSchema = formSubmissionFieldSchema.partial().extend({
  id: z.string().optional(),
})
export type SyncField = z.infer<typeof syncFieldSchema>

// other
const fullFormSubmissionFieldSchema = formSubmissionFieldSchema.extend({
  formField: formFieldSchema,
})

const formSubmissionWithFieldsSchema = formSubmissionSchema.extend({
  fields: z.array(formSubmissionFieldSchema),
})

export type FormSubmissionWithFields = z.infer<
  typeof formSubmissionWithFieldsSchema
>

export const formSubmissionWithSyncFieldsSchema = formSubmissionSchema.extend({
  fields: z.array(syncFieldSchema),
})
export type FormSubmissionWithSyncFields = z.infer<
  typeof formSubmissionWithSyncFieldsSchema
>

const fullFormSubmissionSchema = formSubmissionSchema.extend({
  formTemplate: formTemplateSchema,
  formSubmissionFields: z.array(fullFormSubmissionFieldSchema),
})
export type FullFormSubmission = z.infer<typeof fullFormSubmissionSchema>

const newFormSubmissionWithFieldsSchema = z.object({
  formTemplateId: z.string(),
  filledFields: z.array(newFormSubmissionFieldSchema),
})

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

  async createSubmissionField(
    newSubmissionField: NewFormSubmissionField,
  ): Promise<FormSubmissionField> {
    const [createdField] = await db
      .insert(formSubmissionFields)
      .values(newSubmissionField)
      .returning()

    return createdField
  }
  async updateSubmissionField(
    submissionFieldId: string,
    updateSubmissionField: Partial<NewFormSubmissionField>,
  ): Promise<FormSubmissionField> {
    const [updatedField] = await db
      .update(formSubmissionFields)
      .set(updateSubmissionField)
      .where(eq(formSubmissionFields.id, submissionFieldId))
      .returning()

    return updatedField
  }

  async syncSubmissionFields(
    submissionId: string,
    syncFields: SyncField[],
  ): Promise<FormSubmissionField[]> {
    console.log("doin shi")
    const oldIds = new Set(
      (
        await db
          .select({ id: formSubmissionFields.id })
          .from(formSubmissionFields)
          .where(eq(formSubmissionFields.formSubmissionId, submissionId))
      ).map(({ id }) => id),
    )

    const updatedFields = await Promise.all(
      syncFields.map((field) => {
        if (field.id && oldIds.has(field.id)) {
          oldIds.delete(field.id)
          return this.updateSubmissionField(field.id, field)
        }

        return this.createSubmissionField(field)
      }),
    )

    return updatedFields
  }
}

export default new FormSubmissionService()
