import React, { useState } from 'react';
import './App.css';
import Card from './components/card/Card';
import tableCard from './table-de-rappel.json';
import Header from './components/header/Header';

function App() {
  // État pour savoir si les cartes sont affichées en recto ou verso par défaut
  const [showVerso, setShowVerso] = useState(false);

  // État pour gérer les cartes avec leur statut de retournement
  const [cards, setCards] = useState(tableCard.cards.map(card => ({
    ...card,
    isFlipped: showVerso, // Initialiser selon l'état global showVerso
  })));

  // Fonction pour réinitialiser toutes les cartes
  const resetCards = () => {
    setCards(cards.map(card => ({ ...card, isFlipped: false })));
  };

  // Fonction pour gérer le retournement des cartes
  const flipCard = (id) => {
    setCards(cards.map(card =>
      card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
    ));
  };

  // Fonction pour changer l'affichage initial
  const handleShowVersoChange = (e) => {
    const shouldShowVerso = e.target.checked;
    setShowVerso(shouldShowVerso);
    setCards(cards.map(card => ({ ...card, isFlipped: shouldShowVerso })));
  };

  return (
    <>
      <Header resetCards={resetCards} onShowVersoChange={handleShowVersoChange} showVerso={showVerso} />
     
      {tableCard.message && (
        <div className=''>
          <p className='text-center m-5 border-2 rounded-md w-auto'>{tableCard.message}</p>
        </div>
      )}

      <div className="main w-full h-auto p-10 grid grid-cols-10 gap-5 ">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            img={card.img}
            title={card.title}
            isFlipped={card.isFlipped}
            flipCard={() => flipCard(card.id)}
          />
        ))}
      </div>
    </>
  );
}

export default App;
