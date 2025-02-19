import isBrowser from "@/utils/checkBrowserRegex"
import type { Middleware } from "./middlewareChain"
import chalk from "chalk"

chalk.level = 3

export const requestLogMiddleware: Middleware = async (req, _event, next) => {
  const userAgent = req.headers.get("user-agent")

  if (isBrowser(userAgent)) {
    console.log(chalk.blue("This is a browser request"))
  } else {
    console.log(chalk.yellow("This is not a browser request"))
  }

  console.log(
    chalk.gray(`[${new Date().toISOString()}]`) +
      chalk.cyan(" [Request ]     ") +
      chalk.green(`${req.method} `) +
      chalk.white(`${req.url}`) +
      chalk.gray(` | ${userAgent}`),
  )

  const response = await next()

  console.log(
    chalk.gray(`[${new Date().toISOString()}]`) +
      chalk.magenta(" [Response] ") +
      chalk.hex(response.status === 200 ? "#00FF00" : "#FF0000")(
        `${response.status} `,
      ) +
      chalk.green(`${req.method} `) +
      chalk.white(`${req.url}`) +
      chalk.gray(` | ${userAgent}`),
  )

  return response
}
