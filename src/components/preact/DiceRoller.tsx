import { useState, useRef, useCallback } from 'preact/hooks';
import styles from './DiceRoller.module.css';

export default function DiceRoller({ initialDie = 'd20' }: { initialDie?: string }) {
  const [display, setDisplay] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const animationRef = useRef<number | null>(null);

  const roll = useCallback(() => {
    if (rolling) return;

    const max = parseInt(initialDie.substring(1));
    const finalResult = Math.floor(Math.random() * max) + 1;
    const duration = 500;
    const start = performance.now();

    setRolling(true);

    const animate = (now: number) => {
      const elapsed = now - start;
      if (elapsed < duration) {
        setDisplay(Math.floor(Math.random() * max) + 1);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(finalResult);
        setRolling(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [rolling, initialDie]);

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
      {display !== null ? <span className={rolling ? styles.rolling : ''}>: {display}</span> : <span>: _</span>}
    </button>
  );
}