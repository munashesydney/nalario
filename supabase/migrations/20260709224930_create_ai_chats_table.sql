-- Create the ai_chats table
create table public.ai_chats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  project_id uuid references public.projects(id) not null,
  title text not null default 'New Chat',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- Enable RLS
alter table public.ai_chats enable row level security;

-- Create policies for ai_chats
create policy "Users can view their own ai chats"
  on public.ai_chats for select
  using (auth.uid() = user_id);

create policy "Users can insert their own ai chats"
  on public.ai_chats for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own ai chats"
  on public.ai_chats for update
  using (auth.uid() = user_id);

create policy "Users can delete their own ai chats"
  on public.ai_chats for delete
  using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger set_updated_at_ai_chats
  before update on public.ai_chats
  for each row
  execute function public.handle_updated_at();

-- Add chat_id to ai_jobs
alter table public.ai_jobs 
  add column chat_id uuid references public.ai_chats(id) on delete cascade;
