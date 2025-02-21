import type { Route } from "./+types/fillForm"
import { redirect } from "react-router"
import { create, type UseBoundStore } from "zustand/react"
import { combine } from "zustand/middleware"

import FormTemplateService from "~/.server/services/FormTemplateService"

import { FormTemplatePreview, type FillableFormField } from "~/components/Form"
import type { StoreApi } from "zustand/vanilla"

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  const formTemplate = await FormTemplateService.get(id)

  if (!formTemplate) {
    throw redirect("/submissions")
  }

  return formTemplate
}

export default function FillForm({ loaderData }: Route.ComponentProps) {
  const store = create(
    combine(
      {
        fields: loaderData.formFields.map((f) => ({
          ...f,
          value: "" as string | number | boolean,
        })),
      },
      (set) => ({
        setField: (fieldId: string, fieldData: Partial<FillableFormField>) =>
          set((state) => ({
            fields: state.fields.map((field) =>
              field.id === fieldId ? { ...field, ...fieldData } : field,
            ),
          })),
      }),
    ),
  )

  return (
    <div className="grid grid-cols-2 grid-rows-[auto_1fr] place-items-start gap-x-8 gap-y-6 rounded-xs border p-8 shadow-lg dark:border-primary-900/50 dark:bg-zinc-800">
      <header className="col-span-2 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">
          Preenchend ficha{" "}
          <strong className="dark:text-primary-100">{loaderData.name}</strong>
        </h1>
      </header>

      <FilledFieldsPreview useFields={store} />

      <FormTemplatePreview useFields={store} />
    </div>
  )
}

type Write<T, U> = Omit<T, keyof U> & U

type Store = UseBoundStore<
  StoreApi<
    Write<
      {
        fields: FillableFormField[]
      },
      {
        setField: (
          fieldId: string,
          fieldData: Partial<FillableFormField>,
        ) => void
      }
    >
  >
>

type FilledFieldsPreviewProps = {
  useFields: Store
}

function FilledFieldsPreview({ useFields }: FilledFieldsPreviewProps) {
  const fields = useFields((state) => state.fields)

  return (
    <div className="w-full space-y-4">
      {fields.map((field) => (
        <div key={field.id} className="flex items-center space-x-2">
          <span className="font-medium">{field.name}:</span>
          <span>{field.value}</span>
        </div>
      ))}
    </div>
  )
}
