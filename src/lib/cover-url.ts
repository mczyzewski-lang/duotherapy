// Adresy okładek – bez zależności od bazy (używane także w komponentach przeglądarki).
export type CoverVariant = "photo" | "illustration";
/** Aktualna wersja układu okładki 2D (pozioma grafika w pasie). Starsze – pionowe, pokazywane w całości. */
export const COVER_ART_LAYOUT = 2;
export const coverPhotoUrl = (slug: string, v: Date | number, variant: CoverVariant = "photo", layout = COVER_ART_LAYOUT) =>
  `/wiedza-okladki/${slug}?${variant === "illustration" ? `s=illustration&l=${layout}&` : ""}v=${new Date(v).getTime()}`;
/** Okładka 2D w starym (pionowym) układzie – w pasie pokazujemy ją w całości, bez kadrowania. */
export const isLegacyArtCover = (src?: string | null) => isIllustrationCover(src) && !src!.includes(`l=${COVER_ART_LAYOUT}`);
/** Adres wskazuje grafikę 2D (okładka jasna, tytuł ciemny). */
export const isIllustrationCover = (src?: string | null) => !!src && src.includes("s=illustration");
