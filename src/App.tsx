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
  const [message, setMessage] = useState<string | undefined>(undefined); // Ajout de l'état message
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("all");
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedLists: CardList[] = JSON.parse(
      localStorage.getItem("cardLists") || "[]"
    );
    setLists(storedLists);
    if (storedLists.length > 0) {
      setSelectedList(storedLists[0].title);
      setCards(
        storedLists[0].cards.map((card) => ({
          ...card,
          isFlipped: showVerso,
          color: card.color || "",
        }))
      );
      setMessage(storedLists[0].message); // Initialiser le message
    }
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
  }, [showVerso, selectedList, lists, isShuffled]); // <- ajout de isShuffled

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
        setMessage(updatedLists[0].message); // Mettre à jour le message lors de la suppression
      } else {
        setSelectedList("");
        setCards([]);
        setMessage(undefined); // Effacer le message s'il n'y a plus de listes
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
      id: maxId + index + 1, // Assigner des IDs uniques
    }));

    const updatedList: CardList = {
      title: newList.title,
      message: newList.message,
      cards: newCardsWithIds,
    };

    // Téléchargement du fichier JSON
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

  const getFilteredCards = () => {
    if (selectedRange === "all") return cards;
    const [start, end] = selectedRange.split("-").map(Number);
    return cards.filter((card) => card.id >= start && card.id <= end);
  };

  useEffect(() => {
    fetch("/table-de-rappel.json")
      .then((res) => res.json())
      .then((data: CardList) => {
        // Vérifie qu'on ne l'a pas déjà ajoutée
        const isAlreadyPresent = lists.some(
          (list) => list.title === data.title
        );
        if (!isAlreadyPresent) {
          const updatedLists = [...lists, data];
          setLists(updatedLists);
          localStorage.setItem("cardLists", JSON.stringify(updatedLists));
        }
      })
      .catch((error) => {
        console.error(
          "Erreur lors du chargement de la table de rappel :",
          error
        );
      });
  }, [lists]);

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
        onRangeChange={(e) => setSelectedRange(e.target.value)}
        isMobile={isMobile}
        isMobileMenuOpen={isMobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
      />

      {message && (
        <div className="message mt-16 flex flex-col text-center gap-2 md:flex-row md:justify-around md:items-center border-2  rounded-lg w-3/4 m-auto p-2">
          {Array.isArray(message) ? (
            message.map((msg, index) => (
              <p
                key={index}
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
            <p>{message}</p> // Si c'est une chaîne de caractères simple
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
