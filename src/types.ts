// types.ts - Version mise à jour avec le système de récurrence

export interface CardType {
  id: number;
  recto: string;
  title: string;
  img?: string;
  color?: string;
  isFlipped?: boolean;
  recurrence: number; // 🆕 AJOUT - Obligatoire maintenant
}

export interface CardList {
  title: string;
  message?: string | { text: string; color?: string }[];
  cards: CardType[];
}

// 🆕 NOUVEAU - Interface pour les options de récurrence
export interface RecurrenceOption {
  value: number;
  label: string;
  description: string;
}

// 🆕 NOUVEAU - Constantes pour les niveaux de récurrence
export const RECURRENCE_LEVELS: RecurrenceOption[] = [
  { value: 1, label: "1j", description: "Révision quotidienne" },
  { value: 2, label: "2j", description: "Révision tous les 2 jours" },
  { value: 3, label: "7j", description: "Révision hebdomadaire" },
  { value: 4, label: "1m", description: "Révision mensuelle" },
  { value: 5, label: "3m", description: "Révision trimestrielle" },
  { value: 6, label: "6m", description: "Révision semestrielle" },
  { value: 7, label: "1an", description: "Révision annuelle" },
];
