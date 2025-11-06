import React, { useState, useEffect } from "react";
import "./App.css";
import Card from "./components/card/Card";
import Header from "./components/header/Header";
import Modal from "./components/modal/Modal";
import { Auth } from "./components/Auth";
import { CardType, CardList } from "./types";
import { supabase } from "./lib/supabase";
import { useCardLists } from "./hooks/useCardLists";
import { Session } from "@supabase/supabase-js";

function App() {
  // ========== ÉTATS D'AUTHENTIFICATION ==========
  const [session, setSession] = useState<Session | null>(null);

  // ========== ÉTATS EXISTANTS ==========
  const [showVerso, setShowVerso] = useState<boolean>(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [message, setMessage] = useState<
    string | { text: string; color?: string }[] | undefined
  >(undefined);
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedRecurrence, setSelectedRecurrence] = useState<number>(7);

  // ========== HOOK SUPABASE POUR LES LISTES ==========
  const {
    lists,
    loading,
    error,
    addList,
    deleteList: deleteListDB,
    updateCardRecurrence: updateCardRecurrenceDB,
    refetch,
  } = useCardLists(session?.user?.id);

  // ========== GESTION DE L'AUTHENTIFICATION ==========
  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ========== CHARGER LA TABLE DE RAPPEL PAR DÉFAUT ==========
  useEffect(() => {
    if (!session) return;

    // Charger la table de rappel par défaut uniquement si aucune liste n'existe
    if (lists.length === 0 && !loading) {
      fetch("/table-de-rappel.json")
        .then((res) => res.json())
        .then((data: CardList) => {
          const dataWithRecurrence = {
            ...data,
            cards: data.cards.map((card, index) => ({
              ...card,
              id: index + 1,
              recurrence: card.recurrence ?? 0,
            })),
          };

          addList(dataWithRecurrence).catch(console.error);
        })
        .catch((error) => {
          console.error(
            "Erreur lors du chargement de la table de rappel :",
            error
          );
        });
    }
  }, [session, lists.length, loading]);

  // ========== SÉLECTIONNER LA PREMIÈRE LISTE AU CHARGEMENT ==========
  useEffect(() => {
    if (lists.length > 0 && !selectedList) {
      setSelectedList(lists[0].title);
    }
  }, [lists]);

  // ========== CHARGER LES CARTES QUAND LA LISTE CHANGE ==========
  useEffect(() => {
    if (selectedList && lists.length > 0) {
      const selectedListObject = lists.find(
        (list) => list.title === selectedList
      );
      let selectedCards = selectedListObject?.cards || [];

      if (isShuffled) {
        selectedCards = shuffleArray(selectedCards);
      }

      setCards(
        selectedCards.map((card) => ({
          ...card,
          isFlipped: showVerso,
          color: card.color || "",
          recurrence: card.recurrence ?? 0,
        }))
      );
      setMessage(selectedListObject?.message);
    }
  }, [showVerso, selectedList, lists, isShuffled]);

  // ========== FONCTIONS DE MANIPULATION DES CARTES ==========
  const resetCards = () => {
    setCards(cards.map((card) => ({ ...card, isFlipped: showVerso })));
  };

  const flipCard = (id: number) => {
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  // ========== MISE À JOUR DE LA RÉCURRENCE (AVEC SUPABASE) ==========
  const updateCardRecurrence = async (
    cardId: number,
    newRecurrence: number
  ) => {
    // Mise à jour optimiste locale (immédiate dans l'UI)
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, recurrence: newRecurrence } : card
      )
    );

    // Mise à jour en base de données
    try {
      await updateCardRecurrenceDB(cardId, newRecurrence);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la récurrence:", error);
      // Rollback en cas d'erreur
      await refetch();
    }
  };

  // ========== FILTRAGE PAR RÉCURRENCE ==========
  const filterCardsByRecurrence = (
    cards: CardType[],
    selectedRecurrence: number
  ) => {
    if (selectedRecurrence === 7) {
      return cards;
    }
    return cards.filter((card) => {
      const cardRecurrence = card.recurrence ?? 0;
      return cardRecurrence <= selectedRecurrence;
    });
  };

  // ========== GESTION DU CHANGEMENT DE RÉCURRENCE ==========
  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRecurrence = parseInt(e.target.value);
    setSelectedRecurrence(newRecurrence);
  };

  const handleShowVersoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowVerso(e.target.checked);
  };

  // ========== IMPORT DE FICHIER JSON ==========
  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const json: CardList = JSON.parse(e.target?.result as string);
          if (json.title && json.cards) {
            const jsonWithRecurrence = {
              ...json,
              cards: json.cards.map((card, index) => ({
                ...card,
                id: index + 1,
                recurrence: card.recurrence ?? 0,
              })),
            };

            await addList(jsonWithRecurrence);
            alert("Liste importée avec succès !");
          } else {
            alert("Fichier JSON invalide.");
          }
        } catch (error) {
          alert("Erreur lors de la lecture du fichier JSON.");
          console.error(error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedList(e.target.value);
  };

  // ========== SUPPRESSION DE LISTE (AVEC SUPABASE) ==========
  const deleteList = async () => {
    if (selectedList) {
      try {
        await deleteListDB(selectedList);

        // Sélectionner une autre liste ou réinitialiser
        const remainingLists = lists.filter(
          (list) => list.title !== selectedList
        );
        if (remainingLists.length > 0) {
          setSelectedList(remainingLists[0].title);
        } else {
          setSelectedList("");
          setCards([]);
          setMessage(undefined);
        }
      } catch (error) {
        alert("Erreur lors de la suppression de la liste");
        console.error(error);
      }
    }
  };

  const downloadJson = (json: object, filename: string) => {
    const jsonStr = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ========== SAUVEGARDE NOUVELLE LISTE (AVEC SUPABASE) ==========
  const saveNewList = async (newList: {
    title: string;
    message?: string | { text: string; color?: string }[];
    cards: Array<{
      recto: string;
      title: string;
      img: string;
      color: string;
      recurrence: number;
    }>;
  }) => {
    try {
      // Ajouter des IDs temporaires pour l'affichage local
      const listWithIds = {
        ...newList,
        cards: newList.cards.map((card, index) => ({
          ...card,
          id: Date.now() + index, // ID temporaire
        })),
      };

      // Sauvegarder en base de données
      await addList(listWithIds as CardList);

      // Télécharger aussi le JSON localement
      downloadJson(listWithIds, listWithIds.title);

      alert("Liste créée avec succès !");
    } catch (error) {
      alert("Erreur lors de la création de la liste");
      console.error(error);
    }
  };

  const shuffleArray = (array: CardType[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };

  // ========== FILTRAGE DES CARTES (RÉCURRENCE + PLAGE) ==========
  const getFilteredCards = () => {
    let filteredCards = cards;

    // Filtre 1: Par récurrence
    filteredCards = filterCardsByRecurrence(filteredCards, selectedRecurrence);

    // Filtre 2: Par plage
    if (selectedRange === "all") {
      return filteredCards;
    }

    if (selectedRange.endsWith("-") && !selectedRange.startsWith("-")) {
      const start = parseInt(selectedRange.replace("-", ""));
      return filteredCards.filter((card) => card.id >= start);
    }

    if (selectedRange.startsWith("-") && !selectedRange.endsWith("-")) {
      const end = parseInt(selectedRange.replace("-", ""));
      return filteredCards.filter((card) => card.id <= end);
    }

    if (
      selectedRange.includes("-") &&
      !selectedRange.startsWith("-") &&
      !selectedRange.endsWith("-")
    ) {
      const [startStr, endStr] = selectedRange.split("-");
      const start = parseInt(startStr);
      const end = parseInt(endStr);

      if (!isNaN(start) && !isNaN(end)) {
        return filteredCards.filter(
          (card) => card.id >= start && card.id <= end
        );
      }
    }

    return filteredCards;
  };

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // ========== AFFICHAGE CONDITIONNEL ==========

  // Si pas de session, afficher l'écran de connexion
  if (!session) {
    return <Auth />;
  }

  // Si chargement en cours, afficher un loader
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">
            Chargement de vos flashcards...
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-card-background mx-auto"></div>
        </div>
      </div>
    );
  }

  // Si erreur, l'afficher
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center text-red-600">
          <div className="text-2xl font-bold mb-4">Erreur</div>
          <p>{error}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // ========== AFFICHAGE PRINCIPAL ==========
  return (
    <>
      <Header
        resetCards={resetCards}
        onShowVersoChange={handleShowVersoChange}
        showVerso={showVerso}
        onFileImport={handleFileImport}
        lists={lists}
        selectedList={selectedList}
        onListChange={handleListChange}
        onDeleteList={deleteList}
        onAddNewList={() => setShowModal(true)}
        isShuffled={isShuffled}
        toggleShuffle={toggleShuffle}
        selectedRange={selectedRange}
        onRangeChange={handleRangeChange}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        selectedRecurrence={selectedRecurrence}
        onSelectedRecurrenceChange={handleRecurrenceChange}
      />

      <div className={`${isMobile ? "h-20" : "h-24"}`}></div>

      {message && (
        <div className="message flex flex-col gap-2 md:items-stretch md:flex-row md:justify-around border-2 rounded-lg w-3/4 m-auto p-2 text-center">
          {Array.isArray(message) ? (
            message.map((msg, index) => (
              <p
                key={index}
                className="w-full flex items-center justify-center"
                style={{
                  background: msg.color,
                  opacity: 0.8,
                  padding: 4,
                  borderRadius: 8,
                  color: "black",
                }}
              >
                {msg.text}
              </p>
            ))
          ) : (
            <p>{message}</p>
          )}
        </div>
      )}

      {showModal && (
        <Modal onClose={() => setShowModal(false)} onSave={saveNewList} />
      )}

      <div className="px-4 py-8 flex flex-wrap gap-5 justify-center items-center my-16 lg:px-40 lg:my-10">
        {getFilteredCards().map((card) => (
          <Card
            key={card.id}
            id={card.id}
            recto={card.recto}
            title={card.title}
            img={card.img}
            isFlipped={card.isFlipped || false}
            flipCard={() => flipCard(card.id)}
            color={card.color}
            recurrence={card.recurrence ?? 0}
            onRecurrenceChange={(newRecurrence) =>
              updateCardRecurrence(card.id, newRecurrence)
            }
          />
        ))}
      </div>

      {/* Bouton de déconnexion */}
      <button
        onClick={() => supabase.auth.signOut()}
        className="fixed bottom-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"
      >
        Déconnexion
      </button>
    </>
  );
}

export default App;
