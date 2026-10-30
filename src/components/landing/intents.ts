export type Intent = "rebuild" | "unsure" | "separate";
export const INTENTS: { value: Intent; title: string; sub: string }[] = [
  { value: "rebuild", title: "Chcemy spróbować odbudować relację", sub: "komunikacja, bliskość, zaufanie" },
  { value: "unsure", title: "Nie wiemy, czy zostać razem", sub: "zrozumienie konfliktu, gotowości i możliwości" },
  { value: "separate", title: "Myślimy o rozstaniu z szacunkiem", sub: "decyzja, sposób rozmowy, dzieci, współpraca" },
];
