// Panel „Wiedza”: dodatek do promptu grafik 2D – dopisywany do każdego generowania (pojedynczo i hurtowo).
import { saveArtExtraAction } from "@/actions/covers";
import { ActionForm, SubmitButton } from "@/components/form-bits";
import { Card, Textarea } from "@/components/ui";
import { artPromptExtra, DEFAULT_ART_EXTRA } from "@/lib/art-extra";

export async function ArtExtraAdmin() {
  const extra = await artPromptExtra();
  return (
    <Card className="mb-6 p-6" data-testid="art-extra">
      <h2 className="font-display text-xl text-ink">Dodatek do promptu grafik 2D</h2>
      <p className="mt-1 max-w-3xl text-sm text-ink-soft">
        Twoje dodatkowe wskazówki dla generatora – dopisywane do każdej nowej i ponownie generowanej grafiki 2D (ilustracje artykułów i okładki 2D materiałów).
        Zdjęć nie dotyczy. Możesz pisać po polsku.
      </p>
      <ActionForm action={saveArtExtraAction as never} className="mt-4 space-y-3">
        <Textarea name="extra" defaultValue={extra} rows={3} maxLength={600} aria-label="Dodatek do promptu" placeholder={DEFAULT_ART_EXTRA} />
        <SubmitButton size="sm" variant="secondary">Zapisz dodatek</SubmitButton>
      </ActionForm>
    </Card>
  );
}
