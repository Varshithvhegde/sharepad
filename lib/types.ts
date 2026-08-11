export type PaperTexture = "ruled" | "grid" | "dot" | "plain";
export type NotebookVisibility = "public" | "unlisted" | "private";

export interface Notebook {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  emoji: string;
  theme: PaperTexture;
  visibility: NotebookVisibility;
  read_only: boolean;
  burn_after_read: boolean;
  burn_consumed: boolean;
  expires_at: string | null;
  view_count: number;
  allow_comments: boolean;
  has_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  notebook_id: string;
  slug: string;
  title: string;
  content: string;
  icon: string;
  sort_order: number;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  page_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface PageVersion {
  id: string;
  page_id: string;
  content: string;
  created_at: string;
}

export interface SavedNotebook {
  slug: string;
  title: string;
  editToken: string;
  createdAt: string;
}

export interface CreateNotebookInput {
  title: string;
  slug?: string;
  description?: string;
  emoji?: string;
  theme?: PaperTexture;
  password?: string;
  expiresInDays?: number | null;
  pages?: { title: string; icon?: string; content?: string }[];
}

export interface UpdateNotebookInput {
  title?: string;
  description?: string;
  emoji?: string;
  theme?: PaperTexture;
  visibility?: NotebookVisibility;
  read_only?: boolean;
  burn_after_read?: boolean;
  allow_comments?: boolean;
  password?: string | null;
  expiresInDays?: number | null;
}

export interface CreatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  icon?: string;
}

export interface UpdatePageInput {
  title?: string;
  slug?: string;
  content?: string;
  icon?: string;
  sort_order?: number;
  pinned?: boolean;
}
