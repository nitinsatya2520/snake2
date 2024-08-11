import React, { useState, useEffect, useCallback } from "react";
import "./GameBoard.css";

const boardSize = 12; // Define the size of the game board

// Function to generate random food position
const generateRandomFood = (snakePositions) => {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * boardSize),
      y: Math.floor(Math.random() * boardSize),
    };
  } while (isFoodOnSnake(newFood, snakePositions));
  return newFood;
};

// Function to check if food is on the snake
const isFoodOnSnake = (foodPosition, snakePositions) => {
  return snakePositions.some(
    (segment) => segment.x === foodPosition.x && segment.y === foodPosition.y
  );
};

const GameBoard = () => {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState(() =>
    generateRandomFood([{ x: 5, y: 5 }])
  );
  const [bigFood, setBigFood] = useState(null); // Track big food
  const [direction, setDirection] = useState({ x: 0, y: 0 });
  const [isPaused, setIsPaused] = useState(true);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [topScore, setTopScore] = useState(
    localStorage.getItem("topScore") || 0
  );

  // References to sound elements
  const eatSound = new Audio(require('./sounds/eat.mp3'));
  const gameOverSound = new Audio(require('./sounds/game over.mp3'));

  const resetGame = useCallback(() => {
    if (score > topScore) {
      setTopScore(score);
      localStorage.setItem("topScore", score);
    }
    setSnake([{ x: 5, y: 5 }]);
    setDirection({ x: 0, y: 0 });
    setScore(0);
    setIsPaused(true);
    setIsGameOver(false);
    setFood(generateRandomFood([{ x: 5, y: 5 }]));
    setBigFood(null); // Reset big food
  }, [score, topScore]);

  const moveSnake = useCallback(() => {
    if (isPaused) return;

    const newHead = {
      x: snake[0].x + direction.x,
      y: snake[0].y + direction.y,
    };

    // Check for wall collisions
    if (
      newHead.x < 0 ||
      newHead.x >= boardSize ||
      newHead.y < 0 ||
      newHead.y >= boardSize
    ) {
      setIsGameOver(true);
      setIsPaused(true);
      gameOverSound.play(); // Play game over sound
      return;
    }

    // Check for self-collision
    

    const newSnake = [newHead, ...snake];

    // Check if normal food is eaten
    if (newHead.x === food.x && newHead.y === food.y) {
      setScore((prevScore) => {
        const newScore = prevScore + 1;
        // Spawn big food when score is a multiple of 5 and no big food exists
        if (newScore % 5 === 0 && !bigFood) {
          setBigFood(generateRandomFood(newSnake));
        }
        return newScore;
      });
      setFood(generateRandomFood(newSnake));
      eatSound.play(); // Play eat sound
      // Don't remove the tail, so the snake grows
    } else if (bigFood && newHead.x === bigFood.x && newHead.y === bigFood.y) {
      // Check if big food is eaten
      setScore((prevScore) => prevScore + 5); // Increase score by 5 for big food
      setBigFood(null); // Remove big food after eating
      eatSound.play(); // Play eat sound
      // Don't remove the tail, so the snake grows
    } else {
      newSnake.pop(); // Remove the tail if no food is eaten
    }

    setSnake(newSnake);
  }, [snake, direction, food, bigFood, isPaused]);

  useEffect(() => {
    if (!isPaused && !isGameOver) {
      const id = setInterval(moveSnake, 200);
      return () => clearInterval(id);
    }
  }, [moveSnake, isPaused, isGameOver]);

  const handleKeyPress = useCallback((e) => {
    switch (e.key) {
      case "ArrowUp":
        if (direction.y === 0) setDirection({ x: 0, y: -1 });
        break;
      case "ArrowDown":
        if (direction.y === 0) setDirection({ x: 0, y: 1 });
        break;
      case "ArrowLeft":
        if (direction.x === 0) setDirection({ x: -1, y: 0 });
        break;
      case "ArrowRight":
        if (direction.x === 0) setDirection({ x: 1, y: 0 });
        break;
      default:
        break;
    }
  }, [direction]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStart = () => {
    setIsPaused(false);
  };

  return (
    <div className="game-container">
      <div className="score-board">
        <div>Score: {score}</div>
        <div>Top Score: {topScore}</div>
      </div>
      <div className="game-board">
        {snake.map((segment, index) => (
          <div
            key={index}
            className="snake-segment"
            style={{
              top: `${segment.y * (100 / boardSize)}%`,
              left: `${segment.x * (100 / boardSize)}%`,
            }}
          />
        ))}
        <div
          className="food"
          style={{
            top: `${food.y * (100 / boardSize)}%`,
            left: `${food.x * (100 / boardSize)}%`,
          }}
        />
        {bigFood && (
          <div
            className="big-food"
            style={{
              top: `${bigFood.y * (100 / boardSize)}%`,
              left: `${bigFood.x * (100 / boardSize)}%`,
            }}
          />
        )}
      </div>
      {isGameOver && (
        <div className="game-over">
          <div>Game Over</div>
          <button onClick={resetGame}>Try Again</button>
        </div>
      )}
      {!isGameOver && (
        <div className="controls">
          <button onClick={handleStart} disabled={!isPaused}>
            Start
          </button>
          <button onClick={handlePauseResume}>
            {isPaused ? "Resume" : "Pause"}
          </button>
        </div>
      )}
      <div className="arrows">
        <div className="arrows-row">
          <button onClick={() => setDirection({ x: 0, y: -1 })}>&uarr;</button>
        </div>
        <div className="arrows-row">
          <button onClick={() => setDirection({ x: -1, y: 0 })}>&larr;</button>
          <button onClick={() => setDirection({ x: 1, y: 0 })}>&rarr;</button>
        </div>
        <div className="arrows-row">
          <button onClick={() => setDirection({ x: 0, y: 1 })}>&darr;</button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
