import { createClient } from "../supabase/client";
import { AIChat } from "../models/ai-chat.model";

export const aiChatService = {
  /**
   * Fetches all chats for a given project.
   */
  async getChats(projectId: string): Promise<AIChat[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_chats")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Creates a new chat for a given project.
   */
  async createChat(projectId: string, title?: string): Promise<AIChat> {
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const { data, error } = await supabase
      .from("ai_chats")
      .insert({
        project_id: projectId,
        user_id: userData.user.id,
        title: title || "New Chat",
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Deletes a chat and all its associated jobs (handled by ON DELETE CASCADE).
   */
  async deleteChat(chatId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("ai_chats").delete().eq("id", chatId);
    if (error) throw error;
  }
};
