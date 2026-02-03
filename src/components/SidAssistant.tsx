import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

const GREETING = "Hello! How can I help you today?";
const DEFAULT_RESPONSE = "I don't know how to help you with that.";
const FRAME_ANIMATION_SPEED_MS = 200;
const TYPEWRITER_SPEED_MS = 30;

export default function SidAssistant() {
  const [isVisible, setIsVisible] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [currentFrame, setCurrentFrame] = useState(1);
  const [inputValue, setInputValue] = useState('');
  
  const typeIntervalRef = useRef<number | null>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const textToTypeRef = useRef('');
  const charIndexRef = useRef(0);

  const stopFrameAnimation = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setCurrentFrame(1);
  }, []);

  const startFrameAnimation = useCallback(() => {
    if (frameIntervalRef.current) return;
    frameIntervalRef.current = window.setInterval(() => {
      setCurrentFrame(prev => prev === 1 ? 2 : 1);
    }, FRAME_ANIMATION_SPEED_MS);
  }, []);

  const typeText = useCallback((message: string) => {
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
    }
    
    setDisplayedText('');
    textToTypeRef.current = message;
    charIndexRef.current = 0;
    
    startFrameAnimation();
    
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
    }, TYPEWRITER_SPEED_MS);
  }, [startFrameAnimation, stopFrameAnimation]);

  const showPanel = useCallback(() => {
    setIsVisible(true);
    typeText(GREETING);
  }, [typeText]);

  const hidePanel = useCallback(() => {
    setIsVisible(false);
    if (typeIntervalRef.current) {
      clearInterval(typeIntervalRef.current);
      typeIntervalRef.current = null;
    }
    stopFrameAnimation();
    setDisplayedText('');
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

  useEffect(() => {
    return () => {
      if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []);

  return (
    <div class="sid-container">
      {!isVisible && (
        <button 
          class="help-button" 
          aria-label="Open assistant"
          onClick={showPanel}
        >
          ?
        </button>
      )}
      
      {isVisible && (
        <div class="sid-panel window">
          <div class="title-bar">
            <div class="title-bar-text">SID Assistant</div>
            <div class="title-bar-controls">
              <button aria-label="Close" onClick={hidePanel}></button>
            </div>
          </div>
          <div class="window-body sid-body">
            <div class="sid-content">
              <div class="sid-character">
                <img 
                  src={`/SID - Frame ${currentFrame}.webp`}
                  alt="SID Assistant" 
                  width={100}
                  height={100}
                />
              </div>
              <div class="sid-speech">
                <div class="speech-bubble">{displayedText}</div>
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
              />
              <button onClick={handleSend}>Send</button>
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

        .help-button {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #c0c0c0;
          border: 2px outset #dfdfdf;
          font-size: 20px;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .help-button:hover {
          background: #d4d4d4;
        }

        .help-button:active {
          border-style: inset;
        }

        .sid-panel {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 320px;
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
