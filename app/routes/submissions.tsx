import { Link } from "react-router"
import type { Route } from "./+types/submissions"

import FormTemplateService from "~/.server/services/FormTemplateService"
import { Button } from "~/components/ui/button"

export async function loader({ request }: Route.LoaderArgs) {
  return await FormTemplateService.list()
}

export default function Submissions({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <h1 className="font-semibold text-2xl">
          Templates disponíveis ({loaderData.length})
        </h1>
      </header>
      <ul className="space-y-6">
        {loaderData.map((template) => (
          <li className="grid grid-cols-[1fr_auto]" key={template.id}>
            <h3 className="font-semibold text-xl ">{template.name}</h3>
            <span>{template.description || "Sem descrição..."}</span>

            <Button asChild>
              <Link
                className="col-start-2 row-span-2 row-start-1"
                to={`fill/${template.id}`}
              >
                Preencher
              </Link>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
