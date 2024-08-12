import React, { useState } from 'react';
import rerollSvg from '../../../public/refresh-line.svg';
import addSvg from '../../../public/add-circle-line.svg';
import deleteSvg from '../../../public/close-circle-line.svg';
import Modal from '../modal/Modal';
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
  onSaveNewList: (list: CardList) => void; // Assurez-vous que cette prop est bien passée
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
  onSaveNewList,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveList = (list: CardList) => {
    onSaveNewList(list);
  };

  return (
    <>
      <div className="header h-10vh p-5 border-2 rounded-md flex">
        <div className="w-1/5 flex justify-center items-center add">
          <button className="w-10 h-10" onClick={() => setIsModalOpen(true)}>
            <img src={addSvg} alt="icone add" />
          </button>
        </div>
        <div className="w-1/5 flex justify-center items-center uppercase relative">
          <label htmlFor="list-choice">Choisissez une liste</label>
          <select
            name="list-choice"
            id="list-choice"
            className="uppercase ml-2"
            value={selectedList}
            onChange={onListChange}
          >
            {lists.map((list, index) => (
              <option key={index} value={list.title}>
                {list.title}
              </option>
            ))}
          </select>
          <button className=" w-10 h-10 ml-2" onClick={onDeleteList}>
            <img src={deleteSvg} alt="Supprimer la liste" />
          </button>
        </div>
        <div className="w-1/5 flex justify-center items-center">
          RECTO / VERSO
          <label className="switch ml-2">
            <input
              type="checkbox"
              checked={showVerso}
              onChange={onShowVersoChange}
            />
            <span className="slider round"></span>
          </label>
        </div>
        <div className="w-1/5 flex justify-center items-center">
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
        <div className="w-1/5 flex justify-center items-center refresh">
          <button className="w-10 h-10" onClick={resetCards}>
            <img src={rerollSvg} alt="icone reset" />
          </button>
        </div>
      </div>
      {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} onSave={handleSaveList} />}
    </>
  );
};

export default Header;
