import {
  boolean,
  check,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  type PgColumnBuilderBase,
} from "drizzle-orm/pg-core"

import { baseTable, id } from "./utils"

import { template, templateField } from "./template"
import type { FieldType } from "./fieldType"
import { relations, sql } from "drizzle-orm"

export const submission = pgTable("submissions", {
  ...baseTable,
  templateId: id()
    .notNull()
    .references(() => template.id),
  submitterId: id().notNull() /*.references(() => user.id)*/,
  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  submittedAt: timestamp({ withTimezone: true, mode: "date" }),
})

// using this object ensures that we fill all the possible types
const submittedFieldValues = {
  textValue: text(),
  textareaValue: text(),
  numberValue: integer(),
  dateValue: timestamp({ withTimezone: true, mode: "date" }),
  checkboxValue: boolean(),
  // radioValue: text(),
  // selectValue: text(),
} satisfies Record<`${FieldType}Value`, PgColumnBuilderBase>

export const submittedField = pgTable(
  "submitted_fields",
  {
    submissionId: id()
      .notNull()
      .references(() => submission.id),
    templateFieldId: id()
      .notNull()
      .references(() => templateField.id),

    ...submittedFieldValues,
  },
  (table) => [
    primaryKey({ columns: [table.submissionId, table.templateFieldId] }),
    unique("only_one_submission_per_field").on(
      table.templateFieldId,
      table.submissionId,
    ),
    check(
      "only_one_field_value_check",
      sql`(
        CASE WHEN ${table.textValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.numberValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.textareaValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.checkboxValue} IS NOT NULL THEN 1 ELSE 0 END + 
        CASE WHEN ${table.dateValue} IS NOT NULL THEN 1 ELSE 0 END
      ) = 1`,
    ),
  ],
)

export const submissionRelations = relations(submission, ({ one, many }) => ({
  template: one(template, {
    fields: [submission.templateId],
    references: [template.id],
  }),
  // submitter: one("users", {
  //   fields: [formSubmission.submitterId],
  //   references: ["id"],
  // }),
  submittedFields: many(submittedField),
}))

export const submittedFieldRelations = relations(submittedField, ({ one }) => ({
  submission: one(submission, {
    fields: [submittedField.submissionId],
    references: [submission.id],
  }),
  templateField: one(templateField, {
    fields: [submittedField.templateFieldId],
    references: [templateField.id],
  }),
}))
