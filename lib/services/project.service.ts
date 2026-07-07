import { createClient } from '../supabase/client'
import { Project } from '../models/project.model'

export const projectService = {
  async getProjects(workspaceId: string): Promise<Project[]> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data as Project[]
  },

  async getProject(id: string): Promise<Project> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Project
  },

  async createProject(workspaceId: string, name: string, width: number = 1920, height: number = 1080): Promise<Project> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .insert([
        { 
          workspace_id: workspaceId, 
          name,
          width,
          height,
          canvas_state: { elements: [] }
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  async updateProject(id: string, name: string): Promise<Project> {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('projects')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Project
  },

  async updateProjectState(id: string, canvasState: any): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .update({ 
        canvas_state: canvasState,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  },

  async deleteProject(id: string): Promise<void> {
    const supabase = createClient()
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
