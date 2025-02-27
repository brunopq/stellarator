import { boolean, pgTable, smallint, text } from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

import { baseTable, id } from "./utils"

import { fieldTypes } from "./fieldType"
import { submission } from "./submission"

export const template = pgTable("templates", {
  ...baseTable,
  name: text().notNull(),
  description: text(),
})

export const templateField = pgTable("template_fields", {
  ...baseTable,
  templateId: id()
    .notNull()
    .references(() => template.id),
  name: text().notNull(),
  required: boolean().notNull(),
  type: fieldTypes().notNull(),
  order: smallint().notNull(),
})

export const templateRelations = relations(template, ({ many }) => ({
  fields: many(templateField),
  submissions: many(submission),
}))

export const templateFieldRelations = relations(
  templateField,
  ({ one, many }) => ({
    formTemplate: one(template, {
      fields: [templateField.templateId],
      references: [template.id],
    }),
    // not important for now ?
    // formSubmissionFields: many(formSubmissionFields),
  }),
)
