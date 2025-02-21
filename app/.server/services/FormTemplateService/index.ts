import { createInsertSchema, createSelectSchema } from "drizzle-zod"
import { z } from "zod"

import { formField, formTemplate, formFieldTypes } from "../db/schema"
import { db } from "../db"
import { eq } from "drizzle-orm"

export const formFieldTypesSchema = z.enum(formFieldTypes.enumValues)
export type FormFieldType = z.infer<typeof formFieldTypesSchema>

export const formTemplateSchema = createSelectSchema(formTemplate)
export type FormTemplate = z.infer<typeof formTemplateSchema>
export const newFormTemplateSchema = createInsertSchema(formTemplate).omit({
  id: true,
})
export type NewFormTemplate = z.infer<typeof newFormTemplateSchema>

export const formFieldSchema = createSelectSchema(formField)
export type FormField = z.infer<typeof formFieldSchema>
export const newFormFieldSchema = createInsertSchema(formField).omit({
  id: true,
})
export type NewFormField = z.infer<typeof newFormFieldSchema>

export type FormTemplateWithFields = FormTemplate & { formFields: FormField[] }

export const newFormTemplateWithFieldsSchema = newFormTemplateSchema.extend({
  formFields: z.array(newFormFieldSchema.omit({ formTemplateId: true })),
})
export type NewFormTemplateWithFields = z.infer<
  typeof newFormTemplateWithFieldsSchema
>

class FormTemplateService {
  async createTemplate(
    newFormTemplate: NewFormTemplate,
  ): Promise<FormTemplate> {
    const [createdFormTemplate] = await db
      .insert(formTemplate)
      .values(newFormTemplate)
      .returning()

    return createdFormTemplate
  }

  async createTemplateField(newFormField: NewFormField): Promise<FormField> {
    const [createdFormField] = await db
      .insert(formField)
      .values(newFormField)
      .returning()

    return createdFormField
  }

  async createManyTemplateField(
    newFormFields: NewFormField[],
  ): Promise<FormField[]> {
    const createdFormFields = await db
      .insert(formField)
      .values(newFormFields)
      .returning()

    return createdFormFields
  }

  async updateFormTemplate(
    formTemplateId: string,
    updateFormTemplate: Partial<NewFormTemplate>,
  ): Promise<FormTemplate> {
    const [updatedFormTemplate] = await db
      .update(formTemplate)
      .set(updateFormTemplate)
      .where(eq(formTemplate.id, formTemplateId))
      .returning()

    return updatedFormTemplate
  }

  async updateFormField(
    formFieldId: string,
    updateFormField: Partial<NewFormField>,
  ): Promise<FormField> {
    const [updatedFormField] = await db
      .update(formField)
      .set(updateFormField)
      .where(eq(formField.id, formFieldId))
      .returning()

    return updatedFormField
  }

  async create(
    newFormTemplate: NewFormTemplateWithFields,
  ): Promise<FormTemplateWithFields> {
    const [createdFormTemplate] = await db
      .insert(formTemplate)
      .values({
        name: newFormTemplate.name,
        description: newFormTemplate.description,
      })
      .returning()

    const createdFormFields = await db
      .insert(formField)
      .values(
        newFormTemplate.formFields.map((field) => ({
          ...field,
          formTemplateId: createdFormTemplate.id,
        })),
      )
      .returning()

    return {
      ...createdFormTemplate,
      formFields: createdFormFields,
    }
  }

  async list(): Promise<FormTemplateWithFields[]> {
    return await db.query.formTemplate.findMany({
      with: { formFields: true, formSubmissions: true },
    })
  }

  async get(id: string): Promise<FormTemplateWithFields | undefined> {
    return await db.query.formTemplate.findFirst({
      where: (ft, { eq }) => eq(ft.id, id),
      with: { formFields: true },
    })
  }
}

export default new FormTemplateService()
