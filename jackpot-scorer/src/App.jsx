import { GameProvider, useGame } from './context/GameContext';
import PlayerSetup from './components/PlayerSetup';
import GameScreen from './components/GameScreen';
import './App.css';

function GameContent() {
  const { state } = useGame();

  if (!state.gameStarted) {
    return <PlayerSetup />;
  }

  return <GameScreen />;
}

function App() {
  return (
    <GameProvider>
      <div className="app">
        <GameContent />
      </div>
    </GameProvider>
  );
}

export default App;
