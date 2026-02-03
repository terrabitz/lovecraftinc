import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

const GREETING = "Hello! How can I help you today?";
const DEFAULT_RESPONSE = "I don't know how to help you with that.";
const FRAME_ANIMATION_SPEED_MS = 200;
const TYPEWRITER_SPEED_MS = 30;
const ICON_SIZE = 100;

const FRAMES = [
  '/SID - Frame 1.webp',
  '/SID - Frame 2.webp',
];


const HORROR_TYPEWRITER_SPEED_MS = 1;
const HORROR_DURATION_MS = 2000;
const HORROR_CHANCE = .1;
const HORROR_FRAMES = [
  '/SID - Horror 1.webp',
  '/SID - Horror 2.webp',
];
const HORROR_TEXT = `Ḯ̵̧̳̯͔͇̦̪̰̳̖͎̞̍͛̑͐̈́͘͝͝ ̷̡̳̬̹̝͖̹̗̻̬̟̣̱̮̓ẅ̶̢̨̛̠̼̬̖͇̫̺̲̩̣͔Í̶̢̩̘̯͙̖̳̈̇͑̃͑̑̅̒̈̇͌̕͘͝L̵̮̺̖̜̣̗̻̟͕̖̘͍̋̎̽͂́̃̆̏́̈́͐͜͠͝L̷̡̡̨̛̹̺̬͇̞̦̈̏̒̓̌́̀̔͋̑̕ ̶̢̳͙̯̤̜̗͕̐̏́̚Ñ̸̹͔̘̫̠̗̼̞̩͚̦̩͔̔̈́̉̇͆̀͐́̕̕͜Ö̴̡͓̭̱̲̩̫̫̘͕̱́͋̌̈́̈̾T̸̤̻̮̱̙̰̭̬̼̘̲̺̼̝̄̆͐̇̃͘ ̸̧̨̬͚͇̩̖̩͖͇̫̣͛̑̔̌̆͋̈̆̍̎̓͘̕͠B̵̨̙̳̻̞̜̫͉̜̝̬̝̳͚̌̏͛̀̎͑͑̀̂̑́͗̚̚E̷̡̡̦̭͔̪̺̥͚͍̯̼̗̐̈͛͆ͅ ̶͇̥̬̰̝͙͔̪̈́͐̈̿̀͊́̓̊̅͗̽͐̕͠C̷̤̹̼̮̰̩̰̫̣̜͊̏ͅO̸͓̪̰̞̞̙̣̬͇̠̤̎̌N̷͖̂̔̏̔͋͆̚͝T̷̢̰̟̦͇̭̰͔̜͍͓̱͍͖̅̓̂̐̊̈̀̅̏͌̓͠A̴͓͓̙͔̽̌̈́̾Ỉ̴̛̼̝̫͖̩̤͕̲̃̊̄̉̽̀̿͆̐̚͝N̶͚̞͚͚̫̳̲͉̠͇̦̣̲̼̱̉̄̇̃͋͗͐̔E̴̟͕̔̈́͗͋͐͑͆͂̕͘͘ͅD̷͈͓͉͌̎́̆̅͋̂̑̽́̃̚͝͝`;



export default function SidAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [frameIndex, setFrameIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHorrorMode, setIsHorrorMode] = useState(false);
  
  const typeIntervalRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const horrorTimeoutRef = useRef<number | null>(null);
  const horrorShownRef = useRef(false);
  const textToTypeRef = useRef('');
  const charIndexRef = useRef(0);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const stopFrameAnimation = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setFrameIndex(0);
  }, []);

  const startFrameAnimation = useCallback((useHorror = false) => {
    if (frameIntervalRef.current) return;
    const frames = useHorror ? HORROR_FRAMES : FRAMES;
    frameIntervalRef.current = window.setInterval(() => {
      setFrameIndex(prev => (prev + 1) % frames.length);
    }, FRAME_ANIMATION_SPEED_MS);
  }, []);

  const typeText = useCallback((message: string, speed = TYPEWRITER_SPEED_MS, useHorror = false) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
    }
    
    setDisplayedText('');
    textToTypeRef.current = message;
    charIndexRef.current = 0;
    
    startFrameAnimation(useHorror);
    
    typeIntervalRef.current = window.setInterval(() => {
      if (charIndexRef.current < textToTypeRef.current.length) {
        setDisplayedText(textToTypeRef.current.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
      } else {
        if (typeIntervalRef.current) {
          clearInterval(typeIntervalRef.current);
          typeIntervalRef.current = null;
        }
        stopFrameAnimation();
      }
    }, speed);
  }, [startFrameAnimation, stopFrameAnimation]);

  const endHorrorMode = useCallback(() => {
    setIsHorrorMode(false);
    stopFrameAnimation();
    typeText(GREETING);
  }, [stopFrameAnimation, typeText]);

  const showPanel = useCallback(() => {
    setIsVisible(true);
    
    if (!horrorShownRef.current && Math.random() < HORROR_CHANCE) {
      horrorShownRef.current = true;
      setIsHorrorMode(true);
      typeText(HORROR_TEXT, HORROR_TYPEWRITER_SPEED_MS, true);
      horrorTimeoutRef.current = window.setTimeout(endHorrorMode, HORROR_DURATION_MS);
    } else {
      typeText(GREETING);
    }
  }, [typeText, endHorrorMode]);

  const hidePanel = useCallback(() => {
    setIsVisible(false);
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    if (horrorTimeoutRef.current) {
      clearTimeout(horrorTimeoutRef.current);
      horrorTimeoutRef.current = null;
    }
    stopFrameAnimation();
    setDisplayedText('');
    setIsHorrorMode(false);
  }, [stopFrameAnimation]);

  const handleSend = useCallback(() => {
    const message = inputValue.trim();
    if (!message) return;
    
    setInputValue('');
    typeText(DEFAULT_RESPONSE);
  }, [inputValue, typeText]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  }, [handleSend]);

  const handleDragStart = useCallback((e: MouseEvent) => {
    isDraggingRef.current = true;
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    e.preventDefault();
  }, [position]);

  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []);

  return (
    <div class="sid-container">
      {!isVisible && (
        <img 
          class="help-icon" 
          src="/windows_95_icons_help_book_large.webp" 
          alt="Help" 
          width={ICON_SIZE} 
          height={ICON_SIZE}
          onClick={showPanel}
          draggable={false}
        />
      )}
      
      {isVisible && (
        <div 
          class="sid-panel window"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div class="title-bar" onMouseDown={handleDragStart}>
            <div class="title-bar-text">SID Assistant</div>
            <div class="title-bar-controls">
              <button aria-label="Close" onClick={hidePanel}></button>
            </div>
          </div>
          <div class="window-body sid-body">
            <div class="sid-content">
              <div class="sid-character">
                <img 
                  src={isHorrorMode ? HORROR_FRAMES[frameIndex % HORROR_FRAMES.length] : FRAMES[frameIndex % FRAMES.length]}
                  alt="SID Assistant" 
                  width={100}
                  height={100}
                  draggable={false}
                />
              </div>
              <div class="sid-speech">
                <div class={`speech-bubble ${isHorrorMode ? 'horror' : ''}`}>{displayedText}</div>
              </div>
            </div>
            <div class="sid-input-area">
              <input 
                type="text" 
                placeholder="Type a message..."
                autocomplete="off"
                value={inputValue}
                onInput={(e) => setInputValue((e.target as HTMLInputElement).value)}
                onKeyDown={handleKeyDown}
                disabled={isHorrorMode}
              />
              <button onClick={handleSend} disabled={isHorrorMode || !inputValue.trim()}>Send</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sid-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
          font-family: var(--font-family, 'MS Sans Serif', sans-serif);
        }

        .help-icon {
          cursor: pointer;
          image-rendering: pixelated;
        }

        .help-icon:hover {
          transform: scale(1.1);
        }

        .help-icon:active {
          transform: scale(0.95);
        }

        .sid-panel {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 320px;
        }

        .sid-panel .title-bar {
          cursor: move;
          user-select: none;
        }

        .sid-body {
          padding: 8px;
        }

        .sid-content {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sid-character {
          flex-shrink: 0;
        }

        .sid-character img {
          width: 100px;
          height: 100px;
          object-fit: contain;
          image-rendering: pixelated;
        }

        .sid-speech {
          flex-grow: 1;
          display: flex;
          align-items: flex-start;
        }

        .speech-bubble {
          background: #ffffe1;
          border: 1px solid #000;
          padding: 8px 10px;
          position: relative;
          width: 180px;
          height: 80px;
          overflow-y: auto;
          font-size: 12px;
          line-height: 1.4;
          box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff;
        }

        .speech-bubble.horror {
          background: #1a0a0a;
          color: #ff0000;
          overflow: visible;
          height: auto;
          min-height: 80px;
          max-height: none;
          word-break: break-all;
          text-shadow: 0 0 10px #ff0000;
          animation: horror-flicker 0.1s infinite;
        }

        @keyframes horror-flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        .speech-bubble::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 12px;
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 10px solid #000;
        }

        .speech-bubble::after {
          content: '';
          position: absolute;
          left: -8px;
          top: 13px;
          width: 0;
          height: 0;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          border-right: 9px solid #ffffe1;
        }

        .sid-input-area {
          display: flex;
          gap: 4px;
        }

        .sid-input-area input {
          flex-grow: 1;
          padding: 4px;
          font-size: 12px;
          font-family: inherit;
        }

        .sid-input-area button {
          padding: 4px 12px;
          font-size: 12px;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
