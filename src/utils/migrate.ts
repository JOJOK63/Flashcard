// src/utils/migrate.ts
import { supabase } from "../lib/supabase";
import { CardList } from "../types";

export const migrateLocalStorageToSupabase = async (userId: string) => {
  const storedLists: CardList[] = JSON.parse(
    localStorage.getItem("cardLists") || "[]"
  );

  for (const list of storedLists) {
    try {
      // Insérer la liste
      const { data: listData, error: listError } = await supabase
        .from("card_lists")
        .insert({
          title: list.title,
          message: typeof list.message === "string" ? list.message : undefined,
          user_id: userId,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Insérer les cartes
      const cardsToInsert = list.cards.map((card, index) => ({
        list_id: listData.id,
        recto: card.recto,
        title: card.title,
        img: card.img,
        color: card.color,
        recurrence: card.recurrence || 0,
        position: index,
      }));

      const { error: cardsError } = await supabase
        .from("cards")
        .insert(cardsToInsert);

      if (cardsError) throw cardsError;

      console.log(`✅ Liste "${list.title}" migrée avec succès`);
    } catch (error) {
      console.error(`❌ Erreur pour la liste "${list.title}":`, error);
    }
  }

  console.log("✅ Migration terminée!");
  // Optionnel: Nettoyer localStorage après migration réussie
  // localStorage.removeItem("cardLists")
};
