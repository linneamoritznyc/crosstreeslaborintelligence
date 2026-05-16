export interface Job {
  id: string;
  title: string;
  employer: string;
  description: string | null;
  municipality: string | null;
  published_at: string | null;
}
