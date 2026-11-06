import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DUO® – terapia małżeństw i par",
    short_name: "DUO",
    description: "Mapa Relacji z psychologiem online – indywidualnie lub razem.",
    start_url: "/",
    display: "browser",
    background_color: "#fbf9f5",
    theme_color: "#fbf8f3",
    lang: "pl",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  };
}
