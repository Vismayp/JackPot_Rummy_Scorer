import { useGame } from '../context/GameContext';
import './GameControls.css';

export default function GameControls() {
  const { state, dispatch } = useGame();

  const handleUndo = () => {
    if (state.rounds.length === 0) return;
    if (confirm('Undo last round? This will revert all score changes.')) {
      dispatch({ type: 'UNDO_ROUND' });
    }
  };

  const handleNewGame = () => {
    if (confirm('Start a new game? All current progress will be lost.')) {
      dispatch({ type: 'NEW_GAME' });
    }
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  return (
    <div className="game-controls">
      <button 
        className="control-btn theme-btn"
        onClick={toggleTheme}
      >
        [{state.theme.toUpperCase()}_MODE]
      </button>
      <button 
        className="control-btn undo-btn"
        onClick={handleUndo}
        disabled={state.rounds.length === 0}
      >
        [UNDO]
      </button>
      <button 
        className="control-btn new-game-btn"
        onClick={handleNewGame}
      >
        [NEW GAME]
      </button>
    </div>
  );
}
