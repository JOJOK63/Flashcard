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

  // ========== RÉCUPÉRATION DES LISTES ==========
  const fetchLists = async () => {
    try {
      setLoading(true);
      
      // Récupérer les listes de l'utilisateur
      const { data: listsData, error: listsError } = await supabase
        .from("card_lists")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: true });

      if (listsError) throw listsError;

      // Si aucune liste
      if (!listsData || listsData.length === 0) {
        setLists([]);
        setError(null);
        setLoading(false);
        return;
      }

      // Récupérer les IDs des listes
      const listIds = listsData.map(list => list.id);

      // Récupérer les cartes associées
      const { data: cardsData, error: cardsError } = await supabase
        .from("cards")
        .select("*")
        .in("list_id", listIds)
        .order("position", { ascending: true });

      if (cardsError) throw cardsError;

      // Formater les données
      const formattedLists: CardList[] = listsData.map((list) => {
        // ✅ FIX : Parser le message s'il est stocké en JSON
        let parsedMessage = list.message;
        if (typeof list.message === 'string' && list.message.startsWith('[')) {
          try {
            parsedMessage = JSON.parse(list.message);
          } catch (e) {
            parsedMessage = list.message;
          }
        }

        return {
          title: list.title,
          message: parsedMessage || undefined,
          cards: (cardsData || [])
            .filter((card) => card.list_id === list.id)
            .map((card) => ({
              id: card.id,
              recto: card.recto,
              title: card.title,
              img: card.img || "",
              color: card.color || "",
              recurrence: card.recurrence ?? 0,
              isFlipped: false,
            })),
        };
      });

      setLists(formattedLists);
      setError(null);
    } catch (err) {
      console.error("Error fetching lists:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // ========== AJOUT D'UNE LISTE ==========
  const addList = async (newList: CardList) => {
    try {
      // Vérifier si la liste existe déjà
      const { data: existingList } = await supabase
        .from("card_lists")
        .select("id")
        .eq("title", newList.title)
        .eq("user_id", userId!)
        .maybeSingle();

      if (existingList) {
        console.log("Liste déjà existante:", newList.title);
        return;
      }

      // ✅ FIX : Convertir le message en JSON si c'est un tableau
      let messageToSave;
      if (Array.isArray(newList.message)) {
        messageToSave = JSON.stringify(newList.message);
      } else {
        messageToSave = newList.message || null;
      }

      // Insérer la liste
      const { data: listData, error: listError } = await supabase
        .from("card_lists")
        .insert({
          title: newList.title,
          message: messageToSave,
          user_id: userId!,
        })
        .select()
        .single();

      if (listError) throw listError;

      // Insérer les cartes
      if (newList.cards && newList.cards.length > 0) {
        const cardsToInsert = newList.cards.map((card, index) => ({
          list_id: listData.id,
          recto: card.recto,
          title: card.title,
          img: card.img || "",
          color: card.color || "",
          recurrence: card.recurrence ?? 0,
          position: index,
        }));

        const { error: cardsError } = await supabase
          .from("cards")
          .insert(cardsToInsert);

        if (cardsError) {
          console.error("❌ Erreur insertion cartes:", cardsError);
          throw cardsError;
        }
      }

      await fetchLists();
    } catch (err) {
      console.error("Error adding list:", err);
      throw err;
    }
  };

  // ========== SUPPRESSION D'UNE LISTE ==========
  const deleteList = async (listTitle: string) => {
    try {
      const { error } = await supabase
        .from("card_lists")
        .delete()
        .eq("title", listTitle)
        .eq("user_id", userId!);

      if (error) throw error;
      await fetchLists();
    } catch (err) {
      console.error("Error deleting list:", err);
      throw err;
    }
  };

  // ========== MISE À JOUR RÉCURRENCE ==========
  const updateCardRecurrence = async (cardId: number, recurrence: number) => {
    try {
      const { error } = await supabase
        .from("cards")
        .update({ recurrence, updated_at: new Date().toISOString() })
        .eq("id", cardId);

      if (error) throw error;

      // ✅ FIX : Mise à jour locale SANS refetch pour éviter le reset
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