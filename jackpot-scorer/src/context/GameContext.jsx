import { createContext, useContext, useReducer, useEffect } from "react";
import { saveGame, loadGame, clearGame } from "../utils/storage";
import {
  createPlayer,
  shouldEliminate,
  getDropPenalty,
  getHighestActiveScore,
  ELIMINATION_THRESHOLD,
} from "../utils/gameLogic";

const GameContext = createContext(null);

const initialState = {
  players: [],
  rounds: [],
  gameStarted: false,
  currentRound: 1,
  theme: "dark",
};

function gameReducer(state, action) {
  switch (action.type) {
    case "LOAD_GAME":
      return { ...initialState, ...(action.payload || {}) };

    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      };

    case "ADD_PLAYER": {
      if (state.gameStarted) return state;
      const newPlayer = createPlayer(action.payload);
      return {
        ...state,
        players: [...state.players, newPlayer],
      };
    }

    case "REMOVE_PLAYER": {
      if (state.gameStarted) return state;
      return {
        ...state,
        players: state.players.filter((p) => p.id !== action.payload),
      };
    }

    case "START_GAME": {
      if (state.players.length < 2) return state;
      return {
        ...state,
        gameStarted: true,
        gameId: Date.now().toString(),
      };
    }

    case "RESUME_GAME": {
      return {
        ...action.payload,
        theme: state.theme, // Keep current theme
      };
    }

    case "SUBMIT_ROUND": {
      const { scores } = action.payload;
      const newPlayers = state.players.map((player) => {
        const scoreData = scores[player.id];
        if (!scoreData || player.status === "eliminated") {
          return player;
        }

        let newTotal = player.totalScore;
        let newDropCount = player.dropCount;

        if (scoreData.isDrop) {
          const penalty = scoreData.dropLevel === 2 ? 40 : 25;
          newTotal += penalty;
          newDropCount = player.dropCount + 1;
        } else {
          newTotal += scoreData.score;
        }

        const newStatus = shouldEliminate(newTotal) ? "eliminated" : "active";

        return {
          ...player,
          totalScore: newTotal,
          dropCount: newDropCount,
          status: newStatus,
        };
      });

      // Find the winner (player with 0 score)
      const winnerId = Object.entries(scores).find(
        ([, data]) => data.score === 0 && !data.isDrop,
      )?.[0];

      const newRound = {
        roundNumber: state.currentRound,
        scores: scores,
        winnerId,
      };

      return {
        ...state,
        players: newPlayers,
        rounds: [...state.rounds, newRound],
        currentRound: state.currentRound + 1,
      };
    }

    case "REENTER_PLAYER": {
      const playerId = action.payload;
      const player = state.players.find((p) => p.id === playerId);
      if (!player || player.status !== "eliminated") return state;

      const highestScore = getHighestActiveScore(state.players);

      return {
        ...state,
        players: state.players.map((p) =>
          p.id === playerId
            ? {
                ...p,
                status: "active",
                totalScore: highestScore,
                hasReentered: true,
              }
            : p,
        ),
      };
    }

    case "UNDO_ROUND": {
      if (state.rounds.length === 0) return state;

      const lastRound = state.rounds[state.rounds.length - 1];

      const newPlayers = state.players.map((player) => {
        const scoreData = lastRound.scores[player.id];
        if (!scoreData) return player;

        let newTotal = player.totalScore;
        let newDropCount = player.dropCount;

        if (scoreData.isDrop) {
          // Use the drop level that was used in that round
          const penalty = scoreData.dropLevel === 2 ? 40 : 25;
          newTotal -= penalty;
          newDropCount = Math.max(0, player.dropCount - 1);
        } else {
          newTotal -= scoreData.score;
        }

        // Check if player was eliminated due to this round
        const wasEliminatedThisRound =
          player.status === "eliminated" &&
          player.totalScore >= ELIMINATION_THRESHOLD &&
          newTotal < ELIMINATION_THRESHOLD;

        return {
          ...player,
          totalScore: Math.max(0, newTotal),
          dropCount: newDropCount,
          status: wasEliminatedThisRound ? "active" : player.status,
        };
      });

      return {
        ...state,
        players: newPlayers,
        rounds: state.rounds.slice(0, -1),
        currentRound: state.currentRound - 1,
      };
    }

    case "NEW_GAME": {
      clearGame();
      return {
        ...initialState,
        theme: state.theme,
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Load game on mount
  useEffect(() => {
    const saved = loadGame();
    if (saved) {
      dispatch({ type: "LOAD_GAME", payload: saved });
      if (saved.theme) {
        document.documentElement.setAttribute("data-theme", saved.theme);
      }
    }
  }, []);

  // Update theme on document
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", state.theme);
  }, [state.theme]);

  // Save game on state change
  useEffect(() => {
    if (state.players.length > 0 || state.rounds.length > 0) {
      saveGame(state);
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
