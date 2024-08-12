import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './components/card/Card';
import Header from './components/header/Header';
import Modal from './components/modal/Modal';
import { CardType, CardList } from './types';

function App() {
  const [showVerso, setShowVerso] = useState<boolean>(false);
  const [cards, setCards] = useState<CardType[]>([]);
  const [lists, setLists] = useState<CardList[]>([]);
  const [selectedList, setSelectedList] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  useEffect(() => {
    const storedLists: CardList[] = JSON.parse(localStorage.getItem('cardLists') || '[]');
    setLists(storedLists);
    if (storedLists.length > 0) {
      setSelectedList(storedLists[0].title);
      setCards(
        storedLists[0].cards.map((card) => ({
          ...card,
          isFlipped: showVerso,
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (selectedList) {
      const selectedCards = lists.find((list) => list.title === selectedList)?.cards || [];
      setCards(
        selectedCards.map((card) => ({
          ...card,
          isFlipped: showVerso,
        }))
      );
    }
  }, [showVerso, selectedList, lists]);

  const resetCards = () => {
    setCards(cards.map((card) => ({ ...card, isFlipped: showVerso })));
  };

  const flipCard = (id: number) => {
    setCards(
      cards.map((card) => (card.id === id ? { ...card, isFlipped: !card.isFlipped } : card))
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
            localStorage.setItem('cardLists', JSON.stringify(updatedLists));
          } else {
            alert('Fichier JSON invalide.');
          }
        } catch (error) {
          alert('Erreur lors de la lecture du fichier JSON.');
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
      localStorage.setItem('cardLists', JSON.stringify(updatedLists));
      if (updatedLists.length > 0) {
        setSelectedList(updatedLists[0].title);
        setCards(
          updatedLists[0].cards.map((card) => ({
            ...card,
            isFlipped: showVerso,
          }))
        );
      } else {
        setSelectedList('');
        setCards([]);
      }
    }
  };

  const downloadJson = (json: object, filename: string) => {
    const jsonStr = JSON.stringify(json, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const saveNewList = (newList: { title: string; message?: string; cards: Omit<CardType, 'id'>[] }) => {
    const maxId = lists.reduce((max, list) => {
      const listMaxId = list.cards.reduce((innerMax, card) => Math.max(innerMax, card.id), 0);
      return Math.max(max, listMaxId);
    }, 0);

    const newCardsWithIds = newList.cards.map((card, index) => ({
      ...card,
      id: maxId + index + 1, // Assigner des IDs uniques
    }));

    const updatedList: CardList = { title: newList.title, message: newList.message, cards: newCardsWithIds };

    // Téléchargement du fichier JSON
    downloadJson(updatedList, updatedList.title);

    const updatedLists = [...lists, updatedList];
    setLists(updatedLists);
    localStorage.setItem('cardLists', JSON.stringify(updatedLists));
  };

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
      />

      {showModal && (
        <Modal
          onClose={() => setShowModal(false)}
          onSave={saveNewList} 
        />
      )}

      <div className="main w-full h-auto p-10 grid grid-cols-10 gap-5 ">
        {cards.map((card) => (
          <Card
            key={card.id}
            id={card.id}
            recto={card.recto}
            title={card.title}
            img={card.img}
            isFlipped={card.isFlipped || false}
            flipCard={() => flipCard(card.id)}
          />
        ))}
      </div>
    </>
  );
}

export default App;