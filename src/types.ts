export interface CardType {
    id: number;
    recto: string; // Nouveau champ pour le texte du recto
    title: string;
    img: string;
    isFlipped?: boolean;
  }
  
  export interface CardList {
    title: string;
    message?: string;
    cards: CardType[];
  }
  