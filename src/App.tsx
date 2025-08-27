import React, { useState, useEffect } from "react";
import "./App.css";
import Card from "./components/card/Card";
import Header from "./components/header/Header";
import Modal from "./components/modal/Modal";
import { CardType, CardList } from "./types";

function App() {
  const [showVerso, setShowVerso] = useState<boolean>(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [lists, setLists] = useState<CardList[]>([]);
  const [selectedList, setSelectedList] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🆕 NOUVEAU : État pour la récurrence sélectionnée
  const [selectedRecurrence, setSelectedRecurrence] = useState<number>(7); // 7 = toutes les cartes

  useEffect(() => {
    const storedLists: CardList[] = JSON.parse(
      localStorage.getItem("cardLists") || "[]"
    );
    setLists(storedLists);

    // Charger la table de rappel par défaut si elle n'existe pas
    fetch("/table-de-rappel.json")
      .then((res) => res.json())
      .then((data: CardList) => {
        const isAlreadyPresent = storedLists.some(
          (list) => list.title === data.title
        );

        if (!isAlreadyPresent) {
          // 🆕 MODIFICATION : S'assurer que chaque carte a une récurrence par défaut
          const dataWithRecurrence = {
            ...data,
            cards: data.cards.map((card) => ({
              ...card,
              recurrence: card.recurrence ?? 0, // Par défaut 0 si pas défini
            })),
          };

          const updatedLists = [...storedLists, dataWithRecurrence];
          setLists(updatedLists);
          localStorage.setItem("cardLists", JSON.stringify(updatedLists));

          // Si c'était la première liste, la sélectionner
          if (storedLists.length === 0) {
            setSelectedList(dataWithRecurrence.title);
            setCards(
              dataWithRecurrence.cards.map((card) => ({
                ...card,
                isFlipped: showVerso,
                color: card.color || "",
                recurrence: card.recurrence ?? 0, // 🆕 AJOUT
              }))
            );
            setMessage(dataWithRecurrence.message);
          }
        } else {
          // Si les listes existent déjà, sélectionner la première
          if (storedLists.length > 0) {
            setSelectedList(storedLists[0].title);
            setCards(
              storedLists[0].cards.map((card) => ({
                ...card,
                isFlipped: showVerso,
                color: card.color || "",
                recurrence: card.recurrence ?? 0, // 🆕 AJOUT
              }))
            );
            setMessage(storedLists[0].message);
          }
        }
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement de la table de rappel :",
          error
        );

        // En cas d'erreur, utiliser les listes existantes
        if (storedLists.length > 0) {
          setSelectedList(storedLists[0].title);
          setCards(
            storedLists[0].cards.map((card) => ({
              ...card,
              isFlipped: showVerso,
              color: card.color || "",
              recurrence: card.recurrence ?? 0, // 🆕 AJOUT
            }))
          );
          setMessage(storedLists[0].message);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedList) {
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
          recurrence: card.recurrence ?? 0, // 🆕 AJOUT
        }))
      );
      setMessage(selectedListObject?.message);
    }
  }, [showVerso, selectedList, lists, isShuffled, selectedRange]);

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

  // 🆕 NOUVELLE FONCTION : Mettre à jour la récurrence d'une carte
  const updateCardRecurrence = (cardId: number, newRecurrence: number) => {
    // Mettre à jour l'état local des cartes
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === cardId ? { ...card, recurrence: newRecurrence } : card
      )
    );

    // Mettre à jour dans les listes permanentes
    const currentList = lists.find((list) => list.title === selectedList);
    if (!currentList) return;

    const updatedCards = currentList.cards.map((card) =>
      card.id === cardId ? { ...card, recurrence: newRecurrence } : card
    );

    const updatedLists = lists.map((list) =>
      list.title === selectedList ? { ...list, cards: updatedCards } : list
    );

    setLists(updatedLists);
    localStorage.setItem("cardLists", JSON.stringify(updatedLists));
  };

  // 🆕 FONCTION MODIFIÉE : Filtrer les cartes par récurrence
  const filterCardsByRecurrence = (
    cards: CardType[],
    selectedRecurrence: number
  ) => {
    // Si 7 est sélectionné, afficher toutes les cartes
    if (selectedRecurrence === 7) {
      return cards;
    }

    // ✅ NOUVEAU CODE : Afficher les cartes de la catégorie ET toutes celles en dessous
    return cards.filter((card) => {
      const cardRecurrence = card.recurrence ?? 0;
      return cardRecurrence <= selectedRecurrence;
    });
  };

  // 🆕 ALTERNATIVE si vous voulez SEULEMENT la catégorie exacte :
  // const filterCardsByRecurrence = (
  //   cards: CardType[],
  //   selectedRecurrence: number
  // ) => {
  //   // Si 7 est sélectionné, afficher toutes les cartes
  //   if (selectedRecurrence === 7) {
  //     return cards;
  //   }
  //
  //   // Afficher SEULEMENT les cartes de la catégorie exacte
  //   return cards.filter((card) => (card.recurrence ?? 0) === selectedRecurrence);
  // };

  // 🆕 NOUVELLE FONCTION : Gérer le changement de récurrence dans le header
  const handleRecurrenceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRecurrence = parseInt(e.target.value);
    setSelectedRecurrence(newRecurrence);
  };

  const handleShowVersoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowVerso(e.target.checked);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json: CardList = JSON.parse(e.target?.result as string);
          if (json.title && json.cards) {
            // 🆕 MODIFICATION : S'assurer que chaque carte importée a une récurrence
            const jsonWithRecurrence = {
              ...json,
              cards: json.cards.map((card) => ({
                ...card,
                recurrence: card.recurrence ?? 0,
              })),
            };

            const updatedLists = [...lists, jsonWithRecurrence];
            setLists(updatedLists);
            localStorage.setItem("cardLists", JSON.stringify(updatedLists));
          } else {
            alert("Fichier JSON invalide.");
          }
        } catch (error) {
          alert("Erreur lors de la lecture du fichier JSON.");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleListChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedList(e.target.value);
  };

  const deleteList = () => {
    if (selectedList) {
      const updatedLists = lists.filter((list) => list.title !== selectedList);
      setLists(updatedLists);
      localStorage.setItem("cardLists", JSON.stringify(updatedLists));
      if (updatedLists.length > 0) {
        setSelectedList(updatedLists[0].title);
        setCards(
          updatedLists[0].cards.map((card) => ({
            ...card,
            isFlipped: showVerso,
            recurrence: card.recurrence ?? 0, // 🆕 AJOUT
          }))
        );
        setMessage(updatedLists[0].message);
      } else {
        setSelectedList("");
        setCards([]);
        setMessage(undefined);
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

  // 🆕 MODIFICATION : Le type des cartes dans saveNewList inclut maintenant recurrence
  const saveNewList = (newList: {
    title: string;
    message?: string;
    cards: Array<{
      recto: string;
      title: string;
      img: string;
      color: string;
      recurrence: number; // 🆕 AJOUT
    }>;
  }) => {
    const maxId = lists.reduce((max, list) => {
      const listMaxId = list.cards.reduce(
        (innerMax, card) => Math.max(innerMax, card.id),
        0
      );
      return Math.max(max, listMaxId);
    }, 0);

    const newCardsWithIds = newList.cards.map((card, index) => ({
      ...card,
      id: maxId + index + 1,
    }));

    const updatedList: CardList = {
      title: newList.title,
      message: newList.message,
      cards: newCardsWithIds,
    };

    downloadJson(updatedList, updatedList.title);

    const updatedLists = [...lists, updatedList];
    setLists(updatedLists);
    localStorage.setItem("cardLists", JSON.stringify(updatedLists));
  };

  const shuffleArray = (array: CardType[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // swap
    }
    return newArray;
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };

  // 🆕 MODIFICATION : getFilteredCards applique maintenant DEUX filtres
  const getFilteredCards = () => {
    let filteredCards = cards;

    // ÉTAPE 1: Filtrer par récurrence
    filteredCards = filterCardsByRecurrence(filteredCards, selectedRecurrence);

    // ÉTAPE 2: Filtrer par plage (code existant)
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
        selectedRecurrence={selectedRecurrence} // 🆕 AJOUT
        onSelectedRecurrenceChange={handleRecurrenceChange} // 🆕 AJOUT
      />

      <div className={`${isMobile ? "h-20" : "h-24"}`}></div>

      {message && (
        <div className="message flex flex-col gap-2 md:items-stretch md:flex-row md:justify-around border-2  rounded-lg w-3/4 m-auto p-2 text-center">
          {Array.isArray(message) ? (
            message.map((msg, index) => (
              <p
                key={index}
                className="w-full flex items-center justify-center "
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
            recurrence={card.recurrence ?? 0} // 🆕 AJOUT
            onRecurrenceChange={(newRecurrence) =>
              updateCardRecurrence(card.id, newRecurrence)
            } // 🆕 AJOUT
          />
        ))}
      </div>
    </>
  );
}

export default App;
