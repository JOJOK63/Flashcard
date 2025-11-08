import React, { useState } from "react";
import rerollSvg from "/refresh-line(1).svg";
import addSvg from "/add-circle-line(1).svg";
import deleteSvg from "/close-circle-line(1).svg";
import { CardList } from "../../types";

interface HeaderProps {
  resetCards: () => void;
  onShowVersoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showVerso: boolean;
  onFileImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  lists: CardList[];
  selectedList: string;
  onListChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDeleteList: () => void;
  onAddNewList: () => void;
  isShuffled: boolean;
  toggleShuffle: () => void;
  selectedRange: string;
  onRangeChange: (range: string) => void;
  isMobile: boolean;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  selectedRecurrence: number;
  onSelectedRecurrenceChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Header: React.FC<HeaderProps> = ({
  resetCards,
  onShowVersoChange,
  showVerso,
  onFileImport,
  lists,
  selectedList,
  onListChange,
  onDeleteList,
  onAddNewList,
  isShuffled,
  toggleShuffle,
  onRangeChange,
  isMobile,
  isMobileMenuOpen,
  toggleMobileMenu,
  selectedRecurrence,
  onSelectedRecurrenceChange,
}) => {
  const [startRange, setStartRange] = useState<string>("");
  const [endRange, setEndRange] = useState<string>("");

  // Options de récurrence avec leurs labels
  const recurrenceOptions = [
    { value: 1, label: "≤ Quotidien" },
    { value: 2, label: "≤ 2 jours" },
    { value: 3, label: "≤ Hebdomadaire" },
    { value: 4, label: "≤ Mensuel" },
    { value: 5, label: "≤ Trimestriel" },
    { value: 6, label: "≤ Semestriel" },
    { value: 7, label: "Toutes" },
  ];

  // Fonction pour valider et mettre à jour la plage
  const updateRange = (start: string, end: string) => {
    // Cas 1: Rien saisi → Afficher toutes les cartes
    if (!start && !end) {
      onRangeChange("all");
      return;
    }

    // Cas 2: Seulement start saisi → Afficher cartes >= start
    if (start && !end) {
      const startNum = parseInt(start);
      if (!isNaN(startNum)) {
        onRangeChange(`${startNum}-`);
      } else {
        onRangeChange("all"); // Erreur → afficher tout
      }
      return;
    }

    // Cas 3: Seulement end saisi → Afficher cartes <= end
    if (!start && end) {
      const endNum = parseInt(end);
      if (!isNaN(endNum)) {
        onRangeChange(`-${endNum}`);
      } else {
        onRangeChange("all"); // Erreur → afficher tout
      }
      return;
    }

    // Cas 4: Les deux saisis → Afficher cartes entre start et end
    if (start && end) {
      const startNum = parseInt(start);
      const endNum = parseInt(end);

      if (!isNaN(startNum) && !isNaN(endNum)) {
        // Assurer que start <= end
        const min = Math.min(startNum, endNum);
        const max = Math.max(startNum, endNum);
        onRangeChange(`${min}-${max}`);
      } else {
        onRangeChange("all"); // Erreur → afficher tout
      }
    }
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Garde seulement les chiffres
    setStartRange(value);
    updateRange(value, endRange);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Garde seulement les chiffres
    setEndRange(value);
    updateRange(startRange, value);
  };

  const resetRange = () => {
    setStartRange("");
    setEndRange("");
    onRangeChange("all");
  };

  return (
    <>
      {/* Burger mobile */}
      {isMobile && (
        <div className="fixed w-full flex justify-between p-4 bg-white z-10">
          <h1>Flashcard</h1>
          <button onClick={toggleMobileMenu}>☰</button>
        </div>
      )}

      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} ${
          isMobile
            ? "fixed inset-0 z-20 bg-white flex flex-col justify-around items-center"
            : "header fixed z-20 bg-white w-full md:h-10vh md:p-5 md:border-2 md:rounded-md md:border-card-background md:flex md:justify-around md:items-center md:text-sm"
        }`}
      >
        <div className="flex justify-center items-center">
          <button className="w-10 h-10 relative group" onClick={onAddNewList}>
            <img
              src={addSvg}
              alt="icone add"
              className="fill-current text-card-background"
            />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Ajouter une liste
            </span>
          </button>
        </div>

        <div className="flex justify-center items-center uppercase">
          <select
            name="list-choice"
            id="list-choice"
            className="uppercase ml-2 p-2 bg-background border-2 border-textColor rounded-lg"
            value={selectedList}
            onChange={(e) => {
              onListChange(e);
              resetRange();
            }}
          >
            {lists.map((list, index) => (
              <option key={index} value={list.title}>
                {list.title}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              className="w-10 h-10 ml-2 relative group"
              onClick={onDeleteList}
            >
              <img src={deleteSvg} alt="Supprimer la liste" />
              <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Supprimer liste
              </span>
            </button>
          </div>
        </div>

        {/* Section Récurrence */}
        <div className="flex justify-center items-center uppercase">
          <label className="mr-2">Récurrence :</label>
          <select
            name="recurrence-choice"
            id="recurrence-choice"
            className="p-2 bg-background border-2 border-textColor rounded-lg text-xs"
            value={selectedRecurrence}
            onChange={onSelectedRecurrenceChange}
          >
            {recurrenceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex uppercase justify-center items-center">
          Recto / Verso :
          <label className="switch ml-2">
            <input
              type="checkbox"
              checked={showVerso}
              onChange={onShowVersoChange}
            />
            <span className="slider round bg-card-background"></span>
          </label>
        </div>

        <div className="flex justify-center items-center">
          <label className="mr-2 uppercase">Mélanger :</label>
          <label className="switch">
            <input
              type="checkbox"
              checked={isShuffled}
              onChange={toggleShuffle}
            />
            <span className="slider round bg-card-background"></span>
          </label>
        </div>

        {/* Section plage simplifiée */}
        <div className="flex items-center gap-2">
          <label className="uppercase text-sm">Plage :</label>
          <input
            type="text"
            placeholder="De"
            value={startRange}
            onChange={handleStartChange}
            className="w-16 p-1 text-center border-2 border-textColor rounded-lg bg-background"
            inputMode="numeric"
          />
          <span>-</span>
          <input
            type="text"
            placeholder="À"
            value={endRange}
            onChange={handleEndChange}
            className="w-16 p-1 text-center border-2 border-textColor rounded-lg bg-background"
            inputMode="numeric"
          />
          <button
            onClick={resetRange}
            className="text-xs px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
            title="Toutes les cartes"
          >
            Toutes
          </button>
        </div>

        <div className="p-2 border-2 rounded-lg border-textColor">
          <label htmlFor="json-upload" className="cursor-pointer">
            Importer un JSON
          </label>
          <input
            type="file"
            id="json-upload"
            className="hidden"
            accept=".json"
            onChange={onFileImport}
          />
        </div>

        <div>
          <button className="w-10 h-10 relative group" onClick={resetCards}>
            <img src={rerollSvg} alt="icone reset" />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Rafraîchir liste
            </span>
          </button>
        </div>

        <div>
          {isMobile && isMobileMenuOpen && (
            <button onClick={toggleMobileMenu} className="text-3xl font-bold">
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Header;
