import { sql, relations } from "drizzle-orm"
import {
  boolean,
  char,
  check,
  integer,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  type PgColumnBuilderBase,
} from "drizzle-orm/pg-core"

import { customAlphabet } from "nanoid"

const idLength = 12
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  idLength,
)

// TODO: base object to be inherited

const id = () => char({ length: idLength })

export const formTemplate = pgTable("form_templates", {
  id: id().$defaultFn(nanoid).primaryKey(),
  name: text().notNull(),
  description: text(),
})

export const formTemplateRelations = relations(formTemplate, ({ many }) => ({
  formFields: many(formField),
  formSubmissions: many(formSubmission),
}))

const formFieldTypesArray = [
  "text",
  "textarea",
  "number",
  "date",
  "checkbox",
  // "radio",
  // "select",
] as const
type FormFieldTypes = (typeof formFieldTypesArray)[number]

const formFieldTypesAndValues: Record<
  `${FormFieldTypes}Value`,
  PgColumnBuilderBase
> = {
  textValue: text(),
  textareaValue: text(),
  numberValue: integer(),
  dateValue: timestamp({ withTimezone: true, mode: "date" }),
  checkboxValue: boolean(),
  // radioValue: text(),
  // selectValue: text(),
} as const

export const formFieldTypes = pgEnum("form_field_types", formFieldTypesArray)

export const formField = pgTable("form_fields", {
  id: id().$defaultFn(nanoid).primaryKey(),
  formTemplateId: id()
    .notNull()
    .references(() => formTemplate.id),
  name: text().notNull(),
  required: boolean().notNull(),
  type: formFieldTypes().notNull(),
  order: smallint().notNull(),
})

export const formFieldRelations = relations(formField, ({ one, many }) => ({
  formTemplate: one(formTemplate, {
    fields: [formField.formTemplateId],
    references: [formTemplate.id],
  }),
  // not important for now ?
  // formSubmissionFields: many(formSubmissionFields),
}))

export const formSubmission = pgTable("form_submissions", {
  id: id().$defaultFn(nanoid).primaryKey(),
  formTemplateId: id()
    .notNull()
    .references(() => formTemplate.id),
  submitterId: id().notNull() /*.references(() => user.id)*/,
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  submittedAt: timestamp({ withTimezone: true, mode: "date" }),
})

export const formSubmissionRelations = relations(
  formSubmission,
  ({ one, many }) => ({
    formTemplate: one(formTemplate, {
      fields: [formSubmission.formTemplateId],
      references: [formTemplate.id],
    }),
    // submitter: one("users", {
    //   fields: [formSubmission.submitterId],
    //   references: ["id"],
    // }),
    formSubmissionFields: many(formSubmissionFields),
  }),
)

export const formSubmissionFields = pgTable(
  "form_submission_fields",
  {
    id: id().$defaultFn(nanoid).primaryKey(),
    formSubmissionId: id()
      .notNull()
      .references(() => formSubmission.id),
    formFieldId: id()
      .notNull()
      .references(() => formField.id),

    ...formFieldTypesAndValues,
  },
  (table) => [
    check(
      "only_one_field_value_check",
      sql`(
        CASE WHEN ${table.textValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.numberValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.textareaValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.checkboxValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.dateValue} IS NOT NULL THEN 1 ELSE 0 END
      ) = 1`,
      // CASE WHEN ${table.radioValue} IS NOT NULL THEN 1 ELSE 0 END
    ),
  ],
)

export const formSubmissionFieldsRelations = relations(
  formSubmissionFields,
  ({ one }) => ({
    formSubmission: one(formSubmission, {
      fields: [formSubmissionFields.formSubmissionId],
      references: [formSubmission.id],
    }),
    formField: one(formField, {
      fields: [formSubmissionFields.formFieldId],
      references: [formField.id],
    }),
  }),
)
