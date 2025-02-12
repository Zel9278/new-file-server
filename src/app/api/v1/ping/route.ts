export async function POST(request: Request) {
  const msg = "pong!"
  const ms = Date.now()

  return new Response(JSON.stringify({ msg, ms }), {
    headers: { "content-type": "application/json" },
  })
}
