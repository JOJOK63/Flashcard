import React from "react";

interface CardProps {
  id: number;
  recto: string;
  title: string;
  img?: string; // Rendre le champ img optionnel
  color?: string;
  isFlipped: boolean;
  flipCard: () => void;
}

const Card: React.FC<CardProps> = ({
  recto,
  title,
  img,
  color,
  isFlipped,
  flipCard,
}) => {
  return (
    <div
      className={`card w-full min-w-20 max-w-36 aspect-[3/4] border-2 cursor-pointer
  transition-all duration-200 hover:scale-105 rounded-lg overflow-hidden
  sm:max-w-34 md:max-w-28 lg:max-w-28 xl:max-w-44`}
      style={{
        borderColor: color || "var(--text-color)",
      }}
      onClick={flipCard}
    >
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
