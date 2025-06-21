import React from "react";
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
  onRangeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
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
  return (
    <>
      {/* Burger mobile */}
      {isMobile && (
        <div className="fixed w-full  flex justify-between p-4 bg-white z-10">
          <h1>Flashcard</h1>
          <button onClick={toggleMobileMenu}>☰</button>
        </div>
      )}

      <div
        className={`${isMobileMenuOpen ? "block" : "hidden"} ${
          isMobile
            ? "fixed inset-0  z-20 bg-white flex flex-col justify-around items-center "
            : "header fixed z-20 bg-white  w-full md:h-10vh md:p-5 md:border-2 md:rounded-md md:border-card-background md:flex md:justify-around md:items-center md:text-sm"
        }`}
      >
        <div className=" flex justify-center items-center">
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
        <div className="">
          <label htmlFor="range-choice" className="mr-2 uppercase">
            id :
          </label>
          <select
            id="range-choice"
            value={selectedRange}
            onChange={onRangeChange}
            className=" p-2 bg-background border-2 border-textColor rounded-lg"
          >
            <option value="all">Toutes</option>
            {Array.from({ length: 10 }, (_, i) => {
              const start = i * 10;
              const end = start + 9;
              return (
                <option key={i} value={`${start}-${end}`}>
                  {start}–{end}
                </option>
              );
            })}
          </select>
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
