// Game constants
export const ELIMINATION_THRESHOLD = 250;
export const MAX_ROUND_SCORE = 80;
export const DROP_PENALTIES = {
  1: 25,
  2: 40
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create a new player
export const createPlayer = (name) => ({
  id: generateId(),
  name: name.trim(),
  totalScore: 0,
  dropCount: 0,
  status: 'active', // 'active' | 'eliminated'
  hasReentered: false
});

// Calculate if player should be eliminated
export const shouldEliminate = (totalScore) => totalScore >= ELIMINATION_THRESHOLD;

// Get drop penalty based on drop count
export const getDropPenalty = (currentDropCount) => {
  if (currentDropCount >= 2) return DROP_PENALTIES[2];
  return DROP_PENALTIES[currentDropCount + 1];
};

// Get lowest score among non-eliminated players (for re-entry)
export const getLowestActiveScore = (players) => {
  const activePlayers = players.filter(p => p.status === 'active');
  if (activePlayers.length === 0) return 0;
  return Math.min(...activePlayers.map(p => p.totalScore));
};

// Validate round scores
export const validateRoundScores = (scores, activePlayers) => {
  const errors = [];
  const scoreValues = Object.values(scores);
  
  // Check if exactly one player has 0 score
  const zeroScores = scoreValues.filter(s => s.score === 0 && !s.isDrop);
  if (zeroScores.length !== 1) {
    errors.push('Exactly one player must have a score of 0 (round winner)');
  }
  
  // Check score ranges
  for (const [playerId, scoreData] of Object.entries(scores)) {
    const player = activePlayers.find(p => p.id === playerId);
    if (!player) continue;
    
    if (scoreData.isDrop) {
      // Drop is valid
      continue;
    }
    
    if (scoreData.score < 0) {
      errors.push(`${player.name}: Score cannot be negative`);
    }
    
    if (scoreData.score > MAX_ROUND_SCORE) {
      errors.push(`${player.name}: Score cannot exceed ${MAX_ROUND_SCORE}`);
    }
  }
  
  return errors;
};

// Calculate new total score after a round
export const calculateNewTotal = (currentTotal, roundScore, isDrop, currentDropCount) => {
  if (isDrop) {
    const penalty = getDropPenalty(currentDropCount);
    return currentTotal + penalty;
  }
  return currentTotal + roundScore;
};
