import React from "react";

interface CardProps {
  id: number;
  recto: string;
  title: string;
  img?: string; // Rendre le champ img optionnel
  isFlipped: boolean;
  flipCard: () => void;
}

const Card: React.FC<CardProps> = ({ recto, title, img, isFlipped, flipCard }) => {
  return (
    <div
      className="card max-w-25 max-h-40 h-40 w-full bg-card-background border-4 border-card-background"
      onClick={flipCard}
    >
      {isFlipped ? (
        <div className="card-verso flex flex-col items-center justify-between h-full bg-card-background">
          {img && (
            <div className="w-full h-8/10 flex justify-center items-center border-2 border-text rounded-md ">
              <img
                src={img}
                alt={`image - ${title}`}
                className="object-cover h-full w-full rounded-sm"
              />
            </div>
          )}
          <p
            className="w-full h-2/10 flex justify-center items-center 
          text-xs uppercase font-bold"
          >
            {title}
          </p>
        </div>
      ) : (
        <div className="card-recto flex items-center justify-center h-full bg-card-background border-2 border-text rounded-md">
          <p className="text-xl font-bold uppercase">{recto}</p>
        </div>
      )}
    </div>
  );
}

export default Card;
