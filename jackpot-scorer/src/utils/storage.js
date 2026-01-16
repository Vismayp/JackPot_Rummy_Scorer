// LocalStorage utility for game persistence
const STORAGE_KEY = 'jackpot-scorer-game';
const HISTORY_KEY = 'jackpot-scorer-history';

export const saveGame = (gameState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    
    // Also update history if the game has started and has progress
    if (gameState.gameStarted && (gameState.players.length > 0 || gameState.rounds.length > 0)) {
      updateGameHistory(gameState);
    }
  } catch (error) {
    console.error('Failed to save game:', error);
  }
};

export const loadGame = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to load game:', error);
    return null;
  }
};

export const clearGame = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game:', error);
  }
};

// History management
const updateGameHistory = (gameState) => {
  try {
    const history = getGameHistory();
    // Use a unique ID for the game if not present, or use the start time
    const gameId = gameState.gameId || Date.now().toString();
    const gameToSave = { ...gameState, gameId, lastUpdated: Date.now() };

    const existingIndex = history.findIndex(g => g.gameId === gameId);
    
    if (existingIndex !== -1) {
      history[existingIndex] = gameToSave;
    } else {
      history.unshift(gameToSave);
    }

    // Keep only the last 5 games
    const limitedHistory = history.slice(0, 5);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to update game history:', error);
  }
};

export const getGameHistory = () => {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load history:', error);
    return [];
  }
};

export const deleteFromHistory = (gameId) => {
  try {
    const history = getGameHistory();
    const updated = history.filter(g => g.gameId !== gameId);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to delete from history:', error);
  }
};