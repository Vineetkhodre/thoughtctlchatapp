import React from "react";

interface CardProps {
  username: string;
  onClick: () => void;
}

/**
 * Card Component
 * @param {Object} props - Component props
 * @param {string} props.username - User's name to display on the card
 * @param {Function} props.onClick - Click event handler when the card is clicked
 */
function Card(props: CardProps) {
  /**
   * Handles the click event on the card
   */
  const handleCardClick = () => {
    props.onClick();
  };

  return (
    // Card container with a click event listener
    <div className="Card flexcolcenteralign" onClick={handleCardClick}>
      {/* Information displayed on the card */}
      <div className="card_info flexrow">{props.username}</div>
    </div>
  );
}

export default Card;
