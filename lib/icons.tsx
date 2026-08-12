import {
  Bookmark,
  BookOpen,
  Briefcase,
  Calendar,
  Clapperboard,
  Code,
  FileText,
  Flame,
  FlaskConical,
  Folder,
  Globe,
  GraduationCap,
  Hash,
  House,
  Image,
  Lightbulb,
  Link as LinkIcon,
  ListChecks,
  Map,
  MessageSquare,
  Music,
  Notebook,
  Palette,
  Pin,
  Plane,
  Quote,
  Rocket,
  Sprout,
  Star,
  Target,
  Utensils,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * Drawn icons rather than emoji: emoji render differently on every platform and
 * sit oddly against the ink-and-paper styling, where a line drawing does not.
 *
 * The id is what goes in the database. Notebooks created before this change
 * still hold an emoji character, so anything unrecognised is rendered as text
 * and keeps working untouched.
 */
export const ICONS: Record<string, LucideIcon> = {
  notebook: Notebook,
  book: BookOpen,
  rocket: Rocket,
  briefcase: Briefcase,
  study: GraduationCap,
  lab: FlaskConical,
  palette: Palette,
  sprout: Sprout,
  map: Map,
  tools: Wrench,
  food: Utensils,
  film: Clapperboard,
  house: House,
  globe: Globe,
  music: Music,
  travel: Plane,

  file: FileText,
  checklist: ListChecks,
  idea: Lightbulb,
  bookmark: Bookmark,
  target: Target,
  star: Star,
  flame: Flame,
  message: MessageSquare,
  folder: Folder,
  pin: Pin,
  calendar: Calendar,
  code: Code,
  quote: Quote,
  picture: Image,
  link: LinkIcon,
  hash: Hash,
};

export const NOTEBOOK_ICON_IDS = [
  "notebook", "book", "rocket", "briefcase",
  "study", "lab", "palette", "sprout",
  "map", "tools", "food", "film",
  "house", "globe", "music", "travel",
];

export const PAGE_ICON_IDS = [
  "file", "checklist", "idea", "bookmark",
  "target", "star", "flame", "message",
  "folder", "pin", "calendar", "code",
  "quote", "picture", "link", "hash",
];

export const DEFAULT_NOTEBOOK_ICON = "notebook";
export const DEFAULT_PAGE_ICON = "file";

/** Human-readable label, used as the accessible name in the pickers. */
export function iconLabel(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Renders a stored icon value. Known ids become line icons; anything else is
 * shown as-is, which covers the emoji stored before icons were introduced.
 */
export function ItemIcon({
  name,
  size = 16,
  className,
}: {
  name: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const Icon = name ? ICONS[name] : undefined;

  if (!Icon) {
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }}>
        {name || ""}
      </span>
    );
  }

  return <Icon size={size} className={className} strokeWidth={1.8} aria-hidden="true" />;
}
