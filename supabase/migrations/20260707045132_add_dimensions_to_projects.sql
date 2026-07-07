-- Add dimensions to projects
ALTER TABLE public.projects 
ADD COLUMN width integer DEFAULT 1920 NOT NULL,
ADD COLUMN height integer DEFAULT 1080 NOT NULL;
