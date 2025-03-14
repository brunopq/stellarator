import type { Route } from "./+types/home"
import { data, Form, redirect } from "react-router"

import {
  destroySession,
  getSession,
  getToken,
} from "~/.server/cookies/authSession"

import { Button } from "~/components/ui/button"

export async function loader({ request }: Route.LoaderArgs) {
  const token = await getToken(request)

  if (!token) {
    return redirect("/login")
  }
}

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request)

  return data({}, { headers: { "Set-Cookie": await destroySession(session) } })
}

export default function Home() {
  return (
    <div>
      <header className="flex items-center justify-between border-b">
        <h1>Home page</h1>

        <Form method="DELETE">
          <Button variant="destructive">Sair</Button>
        </Form>
      </header>
    </div>
  )
}
