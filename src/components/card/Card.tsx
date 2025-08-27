import React from "react";

interface CardProps {
  id: number;
  recto: string;
  title: string;
  img?: string;
  color?: string;
  isFlipped: boolean;
  flipCard: () => void;
  recurrence: number;
  onRecurrenceChange?: (newRecurrence: number) => void;
}

const Card: React.FC<CardProps> = ({
  recto,
  title,
  img,
  color,
  isFlipped,
  flipCard,
  recurrence,
  onRecurrenceChange,
}) => {
  // Mapping des niveaux de récurrence avec leurs couleurs (1-7)
  const getRecurrenceInfo = (level: number) => {
    const recurrenceMap = {
      1: { label: "1j", color: "#f97316", bgColor: "#fed7aa" }, // Orange
      2: { label: "2j", color: "#eab308", bgColor: "#fef3c7" }, // Jaune
      3: { label: "7j", color: "#22c55e", bgColor: "#dcfce7" }, // Vert clair
      4: { label: "1m", color: "#3b82f6", bgColor: "#dbeafe" }, // Bleu
      5: { label: "3m", color: "#8b5cf6", bgColor: "#ede9fe" }, // Violet
      6: { label: "6m", color: "#ec4899", bgColor: "#fce7f3" }, // Rose
      7: { label: "1an", color: "#6b7280", bgColor: "#f3f4f6" }, // Gris
    };
    return (
      recurrenceMap[level as keyof typeof recurrenceMap] || recurrenceMap[1]
    );
  };

  const handleRecurrenceClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche le flip de la carte
    if (onRecurrenceChange) {
      // 🆕 MODIFICATION : Cycle de 1 à 7, puis retour à 1 (pas de 0)
      const nextLevel = recurrence >= 7 ? 1 : recurrence + 1;
      onRecurrenceChange(nextLevel);
    }
  };

  const recurrenceInfo = getRecurrenceInfo(recurrence);

  return (
    <div
      className={`card w-full min-w-20 max-w-36 aspect-[3/4] border-2 cursor-pointer
        transition-all duration-200 hover:scale-105 rounded-lg overflow-hidden relative
        sm:max-w-34 md:max-w-28 lg:max-w-28 xl:max-w-44`}
      style={{
        borderColor: color || "var(--text-color)",
      }}
      onClick={flipCard}
    >
      {/* Badge de récurrence - cliquable pour cycler */}
      <div
        className="absolute top-1 right-1 z-10 px-2 py-1 rounded-full text-xs font-bold cursor-pointer hover:scale-110 transition-transform border border-gray-300"
        style={{
          backgroundColor: recurrenceInfo.bgColor,
          color: recurrenceInfo.color,
        }}
        onClick={handleRecurrenceClick}
        title={`Récurrence: ${recurrenceInfo.label} - Cliquer pour changer (cycle 1→7)`}
      >
        {recurrenceInfo.label}
      </div>

      {isFlipped ? (
        <div className="card-verso flex flex-col h-full p-2">
          {img && (
            <div className="flex-1 flex justify-center items-center rounded-md overflow-hidden">
              <img
                src={img}
                alt={`image - ${title}`}
                className="object-cover w-full h-full rounded-lg"
              />
            </div>
          )}
          <div className="flex-shrink-0 mt-2 text-center">
            <p className="text-xs uppercase font-bold leading-tight">
              {title.split("–").map((part, idx) => (
                <span key={idx} className="block">
                  {part.trim()}
                </span>
              ))}
            </p>
          </div>
        </div>
      ) : (
        <div className="card-recto flex items-center justify-center h-full p-2 rounded-md">
          <p className="text-sm font-bold uppercase text-center leading-tight">
            {recto}
          </p>
        </div>
      )}
    </div>
  );
};

export default Card;
