export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  canvas_state: any; // We'll type this properly when we build the canvas
  width: number;
  height: number;
  created_at: string;
  updated_at: string;
}
