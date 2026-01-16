import Leaderboard from './Leaderboard';
import RoundInput from './RoundInput';
import HistoryTable from './HistoryTable';
import GameControls from './GameControls';
import './GameScreen.css';

export default function GameScreen() {
  return (
    <div className="game-screen">
      <header className="game-header">
        <div className="logo">JACKPOT_SCORER</div>
        <div className="version">v1.0</div>
      </header>
      
      <GameControls />
      <Leaderboard />
      <RoundInput />
      <HistoryTable />
    </div>
  );
}
