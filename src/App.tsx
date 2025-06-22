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
    console.log(`🎯 Filtrage avec selectedRange: "${selectedRange}"`);

    if (selectedRange === "all") {
      console.log(`📋 Affichage de toutes les cartes (${cards.length})`);
      return cards;
    }

    // CAS SPÉCIAL : "25-infinity" = carte 25 et supérieur
    if (selectedRange.endsWith("-infinity")) {
      const start = parseInt(selectedRange.replace("-infinity", ""));
      console.log(`📈 Filtrage: cartes >= ${start}`);

      if (isNaN(start)) {
        console.error(
          "❌ Start invalide pour -infinity, affichage de toutes les cartes"
        );
        return cards;
      }

      const filtered = cards.filter((card) => card.id >= start);
      console.log(`✅ ${filtered.length} cartes trouvées (>= ${start})`);
      return filtered;
    }

    // CAS PLAGE NORMALE : "0-50", "25-75", etc.
    if (selectedRange.includes("-")) {
      const [startStr, endStr] = selectedRange.split("-");

      // ✅ NOUVEAU : Gérer les cas où start ou end peuvent être vides
      const start = startStr ? parseInt(startStr) : null;
      const end = endStr ? parseInt(endStr) : null;

      console.log(`📊 Parsing: "${startStr}" → ${start}, "${endStr}" → ${end}`);

      // ✅ NOUVEAU : Cas où seulement start est défini (ex: "25-")
      if (start !== null && end === null) {
        console.log(`📈 Filtrage: cartes >= ${start} (end non défini)`);
        const filtered = cards.filter((card) => card.id >= start);
        console.log(`✅ ${filtered.length} cartes trouvées (>= ${start})`);
        return filtered;
      }

      // ✅ NOUVEAU : Cas où seulement end est défini (ex: "-50")
      if (start === null && end !== null) {
        console.log(`📉 Filtrage: cartes <= ${end} (start non défini)`);
        const filtered = cards.filter((card) => card.id <= end);
        console.log(`✅ ${filtered.length} cartes trouvées (<= ${end})`);
        return filtered;
      }

      // ✅ AMÉLIORER : Cas où les deux sont définis
      if (start !== null && end !== null) {
        const minValue = Math.min(start, end);
        const maxValue = Math.max(start, end);

        console.log(`📊 Filtrage: cartes entre ${minValue} et ${maxValue}`);

        const filtered = cards.filter(
          (card) => card.id >= minValue && card.id <= maxValue
        );
        console.log(
          `✅ ${filtered.length} cartes trouvées (${minValue}-${maxValue})`
        );
        return filtered;
      }

      // ✅ NOUVEAU : Si on arrive ici, c'est qu'il y a eu un problème de parsing
      console.error(`❌ Impossible de parser la plage: "${selectedRange}"`);
      return cards;
    }

    console.log(`📋 Cas par défaut: affichage de toutes les cartes`);
    return cards;
  };

  useEffect(() => {
    fetch("/table-de-rappel.json")
      .then((res) => res.json())
      .then((data: CardList) => {
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
