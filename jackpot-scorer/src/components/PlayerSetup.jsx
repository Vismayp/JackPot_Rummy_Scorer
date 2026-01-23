import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { getGameHistory, deleteFromHistory } from '../utils/storage';
import './PlayerSetup.css';

export default function PlayerSetup() {
  const { state, dispatch } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [isSecretSeven, setIsSecretSeven] = useState(false);

  useEffect(() => {
    setHistory(getGameHistory());
  }, []);

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const name = playerName.trim();
    
    if (!name) {
      setError('> ERROR: Name cannot be empty');
      return;
    }
    
    if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      setError('> ERROR: Player already exists');
      return;
    }
    
    dispatch({ type: 'ADD_PLAYER', payload: name });
    setPlayerName('');
    setError('');
  };

  const handleRemovePlayer = (id) => {
    dispatch({ type: 'REMOVE_PLAYER', payload: id });
  };

  const handleStartGame = () => {
    if (state.players.length < 2) {
      setError('> ERROR: Need at least 2 players');
      return;
    }
    dispatch({ 
      type: 'START_GAME',
      payload: { gameMode: isSecretSeven ? 'secret_seven' : 'standard' }
    });
  };

  const handleResumeGame = (game) => {
    dispatch({ type: 'RESUME_GAME', payload: game });
  };

  const handleDeleteHistory = (e, gameId) => {
    e.stopPropagation();
    deleteFromHistory(gameId);
    setHistory(getGameHistory());
  };

  return (
    <div className="player-setup">
      <div className="terminal-header">
        <span className="prompt">$</span> jackpot-scorer --init
      </div>
      
      <div className="setup-section">
        <div className="section-title">[PLAYERS: {state.players.length}]</div>
        
        <form onSubmit={handleAddPlayer} className="add-player-form">
          <span className="prompt">&gt;</span>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="enter_player_name"
            className="terminal-input"
            autoFocus
          />
          <button type="submit" className="terminal-btn">ADD</button>
        </form>
        
        {error && <div className="error-msg">{error}</div>}
        
        <div className="player-list">
          {state.players.map((player, index) => (
            <div key={player.id} className="player-item">
              <span className="player-index">[{index + 1}]</span>
              <span className="player-name">{player.name}</span>
              <button 
                onClick={() => handleRemovePlayer(player.id)}
                className="remove-btn"
                aria-label={`Remove ${player.name}`}
              >
                [X]
              </button>
            </div>
          ))}
        </div>
        
        {state.players.length === 0 && (
          <div className="empty-state">
            <span className="blink">_</span> waiting for players...
          </div>
        )}
      </ddiv className="start-controls">
          <label className="mode-toggle" style={{ display: 'block', marginBottom: '10px', cursor: 'pointer', fontFamily: 'monospace' }}>
            <input 
              type="checkbox" 
              checked={isSecretSeven} 
              onChange={(e) => setIsSecretSeven(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            <span className={isSecretSeven ? 'accent' : ''}>[MODE: SECRET_SEVEN]</span>
          </label>
          <button onClick={handleStartGame} className="start-btn">
            <span className="prompt">$</span> START_GAME
          </button>
        </divyers.length >= 2 && (
        <button onClick={handleStartGame} className="start-btn">
          <span className="prompt">$</span> START_GAME
        </button>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <div className="section-title">[RESUME_LAST_GAMES]</div>
          <div className="history-list">
            {history.map((game) => (
              <div 
                key={game.gameId} 
                className="history-item"
                onClick={() => handleResumeGame(game)}
              >
                <div className="history-info">
                  <div className="history-players">
                    {game.players.map(p => p.name).join(', ')}
                  </div>
                  <div className="history-meta">
                    ROUND {game.currentRound - 1} • {new Date(game.lastUpdated).toLocaleDateString()}
                  </div>
                </div>
                <button 
                  className="history-delete"
                  onClick={(e) => handleDeleteHistory(e, game.gameId)}
                >
                  [DEL]
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
