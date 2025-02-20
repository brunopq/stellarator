import type { Route } from "./+types/formTemplates"
import { Link } from "react-router"

import FormTemplateService, {
  type FormTemplate,
  type FormField,
} from "~/.server/services/FormTemplateService"

import { Button } from "~/components/ui/button"

export function meta() {
  return [{ title: "" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  return await FormTemplateService.list()
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">
          Templates ({loaderData.length})
        </h1>

        <Button asChild>
          <Link to="new">Novo template</Link>
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
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  formSubmissions: any[]
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
