import React, { useState } from 'react';

interface CardInput {
  recto: string;
  title: string;
  img: string;
}

interface ModalProps {
  onClose: () => void;
  onSave: (list: { title: string; message?: string; cards: CardInput[] }) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onSave }) => {
  const [listTitle, setListTitle] = useState('');
  const [message, setMessage] = useState('');
  const [cards, setCards] = useState<CardInput[]>([{ recto: '', title: '', img: '' }]);

  const handleCardChange = (index: number, field: keyof CardInput, value: string) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const addCard = () => {
    setCards([...cards, { recto: '', title: '', img: '' }]);
  };

  const handleSubmit = () => {
    if (listTitle.trim() === '') {
      alert('Le titre de la liste est obligatoire.');
      return;
    }

    onSave({ title: listTitle, message, cards });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
      <div className="bg-card-background p-5 rounded w-2/3 h-90vh overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Créer une nouvelle liste</h2>
        <div className="mb-4">
          <label className="block mb-1">Titre de la liste</label>
          <input
            type="text"
            className="w-full p-2 border"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Message (optionnel)</label>
          <textarea
            className="w-full p-2 border"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        {cards.map((card, index) => (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold mb-2">Carte {index + 1}</h3>
            <div className="mb-2">
              <label className="block mb-1">Recto (Texte, optionnel)</label>
              <input
                type="text"
                className="w-full p-2 border"
                value={card.recto}
                onChange={(e) => handleCardChange(index, 'recto', e.target.value)}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Titre du verso (optionnel)</label>
              <input
                type="text"
                className="w-full p-2 border"
                value={card.title}
                onChange={(e) => handleCardChange(index, 'title', e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">URL de l'image (verso, optionnel)</label>
              <input
                type="text"
                className="w-full p-2 border"
                value={card.img}
                onChange={(e) => handleCardChange(index, 'img', e.target.value)}
              />
            </div>
          </div>
        ))}
        <button className="bg-text text-card-background font-semibold py-2 px-4 rounded mb-4" onClick={addCard}>
          Ajouter une carte
        </button>
        <div className="flex justify-end">
          <button className="bg-background text-text py-2 px-4 rounded mr-2" onClick={onClose}>
            Annuler
          </button>
          <button className="bg-text  text-card-background font-bold py-2 px-4 rounded" onClick={handleSubmit}>
            Enregistrer la liste
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
