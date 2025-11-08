import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { CardList } from "../types";

export const useCardLists = (userId: string | undefined) => {
  const [lists, setLists] = useState<CardList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLists([]);
      setLoading(false);
      return;
    }
    fetchLists();
  }, [userId]);

  const fetchLists = async () => {
    try {
      setLoading(true);
      
      // 🔧 CORRECTION : Filtrer par user_id dès la requête
      const { data: listsData, error: listsError } = await supabase
        .from("card_lists")
        .select("*")
        .eq("user_id", userId!) // ✅ Ajout du filtre user
        .order("created_at", { ascending: true });

      if (listsError) throw listsError;

      // Si aucune liste, retourner un tableau vide
      if (!listsData || listsData.length === 0) {
        setLists([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Récupérer les IDs des listes
      const listIds = listsData.map(list => list.id);

      // 🔧 CORRECTION : Récupérer seulement les cartes des listes de l'utilisateur
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .in("list_id", listIds) // ✅ Filtrer par liste
        .order("position", { ascending: true });

      if (cardsError) throw cardsError;

      // 🔧 CORRECTION : Formater correctement les données
      const formattedLists: CardList[] = listsData.map((list) => ({
        title: list.title,
        message: list.message || undefined,
        cards: (cardsData || [])
          .filter((card) => card.list_id === list.id)
          .map((card) => ({
            id: card.id,
            recto: card.recto,
            title: card.title,
            img: card.img || "",
            color: card.color || "",
            recurrence: card.recurrence ?? 0, // ✅ Valeur par défaut
            isFlipped: false,
          })),
      }));

      setLists(formattedLists);
      setError(null);
    } catch (err) {
      console.error("Error fetching lists:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const addList = async (newList: CardList) => {
    try {
      // 🔧 CORRECTION : Vérifier si la liste existe déjà
      const { data: existingList } = await supabase
        .from("card_lists")
        .select("id")
        .eq("title", newList.title)
        .eq("user_id", userId!)
        .maybeSingle();

      if (existingList) {
        console.log("Liste déjà existante:", newList.title);
        return; // ✅ Ne pas créer de doublon
      }

      // Insérer la liste
      const { data: listData, error: listError } = await supabase
        .from("card_lists")
        .insert({
          title: newList.title,
          message: typeof newList.message === "string" ? newList.message : undefined,
          user_id: userId!,
        })
        .select()
        .single();

      if (listError) throw listError;

      // 🔧 CORRECTION : Vérifier qu'il y a des cartes à insérer
      if (newList.cards && newList.cards.length > 0) {
        const cardsToInsert = newList.cards.map((card, index) => ({
          list_id: listData.id,
          recto: card.recto,
          title: card.title,
          img: card.img || "",
          color: card.color || "",
          recurrence: card.recurrence ?? 0, // ✅ Valeur par défaut
          position: index,
        }));

        const { error: cardsError } = await supabase
          .from("cards")
          .insert(cardsToInsert);

        if (cardsError) throw cardsError;
      }

      await fetchLists();
    } catch (err) {
      console.error("Error adding list:", err);
      throw err;
    }
  };

  const deleteList = async (listTitle: string) => {
    try {
      // 🔧 CORRECTION : Supprimer par user_id ET title
      const { error } = await supabase
        .from("card_lists")
        .delete()
        .eq("title", listTitle)
        .eq("user_id", userId!); // ✅ Sécurité supplémentaire

      if (error) throw error;
      await fetchLists();
    } catch (err) {
      console.error("Error deleting list:", err);
      throw err;
    }
  };

  const updateCardRecurrence = async (cardId: number, recurrence: number) => {
    try {
      const { error } = await supabase
        .from("cards")
        .update({ recurrence, updated_at: new Date().toISOString() })
        .eq("id", cardId);

      if (error) throw error;

      // Mise à jour locale optimiste
      setLists((prevLists) =>
        prevLists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, recurrence } : card
          ),
        }))
      );
    } catch (err) {
      console.error("Error updating card recurrence:", err);
      throw err;
    }
  };

  return {
    lists,
    loading,
    error,
    addList,
    deleteList,
    updateCardRecurrence,
    refetch: fetchLists,
  };
};