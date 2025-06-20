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
      className={`card min-w-24  h-24 w-full border-2 cursor-pointer 
    `}
      style={{
        borderColor: color || "var(--text-color)",
      }}
      onClick={flipCard}
    >
      {isFlipped ? (
        <div className="card-verso flex flex-col items-center justify-between h-full">
          {img && (
            <div className="w-full h-8/10 flex justify-center items-center  rounded-md ">
              <img
                src={img}
                alt={`image - ${title}`}
                className="object-cover h-full w-full rounded-xl p-2"
              />
            </div>
          )}
          <p
            className="w-full h-2/10 flex justify-center items-center 
          text-xs uppercase font-bold"
          >
            {title.split("–").map((part, idx) => (
              <span key={idx}>
                {part.trim()}
                <br />
              </span>
            ))}
          </p>
        </div>
      ) : (
        <div className="card-recto flex items-center justify-center h-full  rounded-md">
          <p className="text-md font-bold uppercase">{recto} </p>
        </div>
      )}
    </div>
  );
};

export default Card;
