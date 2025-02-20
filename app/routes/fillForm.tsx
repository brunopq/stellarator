import FormTemplateService from "~/.server/services/FormTemplateService"
import type { Route } from "./+types/fillForm"
import { redirect } from "react-router"
import { Input } from "~/components/ui/input"

export async function loader({ params }: Route.LoaderArgs) {
  const id = params.id

  const formTemplate = await FormTemplateService.get(id)

  if (!formTemplate) {
    throw redirect("/submissions")
  }

  return formTemplate
}

export default function FillForm({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">{loaderData.name}</h1>
      </header>
      <form>
        <ul className="space-y-6">
          {loaderData.formFields.map((field) => (
            <li key={field.id}>
              <label htmlFor={field.id} className="font-semibold text-lg">
                {field.name}
              </label>
              <Input
                type={field.type}
                id={field.id}
                name={field.id}
                required={field.required}
              />
            </li>
          ))}
        </ul>
        <button type="submit">Enviar</button>
      </form>
    </div>
  )
}
