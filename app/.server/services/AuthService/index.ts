import { fetch } from "bun"
import { z } from "zod"

import { env } from "~/utils/envConfig.server"

type LoginInfo = { username: string; password: string }

const loginResponseSchema = z.object({
  token: z.string(),
})

const userRoleSchema = z.enum(["ADMIN", "SELLER"])

export type UserRole = z.infer<typeof userRoleSchema>

const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  fullName: z.string().nullable(),
  role: userRoleSchema,
  accountActive: z.boolean(),
})

export type User = z.infer<typeof userSchema>

class AuthService {
  async login(data: LoginInfo) {
    const response = await fetch(`${env.AUTH_URL}/login`, {
      body: JSON.stringify({ ...data }),
      headers: {
        "Content-Type": "application/json",
      },

      method: "POST",
    })

    if (response.status !== 200) {
      throw new Error("Login failed")
    }

    const json = await response.json()
    const result = loginResponseSchema.safeParse(json)

    if (!result.success) {
      console.error("Login response is invalid")
      console.error(json)
      console.error(result.error)

      throw new Error("Login response is invalid")
    }

    return result.data.token
  }

  async getUserInfo(token: string) {
    const response = await fetch(`${env.AUTH_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.status !== 200) {
      throw new Error("Failed to get user info")
    }

    const json = await response.json()

    const result = userSchema.safeParse(json)

    if (!result.success) {
      console.error("User info response is invalid")
      console.error(json)
      console.error(result.error)

      throw new Error("User info response is invalid")
    }

    return result.data
  }
}

export default new AuthService()
