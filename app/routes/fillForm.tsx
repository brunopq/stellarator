import type { Route } from "./+types/fillForm"
import { redirect } from "react-router"

import { FormTemplatePreview, type FillableFormField } from "~/components/Form"
import type { StoreApi } from "zustand/vanilla"
import FormSubmissionService, {
  type FormSubmission,
  type FormSubmissionWithFields,
  type FullFormSubmission,
} from "~/.server/services/FormSubmissionService"
import { Button } from "~/components/ui/button"
import type { FormTemplateWithFields } from "~/.server/services/FormTemplateService"
import { createContext, useContext, type JSX } from "react"

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  const formSubmission = await FormSubmissionService.get(id)

  if (!formSubmission) {
    throw redirect("/submissions")
  }

  return formSubmission
}

type EditSubmissionContext = {
  formTemplate: FormTemplateWithFields
  submission: FullFormSubmission
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
  return (
    <editSubmissionContext.Provider
      value={{
        formTemplate: initialFormSubmission.formTemplate,
        submission: initialFormSubmission,
      }}
    >
      {children}
    </editSubmissionContext.Provider>
  )
}

export default function FillForm({ loaderData }: Route.ComponentProps) {
  return (
    <div className="grid grid-cols-2 grid-rows-[auto_1fr] place-items-start gap-x-8 gap-y-6 rounded-xs border p-8 shadow-lg dark:border-primary-900/50 dark:bg-zinc-800">
      <EditSubmissionHeader />

      <FilledFieldsPreview />

      {/*<FormTemplatePreview />*/}
    </div>
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
  const { submission } = useEditSubmissionContext()

  return (
    <div className="w-full space-y-4">
      {submission.formSubmissionFields.map((field) => (
        <div key={field.id} className="flex items-center space-x-2">
          <span className="font-medium">{field.formField.name}:</span>
          <span>
            {field.dateValue ||
              field.checkboxValue ||
              field.textValue ||
              field.textareaValue ||
              field.numberValue}
          </span>
        </div>
      ))}
    </div>
  )
}
