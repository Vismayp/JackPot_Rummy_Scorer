import { useGame } from '../context/GameContext';
import { ELIMINATION_THRESHOLD } from '../utils/gameLogic';
import './Leaderboard.css';

export default function Leaderboard() {
  const { state, dispatch } = useGame();

  // Sort players by total score (ascending)
  const sortedPlayers = [...state.players].sort((a, b) => {
    // Active players first, then eliminated
    if (a.status !== b.status) {
      return a.status === 'active' ? -1 : 1;
    }
    return a.totalScore - b.totalScore;
  });

  const handleReentry = (playerId) => {
    dispatch({ type: 'REENTER_PLAYER', payload: playerId });
  };

  const getPlayerStatus = (player) => {
    if (player.status === 'eliminated') return 'ELIMINATED';
    if (player.hasReentered) return 'RE-ENTERED';
    return 'ACTIVE';
  };

  const getStatusClass = (player) => {
    if (player.status === 'eliminated') return 'status-eliminated';
    if (player.hasReentered) return 'status-reentered';
    if (player.totalScore >= 200) return 'status-warning';
    return 'status-active';
  };

  const activePlayers = state.players.filter(p => p.status === 'active');

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <span className="section-label">[LEADERBOARD]</span>
        <span className="round-label">ROUND {state.currentRound}</span>
      </div>

      <div className="leaderboard-list">
        {sortedPlayers.map((player, index) => (
          <div 
            key={player.id} 
            className={`leaderboard-item ${getStatusClass(player)}`}
          >
            <div className="player-rank">
              {player.status === 'active' ? `#${index + 1}` : '--'}
            </div>
            
            <div className="player-info">
              <div className="player-name-row">
                <span className="player-name">
                  {player.name}
                  {player.hasReentered && <span className="reentry-icon"> ↺</span>}
                </span>
                <span className={`player-status ${getStatusClass(player)}`}>
                  {getPlayerStatus(player)}
                </span>
              </div>
              
              <div className="player-stats">
                <span className="score">
                  SCORE: {player.totalScore}
                  {player.totalScore >= 200 && player.status === 'active' && (
                    <span className="warning-indicator"> !</span>
                  )}
                </span>
              </div>
              
              {player.totalScore >= 200 && player.status === 'active' && (
                <div className="warning-bar">
                  <div 
                    className="warning-fill" 
                    style={{ width: `${Math.min(100, (player.totalScore / ELIMINATION_THRESHOLD) * 100)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div className="player-total">
              {player.totalScore}
            </div>
            
            {player.status === 'eliminated' && activePlayers.length > 0 && (
              <button 
                className="reentry-btn"
                onClick={() => handleReentry(player.id)}
              >
                RE-ENTER
              </button>
            )}
          </div>
        ))}
      </div>

      {state.players.filter(p => p.status === 'active').length <= 1 && state.rounds.length > 0 && (
        <div className="game-over">
          <span className="accent">[GAME OVER]</span>
          {state.players.filter(p => p.status === 'active').length === 1 && (
            <span className="winner">
              WINNER: {state.players.find(p => p.status === 'active')?.name}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
