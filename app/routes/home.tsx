import { createSelectSchema } from "drizzle-zod"
import type { Route } from "./+types/home"
import { Link } from "react-router"
import type { z } from "zod"

import { db } from "~/services/db"
import { formTemplate, formField, formSubmission } from "~/services/db/schema"
import { Button } from "~/components/ui/button"

const formTemplateSchema = createSelectSchema(formTemplate)
type FormTemplate = z.infer<typeof formTemplateSchema>
const formFieldSchema = createSelectSchema(formField)
export type FormField = z.infer<typeof formFieldSchema>
const formSubmissionSchema = createSelectSchema(formSubmission)
type FormSubmission = z.infer<typeof formSubmissionSchema>

export function meta() {
  return [{ title: "" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  const something = await db.query.formTemplate.findMany({
    with: { formFields: true, formSubmissions: true },
  })

  return something
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">
          Templates ({loaderData.length})
        </h1>

        <Button asChild>
          <Link to="/form-templates/new">Novo template</Link>
        </Button>
      </header>

      <div className="flex flex-wrap gap-4">
        {loaderData.map((template) => (
          <Template key={template.id} {...template} />
        ))}
      </div>
    </>
  )
}

type TemplateProps = FormTemplate & {
  formFields: FormField[]
  formSubmissions: FormSubmission[]
}

function Template({
  name,
  description,
  formFields,
  formSubmissions,
}: TemplateProps) {
  return (
    <div className="min-w-lg border p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold text-lg">{name}</h2>
          <p>{description}</p>
        </div>
        <div>
          <p>Campos: {formFields.length}</p>
          <p>Respostas: {formSubmissions.length}</p>
        </div>
      </header>

      <hr className="my-2" />

      <div className="flex flex-wrap gap-2">
        {formFields.map((field) => (
          <Field key={field.id} {...field} />
        ))}
      </div>
    </div>
  )
}

type FieldProps = FormField

function Field({ name, type, required }: FieldProps) {
  return (
    <div className="border p-2">
      <h3 className="font-semibold text-md">{name}</h3>
      <p>{type}</p>
      <p>{required ? "Obrigatório" : "Opcional"}</p>
    </div>
  )
}
