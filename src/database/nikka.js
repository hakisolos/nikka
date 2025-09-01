import { db } from "./supabase.js"

export const CHATBOT = {
  table: "chat_toggles",
  feature: "chatbot",

  async enable(chatid) {
    await db
      .from(this.table)
      .upsert({ chat_id: chatid, feature: this.feature, state: true })
  },

  async disable(chatid) {
    await db
      .from(this.table)
      .upsert({ chat_id: chatid, feature: this.feature, state: false })
  },

  async isEnabled(chatid) {
    const { data, error } = await db
      .from(this.table)
      .select("state")
      .eq("chat_id", chatid)
      .eq("feature", this.feature)
      .single()

    if (error) {
      console.error("Supabase error:", error.message)
      return false
    }

    return data?.state ?? false
  }
}
