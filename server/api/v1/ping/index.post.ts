export default defineEventHandler(() => {
  const msg = "pong!"
  const ms = Date.now()

  return { msg, ms }
})
