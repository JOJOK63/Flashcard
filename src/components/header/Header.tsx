import React from 'react';
import rerollSvg from '../../../public/refresh-line(1).svg';
import addSvg from '../../../public/add-circle-line(1).svg';
import deleteSvg from '../../../public/close-circle-line(1).svg';
import { CardList } from '../../types';

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
}) => {
  return (
    <div className="header h-10vh p-5 border-2 rounded-md border-card-background flex justify-around">
      <div className="w-1/10 flex justify-center items-center relative">
        <button className="w-10 h-10 relative group" onClick={onAddNewList}>
          <img src={addSvg} alt="icone add" className='fill-current text-card-background'/>
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Ajouter liste
          </span>
        </button>
      </div>
      <div className="w-1/4 flex justify-center items-center uppercase relative">
        <label htmlFor="list-choice">Choisissez une liste</label>
        <select
          name="list-choice"
          id="list-choice"
          className="uppercase ml-2 p-2 bg-background border-2 border-card-background"
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
          <button className="w-10 h-10 ml-2 relative group" onClick={onDeleteList}>
            <img src={deleteSvg} alt="Supprimer la liste" />
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Supprimer liste
            </span>
          </button>
        </div>
      </div>
      <div className="w-1/10 flex justify-center items-center">
        RECTO / VERSO
        <label className="switch ml-2">
          <input
            type="checkbox"
            checked={showVerso}
            onChange={onShowVersoChange} 
          />
          <span className="slider round bg-card-background"></span>
        </label>
      </div>
      <div className="w-1/10 flex justify-center items-center p-2 border-2 bg-card-background border-text">
        <label htmlFor="json-upload" className="cursor-pointer">
          Importer un fichier JSON
        </label>
        <input
          type="file"
          id="json-upload"
          className="hidden"
          accept=".json"
          onChange={onFileImport}
        />
      </div>
      <div className="w-1/10 flex justify-center items-center relative">
        <button className="w-10 h-10 relative group" onClick={resetCards}>
          <img src={rerollSvg} alt="icone reset" />
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 w-max px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Rafraîchir liste
          </span>
        </button>
      </div>
    </div>
  );
};

export default Header;
