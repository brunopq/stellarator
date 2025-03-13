import { fetch } from "bun"
import { env } from "~/utils/envConfig.server"

type LoginInfo = { username: string; password: string }

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

    const { token } = (await response.json()) as { token: string }
    return token
  }
}

export default new AuthService()
