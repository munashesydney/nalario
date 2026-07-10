import { createClient } from "../supabase/client";


// Service to interact with the Supabase ai_jobs table
export const aiJobService = {
  /**
   * Fetches the current state of a job. Useful to check if a job finished
   * before the websocket could connect.
   */
  async getJob(jobId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_jobs")
      .select("*")
      .eq("id", jobId)
      .single();
    if (error) throw error;
    return data;
  },

  /**
   * Fetches all jobs (messages) for a given chat, ordered chronologically.
   */
  async getJobsByChat(chatId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("ai_jobs")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });
      
    if (error) throw error;
    return data || [];
  },


  /**
   * Subscribes to real-time updates for a specific job ID.
   */
  subscribeToJob(jobId: string, onUpdate: (payload: any) => void) {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`job-${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "ai_jobs",
          filter: `id=eq.${jobId}`,
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
