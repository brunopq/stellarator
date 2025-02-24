import { Form, Link, redirect } from "react-router"
import type { Route } from "./+types/fichas"

import FormTemplateService from "~/.server/services/FormTemplateService"
import FormSubmissionService from "~/.server/services/FormSubmissionService"

import { Button } from "~/components/ui/button"

export async function loader({ request }: Route.LoaderArgs) {
  const templates = await FormTemplateService.list()
  const userSubmissions = await FormSubmissionService.listByUser("123")

  return {
    templates,
    userSubmissions,
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const formTemplateId = formData.get("formTemplateId")

  if (!formTemplateId || typeof formTemplateId !== "string") {
    return redirect("/fichas")
  }

  const createdSumission = await FormSubmissionService.create({
    formTemplateId,
    submitterId: "123",
  })

  return redirect(`edit/${createdSumission.id}`)
}

export default function Fichas({ loaderData }: Route.ComponentProps) {
  const { templates, userSubmissions } = loaderData

  return (
    <div>
      <section>
        <header className="mb-8 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">
            Templates disponíveis ({templates.length})
          </h1>
        </header>
        <ul className="space-y-6">
          {templates.map((template) => (
            <li className="grid grid-cols-[1fr_auto]" key={template.id}>
              <h3 className="font-semibold text-xl ">{template.name}</h3>
              <span>{template.description || "Sem descrição..."}</span>

              <Form
                className="col-start-2 row-span-2 row-start-1"
                method="POST"
              >
                <Button name="formTemplateId" value={template.id} type="submit">
                  Preencher
                </Button>
              </Form>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="font-semibold text-2xl">Suas fichas:</h1>
        </header>

        <ul>
          {userSubmissions.map((submission) => (
            <li key={submission.id}>
              <strong>{submission.createdAt.toDateString()}</strong>

              <Button asChild>
                <Link to={`edit/${submission.id}`}>Continuar preenchendo</Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
