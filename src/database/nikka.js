import { db } from "./supabase.js"

export const CHATBOT = {
  table: "configs",
  feature: "chatbot",

  async enable(chatid) {
    await db
      .from(this.table)
      .upsert(
        { chat_id: chatid, feature: this.feature, state: true },
        { onConflict: ["chat_id", "feature"] }
      )
  },

  async disable(chatid) {
    await db
      .from(this.table)
      .upsert(
        { chat_id: chatid, feature: this.feature, state: false },
        { onConflict: ["chat_id", "feature"] }
      )
  },

  async isEnabled(chatid) {
    const { data, error } = await db
      .from(this.table)
      .select("state")
      .eq("chat_id", chatid)
      .eq("feature", this.feature)
      .maybeSingle() 
    if (error) {
      console.error("Supabase error:", error.message)
      return false
    }

    return data?.state ?? false
  }
}
