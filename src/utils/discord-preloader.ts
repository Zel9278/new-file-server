type DiscordPreloaderType = "upload" | "delete"

function DiscordPreloader(type: DiscordPreloaderType, text: string) {
  if (!process.env.DISCORD_WEBHOOK) return

  let messageData: { content: string }

  switch (type) {
    case "upload":
      messageData = {
        content: `:inbox_tray: New file uploaded\n${text}\nFrom ${process.env.NEXT_PUBLIC_NAME}`,
      }
      break
    case "delete":
      messageData = {
        content: `:outbox_tray: File deleted\n${text}\nFrom ${process.env.NEXT_PUBLIC_NAME}`,
      }
      break
  }

  fetch(process.env.DISCORD_WEBHOOK, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  })
}

export default DiscordPreloader
