import React, { useState, useEffect } from "react";
import rerollSvg from "../../../public/refresh-line(1).svg";
import addSvg from "../../../public/add-circle-line(1).svg";
import deleteSvg from "../../../public/close-circle-line(1).svg";
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
  selectedRange,
  onRangeChange,
  isMobile,
  isMobileMenuOpen,
  toggleMobileMenu,
}) => {
  // États locaux pour les inputs de plage
  const [startRange, setStartRange] = useState<string>("");
  const [endRange, setEndRange] = useState<string>("");

  // Initialiser les valeurs depuis selectedRange
  useEffect(() => {
    if (selectedRange === "all") {
      setStartRange("");
      setEndRange("");
    } else if (selectedRange.includes("-")) {
      const [start, end] = selectedRange.split("-");
      setStartRange(start);
      setEndRange(end === "infinity" ? "" : end);
    }
  }, [selectedRange]);

  // FONCTION : Valider que l'input ne contient que des chiffres entiers
  const validateNumericInput = (value: string): string => {
    // Supprime tout ce qui n'est pas un chiffre
    return value.replace(/[^0-9]/g, "");
  };

  // FONCTION PRINCIPALE : Gérer les changements de plage
  const handleRangeUpdate = (start: string, end: string) => {
    console.log(
      `🔧 handleRangeUpdate appelé avec start="${start}", end="${end}"`
    );

    // CAS 1 : Les deux champs vides → Afficher toutes les cartes
    if (!start && !end) {
      console.log(`🔧 Cas 1: Tous les champs vides → "all"`);
      onRangeChange("all");
      return;
    }

    // CAS 2 : Seulement "start" rempli → Afficher start et plus
    if (start && !end) {
      console.log(`🔧 Cas 2: Seulement start="${start}" → "${start}-infinity"`);
      onRangeChange(`${start}-infinity`);
      return;
    }

    // CAS 3 : Seulement "end" rempli → Afficher 1 à end
    if (!start && end) {
      console.log(`🔧 Cas 3: Seulement end="${end}" → "1-${end}"`);
      onRangeChange(`0-${end}`);
      return;
    }

    // CAS 4 : Les deux champs remplis → Afficher entre les deux
    if (start && end) {
      const startNum = parseInt(start);
      const endNum = parseInt(end);

      // ✅ AJOUT : Vérification de validité
      if (isNaN(startNum) || isNaN(endNum)) {
        console.error(
          `❌ Valeurs invalides: start="${start}"(${startNum}), end="${end}"(${endNum})`
        );
        onRangeChange("all"); // Fallback sécurisé
        return;
      }

      console.log(
        `🔧 Cas 4: start="${start}", end="${end}" → "${startNum}-${endNum}"`
      );
      onRangeChange(`${startNum}-${endNum}`);
    }
  };

  // FONCTION : Gérer le changement du champ "De" avec validation
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const validatedValue = validateNumericInput(rawValue); // Ne garde que les chiffres

    setStartRange(validatedValue); // Met à jour l'affichage avec la valeur nettoyée
    handleRangeUpdate(validatedValue, endRange); // Applique la logique de plage
  };

  // FONCTION : Gérer le changement du champ "À" avec validation
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    console.log("ceci est :" + rawValue);
    const validatedValue = validateNumericInput(rawValue); // Ne garde que les chiffres

    setEndRange(validatedValue); // Met à jour l'affichage avec la valeur nettoyée
    handleRangeUpdate(startRange, validatedValue); // Applique la logique de plage
  };

  // FONCTION : Reset de la plage
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
            onChange={onListChange}
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

        {/* Section pour la sélection de plage avec gestion d'erreur */}
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
          {/* Bouton fermer (seulement mobile ouvert) */}
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
