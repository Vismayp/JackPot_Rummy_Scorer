import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { validateRoundScores, getDropPenalty, MAX_ROUND_SCORE } from '../utils/gameLogic';
import './RoundInput.css';

export default function RoundInput() {
  const { state, dispatch } = useGame();
  const [scores, setScores] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState([]);

  const activePlayers = state.players.filter(p => p.status === 'active');
  const activePlayerIds = activePlayers.map(p => p.id).join(',');

  // Initialize scores when active players change
  useEffect(() => {
    const initial = {};
    activePlayers.forEach(player => {
      initial[player.id] = { score: '', isDrop: false, dropLevel: 0 };
    });
    setScores(initial);
    setErrors([]);
  }, [activePlayerIds]);

  const initializeScores = () => {
    const initial = {};
    activePlayers.forEach(player => {
      initial[player.id] = { score: '', isDrop: false, dropLevel: 0 };
    });
    setScores(initial);
    setErrors([]);
  };

  const handleScoreChange = (playerId, value) => {
    const numValue = value === '' ? '' : Math.max(0, Math.min(MAX_ROUND_SCORE, parseInt(value) || 0));
    setScores(prev => ({
      ...prev,
      [playerId]: { ...prev[playerId], score: numValue, isDrop: false, dropLevel: 0 }
    }));
    setErrors([]);
  };

  const handleDrop = (playerId) => {
    const player = state.players.find(p => p.id === playerId);
    if (!player) return;
    
    // Get the correct penalty based on player's current drop count
    const penalty = getDropPenalty(player.dropCount);
    // Determine drop level: if dropCount is 0, it's first drop (level 1), otherwise second drop (level 2)
    const dropLevel = player.dropCount === 0 ? 1 : 2;
    
    setScores(prev => ({
      ...prev,
      [playerId]: { 
        score: penalty, 
        isDrop: true, 
        dropLevel: dropLevel
      }
    }));
    setErrors([]);
  };

  const DropButton = ({ playerId }) => {
    return (
      <button 
        className="drop-btn"
        onClick={() => handleDrop(playerId)}
      >
        DROP
      </button>
    );
  };

  const handleClearDrop = (playerId) => {
    setScores(prev => ({
      ...prev,
      [playerId]: { score: '', isDrop: false, dropLevel: 0 }
    }));
  };

  const handleSubmit = () => {
    // Validate all players have scores
    const playersWithScores = activePlayers.filter(p => {
      const score = scores[p.id];
      return score && (score.score !== '' || score.isDrop);
    });

    if (playersWithScores.length === 0) {
      setErrors(['At least one player must have a score or drop']);
      return;
    }

    // Automatically assign 0 to the remaining player if only one is left
    let finalScores = { ...scores };
    const missingScores = activePlayers.filter(p => {
      const score = scores[p.id];
      return !score || (score.score === '' && !score.isDrop);
    });

    if (missingScores.length === 1) {
      const remainingPlayer = missingScores[0];
      finalScores[remainingPlayer.id] = { score: 0, isDrop: false, dropLevel: 0 };
    } else if (missingScores.length > 1) {
      setErrors(['All players except one must have a score or drop']);
      return;
    }

    // Prepare scores for validation
    const preparedScores = {};
    activePlayers.forEach(player => {
      const scoreData = finalScores[player.id];
      preparedScores[player.id] = {
        score: scoreData.isDrop ? scoreData.score : (parseInt(scoreData.score) || 0),
        isDrop: scoreData.isDrop,
        dropLevel: scoreData.dropLevel
      };
    });

    const validationErrors = validateRoundScores(preparedScores, activePlayers);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setScores(finalScores);
    setShowConfirm(true);
  };

  const confirmSubmit = () => {
    const preparedScores = {};
    activePlayers.forEach(player => {
      const scoreData = scores[player.id];
      preparedScores[player.id] = {
        score: scoreData.isDrop ? scoreData.score : (parseInt(scoreData.score) || 0),
        isDrop: scoreData.isDrop,
        dropLevel: scoreData.dropLevel
      };
    });

    dispatch({ type: 'SUBMIT_ROUND', payload: { scores: preparedScores } });
    setShowConfirm(false);
    initializeScores();
  };

  const cancelSubmit = () => {
    setShowConfirm(false);
  };

  if (activePlayers.length < 2) {
    return (
      <div className="round-input">
        <div className="no-players">
          <span className="accent">[GAME OVER]</span>
          <p>Not enough active players to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="round-input">
      <div className="round-header">
        <span className="section-label">[ROUND {state.currentRound}]</span>
        <span className="hint">Enter scores (0-{MAX_ROUND_SCORE})</span>
      </div>

      <div className="score-inputs">
        {activePlayers.map(player => {
          const scoreData = scores[player.id] || { score: '', isDrop: false };
          const isWinner = scoreData.score === 0 || scoreData.score === '0';
          
          return (
            <div 
              key={player.id} 
              className={`score-row ${isWinner ? 'winner' : ''} ${scoreData.isDrop ? 'dropped' : ''}`}
            >
              <div className="score-player">
                <span className="player-name">{player.name}</span>
                <span className="player-current">
                  ({player.totalScore} | D:{player.dropCount})
                </span>
              </div>
              
              <div className="score-controls">
                {scoreData.isDrop ? (
                  <div className="drop-indicator">
                    <span className="drop-value">
                      +{scoreData.score}↓{scoreData.dropLevel === 2 ? '↓' : ''}
                    </span>
                    <button 
                      className="clear-drop-btn"
                      onClick={() => handleClearDrop(player.id)}
                    >
                      [X]
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="number"
                      min="0"
                      max={MAX_ROUND_SCORE}
                      value={scoreData.score}
                      onChange={(e) => handleScoreChange(player.id, e.target.value)}
                      className={`score-input ${isWinner ? 'winner-input' : ''}`}
                      placeholder="--"
                    />
                    <DropButton playerId={player.id} />
                  </>
                )}
              </div>
              
              {isWinner && <span className="winner-badge">0*</span>}
            </div>
          );
        })}
      </div>

      {errors.length > 0 && (
        <div className="errors">
          {errors.map((error, i) => (
            <div key={i} className="error-line">&gt; ERROR: {error}</div>
          ))}
        </div>
      )}

      <button className="submit-btn" onClick={handleSubmit}>
        <span className="prompt">$</span> SUBMIT_ROUND
      </button>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-title">[CONFIRM ROUND {state.currentRound}]</div>
            <div className="confirm-scores">
              {activePlayers.map(player => {
                const scoreData = scores[player.id];
                return (
                  <div key={player.id} className="confirm-row">
                    <span>{player.name}</span>
                    <span className="confirm-value">
                      {scoreData.isDrop 
                        ? `+${scoreData.score}↓${scoreData.dropLevel === 2 ? '↓' : ''}`
                        : scoreData.score === 0 || scoreData.score === '0'
                          ? '0*'
                          : `+${scoreData.score}`
                      }
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="confirm-actions">
              <button className="cancel-btn" onClick={cancelSubmit}>
                CANCEL
              </button>
              <button className="confirm-btn" onClick={confirmSubmit}>
                CONFIRM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
