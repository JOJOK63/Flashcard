export interface CardType {
    id: number;
    recto: string; // Texte du recto
    title: string; // Titre du verso
    img?: string; // Image du verso, optionnelle
    isFlipped?: boolean; // Optionnel car il peut être ajouté dynamiquement
  }
  
  export interface CardList {
    title: string;
    message?: string; // Optionnel
    cards: CardType[]; // Liste des cartes
  }
  