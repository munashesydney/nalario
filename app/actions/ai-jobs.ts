"use server";

import { createClient } from "../../lib/supabase/server";

export async function createAiJobAction(
  prompt: string,
  projectId?: string,
  chatId?: string
) {
  const supabase = createClient();

  // Get current user on the server
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User must be authenticated to run AI jobs");

  // Insert the job into Supabase
  const { data, error } = await supabase
    .from("ai_jobs")
    .insert({
      user_id: user.id,
      project_id: projectId || null,
      chat_id: chatId || null,
      prompt: prompt,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) throw error;

  // Trigger the Express worker endpoint securely Server-to-Server
  const expressUrl = process.env.EXPRESS_URL || "http://localhost:4002";
  const workerSecret = process.env.WORKER_SECRET_KEY;
  
  if (!workerSecret) {
    console.error("Missing WORKER_SECRET_KEY environment variable");
    throw new Error("Server configuration error");
  }

  try {
    const response = await fetch(`${expressUrl}/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${workerSecret}`
      },
      body: JSON.stringify({ jobId: data.id, prompt }),
    });

    if (!response.ok) {
      console.error("Failed to trigger worker endpoint:", await response.text());
    }
  } catch (endpointError) {
    console.error("Express worker might be down:", endpointError);
  }

  return data.id;
}
