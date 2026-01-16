import { useGame } from '../context/GameContext';
import { getDropPenalty } from '../utils/gameLogic';
import './HistoryTable.css';

export default function HistoryTable() {
  const { state } = useGame();

  if (state.rounds.length === 0) {
    return (
      <div className="history-table">
        <div className="history-header">
          <span className="section-label">[HISTORY]</span>
        </div>
        <div className="no-history">
          <span className="blink">_</span> No rounds played yet...
        </div>
      </div>
    );
  }

  // Get display value for a cell
  const getCellDisplay = (player, round) => {
    const scoreData = round.scores[player.id];
    
    if (!scoreData) {
      return { value: '—', className: 'inactive' };
    }

    if (scoreData.isDrop) {
      const dropSymbol = scoreData.dropLevel === 2 ? '↓↓' : '↓';
      return { 
        value: `${scoreData.score}${dropSymbol}`, 
        className: 'drop' 
      };
    }

    if (scoreData.score === 0) {
      return { value: '0*', className: 'winner' };
    }

    return { value: scoreData.score.toString(), className: '' };
  };

  // Check if player was eliminated after a specific round
  const wasEliminatedAfterRound = (player, roundIndex) => {
    let runningTotal = 0;
    for (let i = 0; i <= roundIndex; i++) {
      const round = state.rounds[i];
      const scoreData = round.scores[player.id];
      if (scoreData) {
        runningTotal += scoreData.score;
      }
    }
    return runningTotal >= 250;
  };

  // Calculate running total up to a specific round
  const getRunningTotal = (player, upToRoundIndex) => {
    let total = 0;
    for (let i = 0; i <= upToRoundIndex; i++) {
      const round = state.rounds[i];
      const scoreData = round.scores[player.id];
      if (scoreData) {
        total += scoreData.score;
      }
    }
    return total;
  };

  return (
    <div className="history-table">
      <div className="history-header">
        <span className="section-label">[HISTORY]</span>
        <span className="round-count">{state.rounds.length} rounds</span>
      </div>

      <div className="table-container">
        <table className="history">
          <thead>
            <tr>
              <th className="round-col">R</th>
              {state.players.map(player => (
                <th key={player.id} className="player-col">
                  <span className="player-header">
                    {player.name.substring(0, 6)}
                    {player.hasReentered && <span className="reentry-mark">↺</span>}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {state.rounds.map((round, roundIndex) => (
              <tr key={round.roundNumber}>
                <td className="round-num">{round.roundNumber}</td>
                {state.players.map(player => {
                  const { value, className } = getCellDisplay(player, round);
                  const isEliminated = wasEliminatedAfterRound(player, roundIndex);
                  
                  return (
                    <td 
                      key={player.id} 
                      className={`score-cell ${className} ${isEliminated ? 'eliminated' : ''}`}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="total-row">
              <td className="total-label">T</td>
              {state.players.map(player => (
                <td key={player.id} className="total-cell">
                  {player.totalScore}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
