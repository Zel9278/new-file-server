import { createSwaggerSpec } from "next-swagger-doc"
import dynamic from "next/dynamic"
import "swagger-ui-react/swagger-ui.css"

const SwaggerUI = dynamic(
  () => import("swagger-ui-react").then((mod) => mod.default),
  {
    ssr: true,
  },
)

function ApiDoc() {
  const spec = createSwaggerSpec({
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
