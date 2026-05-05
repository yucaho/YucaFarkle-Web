import React, { useMemo, useState } from 'react';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

const DICE_ICONS = {
  1: Dice1,
  2: Dice2,
  3: Dice3,
  4: Dice4,
  5: Dice5,
  6: Dice6
};

const STARTING_DICE = 6;

function rollDiceValues(count) {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 6) + 1);
}

function calculatePossibleScore(diceArr) {
  if (!diceArr.length) {
    return 0;
  }

  const counts = [0, 0, 0, 0, 0, 0, 0];
  diceArr.forEach((value) => {
    counts[value] += 1;
  });

  const sorted = counts.slice(1);
  const pairCount = sorted.filter((count) => count === 2).length;

  if (pairCount === 3 && diceArr.length === 6) {
    return 1500;
  }

  if (sorted.every((count) => count === 1) && diceArr.length === 6) {
    return 2500;
  }

  const hasOneThroughFive = [1, 2, 3, 4, 5].every((face) => counts[face] === 1) && counts[6] === 0;
  if (hasOneThroughFive && diceArr.length === 5) {
    return 500;
  }

  const hasTwoThroughSix = [2, 3, 4, 5, 6].every((face) => counts[face] === 1) && counts[1] === 0;
  if (hasTwoThroughSix && diceArr.length === 5) {
    return 750;
  }

  let score = 0;

  for (let face = 1; face <= 6; face += 1) {
    const count = counts[face];
    if (count >= 3) {
      const baseTriple = face === 1 ? 1000 : face * 100;
      score += baseTriple * (2 ** (count - 3));
      counts[face] = 0;
    }
  }

  score += counts[1] * 100;
  score += counts[5] * 50;

  return score;
}

function hasScoringDice(diceArr) {
  if (!diceArr.length) {
    return false;
  }

  const counts = [0, 0, 0, 0, 0, 0, 0];
  diceArr.forEach((value) => {
    counts[value] += 1;
  });

  const sixDice = diceArr.length === 6;
  const pairs = counts.slice(1).filter((count) => count === 2).length;
  const straight = counts.slice(1).every((count) => count === 1);

  if (sixDice && (pairs === 3 || straight)) {
    return true;
  }

  const shortOneToFive = diceArr.length === 5 && [1, 2, 3, 4, 5].every((face) => counts[face] === 1) && counts[6] === 0;
  const shortTwoToSix = diceArr.length === 5 && [2, 3, 4, 5, 6].every((face) => counts[face] === 1) && counts[1] === 0;

  if (shortOneToFive || shortTwoToSix) {
    return true;
  }

  for (let face = 1; face <= 6; face += 1) {
    if (counts[face] >= 3) {
      return true;
    }
  }

  return counts[1] > 0 || counts[5] > 0;
}

export default function FarkleGame() {
  const [currentDice, setCurrentDice] = useState([]);
  const [selectedDice, setSelectedDice] = useState([]);
  const [lockedDice, setLockedDice] = useState([]);
  const [pendingScore, setPendingScore] = useState(0);
  const [turnScore, setTurnScore] = useState(0);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore] = useState(0);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [message, setMessage] = useState('Click Roll Dice to start your turn.');

  const remainingDiceCount = STARTING_DICE - lockedDice.length;

  const diceToRender = useMemo(
    () => currentDice.map((value, index) => ({ id: `${value}-${index}`, value })),
    [currentDice]
  );

  function resetGame() {
    setCurrentDice([]);
    setSelectedDice([]);
    setLockedDice([]);
    setPendingScore(0);
    setTurnScore(0);
    setPlayerScore(0);
    setIsPlayerTurn(true);
    setMessage('Game reset. Click Roll Dice to start again.');
  }

  function endPlayerTurn(extraMessage = 'Turn passed to bot placeholder.') {
    setCurrentDice([]);
    setSelectedDice([]);
    setLockedDice([]);
    setPendingScore(0);
    setTurnScore(0);
    setIsPlayerTurn(false);

    window.setTimeout(() => {
      setIsPlayerTurn(true);
      setMessage(`${extraMessage} Bot finished quickly. Your turn.`);
    }, 750);
  }

  function rollDice() {
    if (!isPlayerTurn) {
      return;
    }

    const count = remainingDiceCount === 0 ? STARTING_DICE : remainingDiceCount;
    const nextRoll = rollDiceValues(count);
    setCurrentDice(nextRoll);
    setSelectedDice([]);

    if (!hasScoringDice(nextRoll)) {
      setMessage('Farkle! No scoring dice rolled. Turn score lost.');
      endPlayerTurn('Farkle occurred.');
      return;
    }

    setMessage('Select scoring dice, then bank with Score & Roll Again or Score & Pass.');
  }

  function toggleDie(index) {
    if (!isPlayerTurn || !currentDice.length) {
      return;
    }

    setSelectedDice((prev) => {
      if (prev.includes(index)) {
        return prev.filter((dieIndex) => dieIndex !== index);
      }
      return [...prev, index];
    });
  }

  function scoreSelectedDice({ passTurn }) {
    if (!selectedDice.length) {
      setMessage('Select at least one scoring die before banking points.');
      return;
    }

    const selectedValues = selectedDice.map((index) => currentDice[index]);
    const score = calculatePossibleScore(selectedValues);

    if (score <= 0) {
      setMessage('Selected dice do not form a valid scoring combo.');
      return;
    }

    const updatedTurnScore = turnScore + score;
    const updatedLocked = [...lockedDice, ...selectedValues];
    const hotDice = updatedLocked.length === STARTING_DICE;

    setPendingScore(score);
    setTurnScore(updatedTurnScore);
    setLockedDice(hotDice ? [] : updatedLocked);
    setCurrentDice([]);
    setSelectedDice([]);

    if (passTurn) {
      setPlayerScore((prev) => prev + updatedTurnScore);
      setMessage(`You banked ${updatedTurnScore} points. Bot's Turn...`);
      endPlayerTurn('You passed.');
      return;
    }

    if (hotDice) {
      setMessage(`Hot Dice! You scored all six dice. Turn score: ${updatedTurnScore}. Roll all six again.`);
      return;
    }

    setMessage(`Scored ${score}. Turn score: ${updatedTurnScore}. Roll remaining dice.`);
  }

  return (
    <main className="min-h-screen px-4 py-8 md:px-8">
      <section className="mx-auto w-full max-w-4xl rounded-2xl bg-white/90 p-6 shadow-xl ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Farkle Game</h1>
        <p className="mt-2 text-sm text-slate-600">A React-based Farkle implementation with portfolio-ready structure and gameplay logic.</p>

        <div className="mt-6 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div><strong>Player Score:</strong> {playerScore}</div>
          <div><strong>Bot Score:</strong> {botScore}</div>
          <div><strong>Turn Score:</strong> {turnScore}</div>
          <div><strong>Pending Score:</strong> {pendingScore}</div>
          <div><strong>Locked Dice:</strong> {lockedDice.length}</div>
          <div><strong>Remaining Dice:</strong> {remainingDiceCount || STARTING_DICE}</div>
          <div className="sm:col-span-2 lg:col-span-2"><strong>Turn:</strong> {isPlayerTurn ? 'Player Turn' : "Bot's Turn"}</div>
        </div>

        <p className="mt-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-900">{message}</p>

        <div className="mt-6 grid grid-cols-3 gap-3 md:gap-4">
          {diceToRender.length === 0 ? (
            <p className="col-span-3 text-center text-sm text-slate-500">Roll dice to begin.</p>
          ) : (
            diceToRender.map((die, index) => {
              const Icon = DICE_ICONS[die.value];
              const isSelected = selectedDice.includes(index);
              return (
                <button
                  key={die.id}
                  type="button"
                  onClick={() => toggleDie(index)}
                  className={`flex h-24 items-center justify-center rounded-xl border-2 transition-all md:h-28 ${
                    isSelected
                      ? 'scale-105 border-blue-500 bg-blue-100 text-blue-700 shadow-lg'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                  }`}
                  aria-label={`Die value ${die.value}`}
                >
                  <Icon size={42} />
                </button>
              );
            })
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={rollDice} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">Roll Dice</button>
          <button type="button" onClick={() => scoreSelectedDice({ passTurn: false })} className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-500">Score & Roll Again</button>
          <button type="button" onClick={() => scoreSelectedDice({ passTurn: true })} className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">Score & Pass</button>
          <button type="button" onClick={resetGame} className="rounded-lg bg-rose-600 px-4 py-2 text-white hover:bg-rose-500">Resign / Reset Game</button>
        </div>
      </section>
    </main>
  );
}

export { rollDiceValues, calculatePossibleScore, hasScoringDice };
