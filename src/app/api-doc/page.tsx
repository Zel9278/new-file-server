import { createSwaggerSpec } from "next-swagger-doc"
import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"

const SwaggerUI = dynamic<{
  spec: any
  //@ts-ignore
}>(() => import("swagger-ui-react"), { ssr: true })

function ApiDoc() {
  const spec: Record<string, any> = createSwaggerSpec({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "File API",
        version: "1.0",
      },
      components: {
        securitySchemes: {
          tokenAuth: {
            type: "apiKey",
            in: "header",
            name: "Authorization",
          },
        },
      },
    },
    apiFolder: "src/app/api",
  })

  return (
    <div data-theme="light">
      <SwaggerUI spec={spec} />
    </div>
  )
}

export default ApiDoc
