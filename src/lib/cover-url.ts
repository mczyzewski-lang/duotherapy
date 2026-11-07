// Adresy okładek – bez zależności od bazy (używane także w komponentach przeglądarki).
export type CoverVariant = "photo" | "illustration";
export const coverPhotoUrl = (slug: string, v: Date | number, variant: CoverVariant = "photo") =>
  `/wiedza-okladki/${slug}?${variant === "illustration" ? "s=illustration&" : ""}v=${new Date(v).getTime()}`;
/** Adres wskazuje grafikę 2D (okładka jasna, tytuł ciemny). */
export const isIllustrationCover = (src?: string | null) => !!src && src.includes("s=illustration");
