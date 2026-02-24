import { useState } from 'react';
import styles from './DiceRoller.module.css';

export default function DiceRoller({ initialDie = 'd20' }: { initialDie?: string }) {
  const [result, setResult] = useState<number | null>(null);

  const roll = () => {
    const max = parseInt(initialDie.substring(1));
    setResult(Math.floor(Math.random() * max) + 1);
  };

  return (
    <button
      onClick={roll}
      className={styles.diceButton}
      title={`Roll ${initialDie}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        className={styles.diceIcon}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="3" />
        <circle cx="8" cy="8" r="1.5" className={styles.dieDot} />
        <circle cx="16" cy="8" r="1.5" className={styles.dieDot} />
        <circle cx="12" cy="12" r="1.5" className={styles.dieDot} />
        <circle cx="8" cy="16" r="1.5" className={styles.dieDot} />
        <circle cx="16" cy="16" r="1.5" className={styles.dieDot} />
      </svg>
      <span>{initialDie}</span>
      {result !== null && <span>: {result}</span> || <span>: _</span>}
    </button>
  );
}