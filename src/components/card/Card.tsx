import React, { useState } from "react";
 
function Card({id, img,title}){
      // Définir l'état pour savoir si on montre le recto ou le verso
  const [isFlipped, setIsFlipped] = useState(false);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };
  
  return (
    <div className='card max-w-25 max-h-32 h-32 w-full h-full' onClick={handleCardClick}>
      {isFlipped ? (
        <div className='card-verso'>
          <div>
            <img src={img} alt={`image - ${title}`} />
          </div>
          <p>{title}</p>
        </div>
      ) : (
        <div className='card-recto '>
          <p>{id}</p>
        </div>
      )}
    </div>
  );
}
export default Card