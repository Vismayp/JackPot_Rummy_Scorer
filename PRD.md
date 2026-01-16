# 🃏 Jackpot Scorer
## Product Requirements Document (PRD) – v1.1

---

## 1. Product Overview

**Product Name:** Jackpot Scorer  
**Platform:** Web Application (Mobile-First)  
**Mode:** Offline / Local use  
**Primary User:** Single scorekeeper  

### Purpose
Jackpot Scorer is a mobile-first web application designed to accurately track scores for the Jackpot card game. It enforces game rules automatically, displays a real-time leaderboard, and maintains a complete round-by-round history in a rummy-style table format.

---

## 2. Design Philosophy

### Visual Theme
- CLI / Terminal-inspired UI
- Nothing Phone branding influence
- Dark background
- Monospaced typography
- High contrast (white + neon green)
- Minimal icons, ASCII-style indicators

### UX Principles
- Fast thumb-first interaction
- Zero clutter
- Always-visible history
- One-hand usability

---

## 3. Game Rules (Final)

### 3.1 Round Rules
- Each round must have **exactly one player with score = 0**
- Player with `0` score **wins the round**
- All other players:
  - Score must be `> 0` and `≤ 80`
- Scores are cumulative

---

### 3.2 Drop Rules
- Drops are tracked **per player, per game**
- Drop penalties:
  - First drop → `+25`
  - Second drop → `+40`
- Drop count does **not reset**

---

### 3.3 Elimination Rule
- Player is **eliminated** when:
  - `totalScore ≥ 250`
- Eliminated players:
  - Cannot be scored
  - Remain visible in leaderboard & history

---

### 3.4 Re-Entry Rule
- Eliminated players may re-enter manually
- On re-entry:
  - Score is set to:
    - **Lowest score among non-eliminated players**
  - Eliminated players are ignored for calculation
- No reset to zero
- Drop count remains unchanged

---

## 4. Scope Decisions (Locked)

| Feature | Status |
|------|------|
| Max players | Unlimited |
| Login/Auth | Not required |
| Online sync | Not required |
| Exports | Not required |
| Score reset on re-entry | ❌ No |
| Drop reset | ❌ No |

---

## 5. Core Features

### 5.1 Player Management
- Add player (name only)
- Remove player (before game starts)
- Automatic elimination at 250
- Manual re-entry for eliminated players

---

### 5.2 Round Scoring
- Auto-incrementing round counter
- Score input for all **active players**
- Validations:
  - Only one `0` allowed
  - Max score `80`
  - No negative values
- Submit confirmation before locking round

---

### 5.3 Leaderboard
- Sorted ascending by total score
- Player states:
  - Active
  - Eliminated
  - Re-entered
- Visual indicators:
  - Winner (0 score)
  - Near elimination warning (≥200)

---

## 6. Game History (Rummy-Style Table)

### 6.1 General Rules
- Displayed after **every round**
- Always visible below leaderboard
- Grows vertically per round
- Scrollable and mobile-optimized

---

### 6.2 Table Structure

#### Rows
- One row per round
- Final row = `TOTAL`

#### Columns
- Column 1: Round Number
- Columns 2–N: Players

R	A	B	C	D
1	0*	45	80	25↓
2	30	0*	40↓↓	20
3	25	50	0*	40
T	55	95	120	85

---

### 6.3 Symbols & Indicators

| Meaning | Representation |
|------|------|
| Round winner | `0*` |
| First drop | `25↓` |
| Second drop | `40↓↓` |
| Eliminated | Greyed cell |
| Inactive round | `—` |
| Re-entry | `↺` on name |

---

### 6.4 Eliminated Players
- Column remains visible
- Scores stop updating
- Inactive rounds show `—`

---

### 6.5 Re-Entry in History
- Column becomes active again
- First active round marked
- Historical data unchanged

---

### 6.6 Totals Row
- Sticky bottom row
- Sum of all rounds per player
- Updates after every round

---

## 7. Undo & Corrections

### Undo Last Round
- Removes last round row
- Reverts:
  - Scores
  - Drops
  - Elimination
- Totals recalculated safely
- Only one-step undo supported

---

## 8. Navigation Flow



Launch
└── Create Game
└── Add Players
└── Game Screen
├── Leaderboard
├── History Table
└── Round Input


---

## 9. Data Model (Conceptual)

### Player


id
name
totalScore
dropCount
status (active | eliminated)


### Round


roundNumber
scores {
playerId {
score
isDrop
dropLevel
}
}
winnerId


---

## 10. Non-Functional Requirements
- Works fully offline
- Uses LocalStorage
- <100ms UI response
- No backend required (v1)

---

## 11. Accessibility & UX
- High contrast colors
- Large tap targets
- Sticky headers/columns
- Keyboard friendly

---

## 12. Out of Scope
- Exports
- Multiplayer
- Authentication
- Analytics
- Editing historical rounds

---

## 13. Future Enhancements (Optional)
- Theme toggle
- Game templates
- Player stats
- Tablet landscape optimization

---

## 14. Definition of Done
- All rules enforced automatically
- No invalid rounds possible
- History table matches real-world rummy sheets
- Mobile-first UX verified

---
