import posthog from "posthog-js";

/**
 * Every event the app sends, in one place.
 *
 * The properties are deliberately shaped so nothing identifying can travel
 * with them: no note content, no titles, no slugs and above all no edit
 * tokens. An edit token is a write-access credential — putting one in an
 * analytics payload would hand notebook control to a third party.
 */
export type AnalyticsEvent =
  | { name: "notebook_created"; props: NotebookCreatedProps }
  | { name: "page_added"; props: { template: string } }
  | { name: "page_duplicated"; props: Record<string, never> }
  | { name: "page_deleted"; props: Record<string, never> }
  | { name: "notebook_shared"; props: { via: "copy_link" | "qr_code" } }
  | { name: "export_started"; props: { format: "pdf" | "markdown" } }
  | { name: "settings_saved"; props: SettingsSavedProps }
  | { name: "notebook_deleted"; props: Record<string, never> }
  | { name: "comment_added"; props: Record<string, never> }
  | { name: "notebook_unlocked"; props: Record<string, never> }
  | { name: "notebook_recovered"; props: Record<string, never> };

interface NotebookCreatedProps {
  /** Which entry point produced it, so the quick path can be judged. */
  source: "quick" | "new";
  page_count: number;
  has_password: boolean;
  /** null means it never expires. */
  expiry_days: number | null;
  open_edit: boolean;
  font?: string;
  paper?: string;
  custom_slug?: boolean;
}

interface SettingsSavedProps {
  changed_expiry: boolean;
  changed_password: boolean;
  changed_visibility: boolean;
  open_edit: boolean;
}

export function track(event: AnalyticsEvent): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  try {
    posthog.capture(event.name, event.props);
  } catch {
    // Analytics must never break the thing being measured.
  }
}
