/** <script type="application/ld+json"> – bezpieczne osadzenie danych strukturalnych (bez „</script>” w treści). */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
