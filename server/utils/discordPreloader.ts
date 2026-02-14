type DiscordPreloaderType = "upload" | "delete" | "rename"

/**
 * Send notification to Discord webhook
 * @param type - Type of action (upload, delete, rename)
 * @param text - Message text
 */
export function discordPreloader(type: DiscordPreloaderType, text: string): void {
  const config = useRuntimeConfig()
  
  if (!config.discordWebhook) return

  let messageData: { content: string }

  switch (type) {
    case "upload":
      messageData = {
        content: `:inbox_tray: New file uploaded\n${text}\nFrom ${config.public.name}`,
      }
      break
    case "delete":
      messageData = {
        content: `:outbox_tray: File deleted\n${text}\nFrom ${config.public.name}`,
      }
      break
    case "rename":
      messageData = {
        content: `:pencil2: File renamed\n${text}\nFrom ${config.public.name}`,
      }
      break
  }

  fetch(config.discordWebhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messageData),
  })
}
