import { createCookieSessionStorage } from "react-router"

import { env } from "~/utils/envConfig.server"

const cookieSecret = env.COOKIE_SECRET

export type SessionData = {
  token: string
}

export const {
  commitSession,
  destroySession,
  getSession: _getSession,
} = createCookieSessionStorage<SessionData>({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: false,
    secrets: [cookieSecret],
    secure: env.NODE_ENV === "production",
  },
})

export async function getSession(request: Request) {
  return await _getSession(request.headers.get("Cookie"))
}

export async function getToken(request: Request): Promise<string | null> {
  const session = await getSession(request)

  const user = session.get("token")

  return user ?? null
}
