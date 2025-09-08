import React, { useState } from "react";

interface CardInput {
  recto: string;
  title: string;
  img: string;
  color: string;
  recurrence: number; // Nouvelle propriété pour la récurrence
}

interface ModalProps {
  onClose: () => void;
  onSave: (list: {
    title: string;
    message?: string;
    cards: CardInput[];
  }) => void;
}

const Modal: React.FC<ModalProps> = ({ onClose, onSave }) => {
  const [listTitle, setListTitle] = useState("");
  const [message, setMessage] = useState("");
  const [cards, setCards] = useState<CardInput[]>([
    { recto: "", title: "", img: "", color: "", recurrence: 0 }, // Récurrence par défaut à 0
  ]);

  // Options de récurrence avec leurs labels
  const recurrenceOptions = [
    { value: 0, label: "Nouvelle carte" },
    { value: 1, label: "Quotidien (1 jour)" },
    { value: 2, label: "Bi-quotidien (2 jours)" },
    { value: 3, label: "Hebdomadaire (7 jours)" },
    { value: 4, label: "Mensuel (30 jours)" },
    { value: 5, label: "Trimestriel (3 mois)" },
    { value: 6, label: "Semestriel (6 mois)" },
    { value: 7, label: "Annuel (12 mois)" },
  ];

  const handleCardChange = (
    index: number,
    field: keyof CardInput,
    value: string | number
  ) => {
    const updatedCards = [...cards];
    if (field === "recurrence") {
      updatedCards[index][field] = value as number;
    } else {
      updatedCards[index][field] = value as string;
    }
    setCards(updatedCards);
  };

  const addCard = () => {
    setCards([
      ...cards,
      { recto: "", title: "", img: "", color: "", recurrence: 0 },
    ]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      const updatedCards = cards.filter((_, i) => i !== index);
      setCards(updatedCards);
    }
  };

  const handleSubmit = () => {
    if (listTitle.trim() === "") {
      alert("Le titre de la liste est obligatoire.");
      return;
    }

    onSave({ title: listTitle, message, cards });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div className="bg-white p-5 rounded-xl w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 max-h-90vh overflow-y-auto border border-gray-300">
        <h2 className="text-xl font-bold mb-4">Créer une nouvelle liste</h2>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">Titre de la liste</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            value={listTitle}
            onChange={(e) => setListTitle(e.target.value)}
            placeholder="Nom de votre liste de flashcards"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-semibold">
            Message (optionnel)
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Description de votre liste"
            rows={3}
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-bold mb-3">Cartes</h3>
          {cards.map((card, index) => (
            <div
              key={index}
              className="mb-6 p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-bold">Carte {index + 1}</h4>
                {cards.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCard(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                    title="Supprimer cette carte"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-semibold">
                    Recto (Texte)
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={card.recto}
                    onChange={(e) =>
                      handleCardChange(index, "recto", e.target.value)
                    }
                    placeholder="Texte du recto"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    Titre du verso
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={card.title}
                    onChange={(e) =>
                      handleCardChange(index, "title", e.target.value)
                    }
                    placeholder="Titre du verso"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    URL de l'image (verso)
                  </label>
                  <input
                    type="url"
                    className="w-full p-2 border border-gray-300 rounded"
                    value={card.img}
                    onChange={(e) =>
                      handleCardChange(index, "img", e.target.value)
                    }
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block mb-1 font-semibold">
                    Couleur du verso
                  </label>
                  <input
                    type="color"
                    className="w-full p-2 border border-gray-300 rounded h-10"
                    value={card.color || "#ffffff"}
                    onChange={(e) =>
                      handleCardChange(index, "color", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-1 font-semibold">
                  Niveau de récurrence
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded"
                  value={card.recurrence}
                  onChange={(e) =>
                    handleCardChange(
                      index,
                      "recurrence",
                      parseInt(e.target.value)
                    )
                  }
                >
                  {recurrenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded mb-4"
            onClick={addCard}
          >
            + Ajouter une carte
          </button>
        </div>

        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            onClick={onClose}
          >
            Annuler
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
            onClick={handleSubmit}
          >
            Enregistrer la liste
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
