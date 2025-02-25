import type { Route } from "./+types/fillForm"
import { redirect } from "react-router"
import { createContext, useContext, useState, type JSX } from "react"
import { AsteriskIcon } from "lucide-react"
import { format } from "date-fns"

import FormSubmissionService, {} from "~/.server/services/FormSubmissionService"
import type {
  FormFieldType,
  FormTemplateWithFields,
} from "~/.server/services/FormTemplateService"

import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  const formSubmission = await FormSubmissionService.get(id)

  if (!formSubmission) {
    throw redirect("/submissions")
  }

  return formSubmission
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

type EditSubmissionContextProviderProps = {
  initialFormSubmission: Route.ComponentProps["loaderData"]
  children: JSX.Element
}

function EditSubmissionContextProvider({
  initialFormSubmission,
  children,
}: EditSubmissionContextProviderProps) {
  const [formTemplate, _] = useState(initialFormSubmission.formTemplate)
  const [filledFormFields, setFilledFormFields] = useState(
    initialFormSubmission.formTemplate.formFields.map((field) => ({
      fieldName: field.name,
      fieldRequired: field.required,
      order: field.order,
      templateFieldId: field.id,
      type: field.type,
    })),
  )

  const setFieldValue: EditSubmissionContext["setFieldValue"] = (id, value) => {
    setFilledFormFields((prev) =>
      prev.map((field) =>
        field.templateFieldId === id ? { ...field, value } : field,
      ),
    )
  }

  return (
    <editSubmissionContext.Provider
      value={{
        formTemplate,
        filledFormFields,
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
  const { formTemplate } = useEditSubmissionContext()

  return (
    <header className="col-span-2 flex items-center justify-between">
      <h1 className="font-semibold text-2xl">
        Preenchend ficha{" "}
        <strong className="dark:text-primary-100">{formTemplate.name}</strong>
      </h1>
    </header>
  )
}

function FilledFieldsPreview() {
  const { filledFormFields } = useEditSubmissionContext()

  return (
    <div className="w-full space-y-4">
      {filledFormFields.map((field) => (
        <div
          key={field.templateFieldId}
          className="flex items-center space-x-2"
        >
          <span className="font-medium">{field.fieldName}:</span>
          <span>
            {field.value &&
              (field.type === "date"
                ? format(field.value, "dd/MM/yyyy")
                : field.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

function FormFields() {
  const { filledFormFields } = useEditSubmissionContext()

  return (
    <div>
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
  const { setFieldValue } = useEditSubmissionContext()

  const fieldTypeInputMap: Record<FormFieldType, JSX.Element> = {
    text: (
      <label>
        <Input
          onChange={(e) => setFieldValue(field.templateFieldId, e.target.value)}
          type="text"
          placeholder={`${field.fieldName}...`}
        />
      </label>
    ),
    number: (
      <label>
        <Input
          onChange={(e) =>
            setFieldValue(field.templateFieldId, e.target.valueAsNumber)
          }
          type="number"
          placeholder={`${field.fieldName}...`}
        />
      </label>
    ),
    textarea: (
      <label>
        <Textarea
          onChange={(e) => setFieldValue(field.templateFieldId, e.target.value)}
          placeholder={`${field.fieldName}...`}
        />
      </label>
    ),
    date: (
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
        />
      </label>
    ),
    checkbox: (
      <label className="flex items-center gap-2">
        <input
          onChange={(e) =>
            setFieldValue(field.templateFieldId, e.target.checked)
          }
          type="checkbox"
        />
        <span>{field.fieldName}</span>
      </label>
    ),
  }

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

      {fieldTypeInputMap[field.type]}
    </div>
  )
}
