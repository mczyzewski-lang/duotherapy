// Dodatek do promptu grafik 2D (ilustracje artykułów, okładki 2D) – edytowalny w panelu „Wiedza”, dopisywany do każdego generowania.
import { system } from "./db";

export const DEFAULT_ART_EXTRA = "niech ludzik nie ma żadnego stroke wokół siebie, obramowania";

export async function artPromptExtra(): Promise<string> {
  try {
    const [r] = await system((tx) => tx<{ value: { extra?: string } }[]>`select value from app_settings where key = 'art'`);
    return typeof r?.value?.extra === "string" ? r.value.extra : DEFAULT_ART_EXTRA;
  } catch {
    return DEFAULT_ART_EXTRA;
  }
}

/** Fragment promptu z dodatkiem (pusty, gdy dodatek wyczyszczony). */
export const withExtra = (prompt: string, extra: string) =>
  extra.trim() ? `${prompt}\n\nAdditional instructions from the art director (must be followed): ${extra.trim()}` : prompt;
