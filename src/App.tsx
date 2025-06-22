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
          const updatedLists = [...storedLists, data];
          setLists(updatedLists);
          localStorage.setItem("cardLists", JSON.stringify(updatedLists));

          // Si c'était la première liste, la sélectionner
          if (storedLists.length === 0) {
            setSelectedList(data.title);
            setCards(
              data.cards.map((card) => ({
                ...card,
                isFlipped: showVerso,
                color: card.color || "",
              }))
            );
            setMessage(data.message);
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
            const updatedLists = [...lists, json];
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

  const saveNewList = (newList: {
    title: string;
    message?: string;
    cards: Omit<CardType, "id">[];
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
    return [...array].sort(() => Math.random() - 0.5);
  };

  const toggleShuffle = () => {
    setIsShuffled((prev) => !prev);
  };

  // FONCTION MODIFIÉE : Accepte maintenant une string directement
  const handleRangeChange = (range: string) => {
    setSelectedRange(range);
  };

  // FONCTION MODIFIÉE : Gérer tous les cas de filtrage (SANS NaN)

  // Dans App.tsx - Remplace ta fonction getFilteredCards par celle-ci :

  const getFilteredCards = () => {
    // Cas 1: Afficher toutes les cartes
    if (selectedRange === "all") {
      return cards;
    }

    // Cas 2: Seulement start (format: "25-")
    if (selectedRange.endsWith("-") && !selectedRange.startsWith("-")) {
      const start = parseInt(selectedRange.replace("-", ""));
      return cards.filter((card) => card.id >= start);
    }

    // Cas 3: Seulement end (format: "-50")
    if (selectedRange.startsWith("-") && !selectedRange.endsWith("-")) {
      const end = parseInt(selectedRange.replace("-", ""));
      return cards.filter((card) => card.id <= end);
    }

    // Cas 4: Start et end (format: "25-50")
    if (
      selectedRange.includes("-") &&
      !selectedRange.startsWith("-") &&
      !selectedRange.endsWith("-")
    ) {
      const [startStr, endStr] = selectedRange.split("-");
      const start = parseInt(startStr);
      const end = parseInt(endStr);

      if (!isNaN(start) && !isNaN(end)) {
        return cards.filter((card) => card.id >= start && card.id <= end);
      }
    }

    // En cas d'erreur, afficher toutes les cartes
    return cards;
  };

  useEffect(() => {
    const checkSize = () => setIsMobile(window.innerWidth < 768);
    checkSize();
    window.addEventListener("resize", checkSize);
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
      />

      {/* AJOUT : Spacer pour compenser le header fixe */}
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
          />
        ))}
      </div>
    </>
  );
}

export default App;
