export async function POST() {
  const msg = "pong!"
  const ms = Date.now()

  return new Response(JSON.stringify({ msg, ms }), {
    headers: { "content-type": "application/json" },
  })
}
