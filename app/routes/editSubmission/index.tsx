import type { Route } from "./+types/index"
import { AsteriskIcon } from "lucide-react"
import { format } from "date-fns"

import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Button } from "~/components/ui/button"

import { loader } from "./loader"
import { action } from "./action"
import {
  EditSubmissionContextProvider,
  useEditSubmissionContext,
} from "./context"
import type { FilledField } from "./types"

export { loader, action }

export default function FillForm({ loaderData }: Route.ComponentProps) {
  return (
    <EditSubmissionContextProvider initialSubmission={loaderData}>
      <div className="grid grid-cols-2 grid-rows-[auto_1fr] place-items-start gap-x-8 gap-y-6 rounded-xs border p-8 shadow-lg dark:border-primary-900/50 dark:bg-zinc-800">
        <EditSubmissionHeader />

        <FilledFieldsPreview />

        <FormFields />
      </div>
    </EditSubmissionContextProvider>
  )
}

function EditSubmissionHeader() {
  const { template, sync } = useEditSubmissionContext()

  return (
    <header className="col-span-2 flex w-full items-center justify-between">
      <h1 className="font-semibold text-2xl">
        Preenchendo ficha{" "}
        <strong className="dark:text-primary-100">{template.name}</strong>
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
