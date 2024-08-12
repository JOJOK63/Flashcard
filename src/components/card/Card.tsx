import React from "react";

function Card({ id, img, title, isFlipped, flipCard }) {
  return (
    <div
      className="card max-w-25 max-h-40 h-40 w-full bg-white border-2"
      onClick={flipCard}
    >
      {isFlipped ? (
        <div className="card-verso flex flex-col items-center justify-between h-full">
          <div className="w-full h-8/10 flex justify-center items-center border-2 rounded-md ">
            <img
              src={img}
              alt={`image - ${title}`}
              className="object-cover h-full w-full rounded-md"
            />
          </div>
          <p
            className="w-full h-2/10 flex justify-center items-center 
          text-xs uppercase font-bold"
          >
            {title}
          </p>
        </div>
      ) : (
        <div className="card-recto ">
          <p>{id}</p>
        </div>
      )}
    </div>
  );
}

export default Card;
