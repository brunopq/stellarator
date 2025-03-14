import type { Route } from "./+types/home"
import { data, Form } from "react-router"

import {
  destroySession,
  getSession,
  getUserOrRedirect,
} from "~/.server/cookies/authSession"

import { Button } from "~/components/ui/button"

export async function loader({ request }: Route.LoaderArgs) {
  const user = await getUserOrRedirect(request, {
    roles: ["SELLER"],
    redirectPath: "/login",
  })
  return user
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request)

  return data({}, { headers: { "Set-Cookie": await destroySession(session) } })
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return (
    <div>
      <header className="flex items-center justify-between border-b">
        <h1>Home page</h1>

        <Form method="DELETE">
          <Button variant="destructive">Sair</Button>
        </Form>
      </header>

      <main>
        <h2>Welcome back, {loaderData.name}</h2>
        <p>{loaderData.id}</p>
        <p>{loaderData.role}</p>
        <p>Conta ativa?: {loaderData.accountActive ? "sim" : "não"}</p>
        <p>Nome completo: {loaderData.fullName}</p>
      </main>
    </div>
  )
}
