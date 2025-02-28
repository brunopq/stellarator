import { createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { formSubmission, formSubmissionFields } from "../db/schema"
import { db } from "../db"
import { formFieldSchema, formTemplateSchema } from "../FormTemplateService"
import { and, eq } from "drizzle-orm"

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
  textValue: z.string().nullable(),
  textareaValue: z.string().nullable(),
  numberValue: z.number().nullable(),
  dateValue: z.date().nullable(),
  checkboxValue: z.boolean().nullable(),
})
type NewFormSubmissionField = z.infer<typeof newFormSubmissionFieldSchema>

export const syncFieldSchema = formSubmissionFieldSchema.extend({
  id: z.string().optional(),
  dateValue: z.date({ coerce: true }).nullable(),
})
export type SyncField = z.infer<typeof syncFieldSchema>

// other

const formSubmissionWithFieldsSchema = formSubmissionSchema.extend({
  fields: z.array(formSubmissionFieldSchema),
})

export type FormSubmissionWithFields = z.infer<
  typeof formSubmissionWithFieldsSchema
>

export const formSubmissionWithSyncFieldsSchema = formSubmissionSchema.extend({
  fields: z.array(syncFieldSchema),
})

class FormSubmissionService {
  private ensureOnlyOneValue(submissionField: FormSubmissionField) {
    const checkKeys: (keyof FormSubmissionField)[] = [
      "dateValue",
      "checkboxValue",
      "textValue",
      "numberValue",
      "textareaValue",
    ]

    let truthyCount = 0

    for (const key of checkKeys) {
      if (submissionField[key] !== null) {
        truthyCount++
      }
    }

    return truthyCount === 1
  }

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
    const [createdFormSubmission] = await db
      .insert(formSubmission)
      .values({
        formTemplateId: newFormSubmission.formTemplateId,
        submitterId: newFormSubmission.submitterId,
      })
      .returning()

    return createdFormSubmission
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
    submissionId: string,
    templateFieldId: string,
    updateSubmissionField: Partial<NewFormSubmissionField>,
  ): Promise<FormSubmissionField> {
    const [updatedField] = await db
      .update(formSubmissionFields)
      .set(updateSubmissionField)
      .where(
        and(
          eq(formSubmissionFields.formSubmissionId, submissionId),
          eq(formSubmissionFields.formFieldId, templateFieldId),
        ),
      )
      .returning()

    return updatedField
  }

  async syncSubmissionFields(
    submissionId: string,
    syncFields: SyncField[],
  ): Promise<FormSubmissionField[]> {
    const oldSubmittedFields = new Set(
      (
        await db
          .select({
            id: formSubmissionFields.formFieldId,
          })
          .from(formSubmissionFields)
          .where(eq(formSubmissionFields.formSubmissionId, submissionId))
      ).map(({ id }) => id),
    )

    const updatedFields = await Promise.all(
      syncFields
        .map((field) => {
          if (!this.ensureOnlyOneValue({ ...field, id: "" })) {
            // field has invalid number of values truthy
            return
          }

          if (oldSubmittedFields.has(field.formFieldId)) {
            oldSubmittedFields.delete(field.formFieldId)

            return this.updateSubmissionField(
              submissionId,
              field.formFieldId,
              field,
            )
          }

          return this.createSubmissionField(field)
        })
        .filter((f) => f !== undefined),
    )

    return updatedFields
  }
}

export default new FormSubmissionService()
