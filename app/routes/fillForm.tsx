import type { Route } from "./+types/fillForm"
import { redirect, useFetcher } from "react-router"
import { createContext, useContext, useState, type JSX } from "react"
import { AsteriskIcon } from "lucide-react"
import { format } from "date-fns"
import { z } from "zod"

import FormSubmissionService, {
  syncFieldSchema,
  type FormSubmissionField,
  type SyncField,
} from "~/.server/services/FormSubmissionService"
import type {
  FormField,
  FormTemplateWithFields,
} from "~/.server/services/FormTemplateService"

import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  const formSubmission = await FormSubmissionService.get(id)

  if (!formSubmission) {
    throw redirect("/submissions")
  }

  return formSubmission
}

export async function action({ request, params }: Route.ActionArgs) {
  const submissionId = params.id

  const json = await request.json()

  const parsed = z.array(syncFieldSchema).parse(json)

  const updated = await FormSubmissionService.syncSubmissionFields(
    submissionId,
    parsed,
  )

  return updated
}

type BaseFilledField = {
  templateFieldId: string
  fieldName: string
  fieldRequired: boolean
  order: number
}

type FilledField = BaseFilledField &
  (
    | { type: "text"; value?: string }
    | { type: "textarea"; value?: string }
    | { type: "number"; value?: number }
    | { type: "date"; value?: Date }
    | { type: "checkbox"; value?: boolean }
  )

type EditSubmissionContext = {
  formTemplate: FormTemplateWithFields
  filledFormFields: FilledField[]

  sync: () => void

  setFieldValue: (id: string, value: FilledField["value"]) => void
}

const editSubmissionContext = createContext<EditSubmissionContext | null>(null)

function useEditSubmissionContext() {
  const ctx = useContext(editSubmissionContext)

  if (!ctx) {
    throw new Error(
      "`useEditSubmissionContext` should be used inside the `EditSubmissionContextProvider`",
    )
  }

  return ctx
}
const toDomain = (
  submissionField: FormSubmissionField,
  templateField: FormField,
): FilledField => {
  const baseField = {
    fieldName: templateField.name,
    fieldRequired: templateField.required,
    order: templateField.order,
    templateFieldId: submissionField.formFieldId,
  }

  if (templateField.type === "checkbox") {
    return {
      ...baseField,
      type: "checkbox",
      value: submissionField.checkboxValue ?? undefined,
    }
  }
  if (templateField.type === "date") {
    return {
      ...baseField,
      type: "date",
      value: submissionField.dateValue ?? undefined,
    }
  }
  if (templateField.type === "number") {
    return {
      ...baseField,
      type: "number",
      value: submissionField.numberValue ?? undefined,
    }
  }
  if (templateField.type === "text") {
    return {
      ...baseField,
      type: "text",
      value: submissionField.textValue ?? undefined,
    }
  }
  if (templateField.type === "textarea") {
    return {
      ...baseField,
      type: "textarea",
      value: submissionField.textareaValue ?? undefined,
    }
  }
  throw new Error("unreachable")
}

type EditSubmissionContextProviderProps = {
  initialFormSubmission: Route.ComponentProps["loaderData"]
  children: JSX.Element
}

function EditSubmissionContextProvider({
  initialFormSubmission,
  children,
}: EditSubmissionContextProviderProps) {
  const syncFetcher = useFetcher<typeof action>()

  const [formTemplate, _] = useState(initialFormSubmission.formTemplate)
  const [filledFormFields, setFilledFormFields] = useState<FilledField[]>(
    initialFormSubmission.formTemplate.formFields.map((templateField) => {
      const submissionField = initialFormSubmission.formSubmissionFields.find(
        (s) => s.formFieldId === templateField.id,
      )

      if (!submissionField) {
        return {
          fieldName: templateField.name,
          fieldRequired: templateField.required,
          order: templateField.order,
          templateFieldId: templateField.id,
          type: templateField.type,
        }
      }

      return toDomain(submissionField, templateField)
    }),
  )

  const toPersistance = (field: FilledField): SyncField => {
    const syncField: SyncField = {
      formFieldId: field.templateFieldId,
      formSubmissionId: initialFormSubmission.id,
      checkboxValue: null,
      dateValue: null,
      numberValue: null,
      textValue: null,
      textareaValue: null,
    }

    if (field.value === undefined) return syncField

    switch (field.type) {
      case "text":
        syncField.textValue = field.value
        break
      case "textarea":
        syncField.textareaValue = field.value
        break
      case "number":
        syncField.numberValue = field.value
        break
      case "date":
        syncField.dateValue = field.value
        break
      case "checkbox":
        syncField.checkboxValue = field.value
        break
    }

    return syncField
  }

  const sync = () => {
    const payload = filledFormFields.map(toPersistance)
    syncFetcher.submit(JSON.stringify(payload), {
      method: "POST",
      encType: "application/json",
    })
  }

  const setFieldValue: EditSubmissionContext["setFieldValue"] = (id, value) => {
    setFilledFormFields((prev) =>
      prev.map((field) => {
        if (field.templateFieldId === id) {
          if (
            (field.type === "text" || field.type === "textarea") &&
            typeof value === "string"
          ) {
            return { ...field, value }
          }
          if (field.type === "number" && typeof value === "number") {
            return { ...field, value }
          }
          if (field.type === "date" && value instanceof Date) {
            return { ...field, value }
          }
          if (field.type === "checkbox" && typeof value === "boolean") {
            return { ...field, value }
          }
        }
        return field
      }),
    )
  }

  return (
    <editSubmissionContext.Provider
      value={{
        formTemplate,
        filledFormFields,

        sync,
        setFieldValue,
      }}
    >
      {children}
    </editSubmissionContext.Provider>
  )
}

export default function FillForm({ loaderData }: Route.ComponentProps) {
  return (
    <EditSubmissionContextProvider initialFormSubmission={loaderData}>
      <div className="grid grid-cols-2 grid-rows-[auto_1fr] place-items-start gap-x-8 gap-y-6 rounded-xs border p-8 shadow-lg dark:border-primary-900/50 dark:bg-zinc-800">
        <EditSubmissionHeader />

        <FilledFieldsPreview />

        <FormFields />
      </div>
    </EditSubmissionContextProvider>
  )
}

function EditSubmissionHeader() {
  const { formTemplate, sync } = useEditSubmissionContext()

  return (
    <header className="col-span-2 flex w-full items-center justify-between">
      <h1 className="font-semibold text-2xl">
        Preenchendo ficha{" "}
        <strong className="dark:text-primary-100">{formTemplate.name}</strong>
      </h1>

      <Button onClick={sync}>Salvar</Button>
    </header>
  )
}

function FilledFieldsPreview() {
  const { filledFormFields } = useEditSubmissionContext()

  return (
    <div className="w-full space-y-4">
      {filledFormFields.map((field) => (
        <div key={field.templateFieldId} className="">
          <span className="font-semibold text-zinc-300">
            {field.fieldName}:{" "}
          </span>
          {field.value !== undefined && (
            <span className="text-zinc-50">
              {field.type === "date"
                ? format(field.value, "dd/MM/yyyy")
                : field.type === "checkbox"
                  ? field.value
                    ? "Sim"
                    : "Não"
                  : field.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function FormFields() {
  const { filledFormFields } = useEditSubmissionContext()

  return (
    <div className="w-full space-y-4">
      {filledFormFields.map((field) => (
        <Field key={field.templateFieldId} field={field} />
      ))}
    </div>
  )
}

type FieldProps = {
  field: FilledField
}
function Field({ field }: FieldProps) {
  return (
    <div className="">
      <strong className="-mb-0.5 relative inline-block text-sm text-zinc-700 dark:text-zinc-400">
        <span className="overflow-hidden overflow-ellipsis">
          {field.fieldName}
        </span>
        {field.fieldRequired && (
          <AsteriskIcon className="-translate-y-1/6 absolute top-0 right-0 size-3.5 translate-x-4/5 text-red-500 dark:text-red-400" />
        )}
      </strong>

      <FieldInput field={field} />
    </div>
  )
}

function FieldInput({ field }: FieldProps) {
  const { setFieldValue } = useEditSubmissionContext()

  if (field.type === "text")
    return (
      <label>
        <Input
          onChange={(e) => setFieldValue(field.templateFieldId, e.target.value)}
          type="text"
          placeholder={`${field.fieldName}...`}
          value={field.value}
        />
      </label>
    )
  if (field.type === "number")
    return (
      <label>
        <Input
          onChange={(e) =>
            setFieldValue(field.templateFieldId, e.target.valueAsNumber)
          }
          type="number"
          placeholder={`${field.fieldName}...`}
          value={field.value}
        />
      </label>
    )
  if (field.type === "textarea")
    return (
      <label>
        <Textarea
          onChange={(e) => setFieldValue(field.templateFieldId, e.target.value)}
          placeholder={`${field.fieldName}...`}
          value={field.value}
        />
      </label>
    )
  if (field.type === "date")
    return (
      <label>
        <Input
          onChange={(e) =>
            setFieldValue(
              field.templateFieldId,
              e.target.valueAsDate ?? undefined,
            )
          }
          type="date"
          placeholder={`${field.fieldName}...`}
          value={field.value && format(field.value, "yyyy-MM-dd")}
        />
      </label>
    )
  if (field.type === "checkbox")
    return (
      <label className="flex items-center gap-2">
        <input
          onChange={(e) =>
            setFieldValue(field.templateFieldId, e.target.checked)
          }
          checked={field.value}
          type="checkbox"
        />
        <span>{field.fieldName}</span>
      </label>
    )
}
