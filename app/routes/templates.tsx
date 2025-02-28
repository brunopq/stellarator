import type { Route } from "./+types/templates"
import { Form, Link, redirect } from "react-router"

import FormTemplateService, {
  type FormTemplate,
  type FormField,
} from "~/.server/services/TemplateService"

import { Button } from "~/components/ui/button"

export function meta() {
  return [{ title: "" }]
}

export async function loader({ request }: Route.LoaderArgs) {
  return await FormTemplateService.list()
}

export async function action({ request }: Route.ActionArgs) {
  const createdTemplate = await FormTemplateService.createTemplate({
    name: "Novo template",
    description: "Detalhes sobre o template",
  })

  return redirect(`edit/${createdTemplate.id}`)
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">
          Templates ({loaderData.length})
        </h1>

        <Form method="POST">
          <Button type="submit">Novo template</Button>
        </Form>
      </header>

      <div className="flex flex-wrap gap-4">
        {loaderData.map((template) => (
          // biome-ignore lint/suspicious/noExplicitAny: <explanation>
          <Template key={template.id} {...(template as any)} />
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
  id,
  name,
  description,
  formFields,
  formSubmissions,
}: TemplateProps) {
  return (
    <div className="min-w-lg border p-4 dark:border-zinc-500">
      <header className="flex items-center justify-between gap-2">
        <div>
          <span className="flex w-fit items-center justify-between gap-4 ">
            <h2 className="font-semibold text-lg">{name}</h2>
            <Link
              className="rounded-lg px-1.5 font-semibold text-sm transition-colors dark:bg-primary-400/25 dark:text-primary-100 dark:hover:bg-primary-300/40 dark:hover:text-primary-50"
              to={`edit/${id}`}
            >
              Editar
            </Link>
          </span>
          <p>{description}</p>
        </div>
        <div>
          <p>Campos: {formFields.length}</p>
          <p>Respostas: {formSubmissions.length}</p>
        </div>
      </header>

      <hr className="my-2 dark:border-zinc-500" />

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
    <div className="border p-2 dark:border-zinc-500">
      <h3 className="font-semibold text-md">{name}</h3>
      <p>{type}</p>
      <p>{required ? "Obrigatório" : "Opcional"}</p>
    </div>
  )
}
