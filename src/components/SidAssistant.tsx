import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import Fuse from 'fuse.js';
import Typed from 'typed.js';
import { navigate } from 'astro:transitions/client';
import styles from './SidAssistant.module.css';

const GREETING = "Hello! How can I help you today? Type <code>/help</code> for available commands.";
const DEFAULT_RESPONSE = "I don't know how to help you with that. Type <code>/help</code> for available commands.";
const FRAME_ANIMATION_SPEED_MS = 200;
const TYPEWRITER_SPEED_MS = 10;
const ICON_SIZE = 100;

const HORROR_TYPEWRITER_SPEED_MS = 1;
const HORROR_DURATION_MS = 2000;
const HORROR_CHANCE = .1;

const HELP_TEXT = `Available commands:
<code>/help</code> - Show this help message
<code>/search &lt;query&gt;</code> - Search all content (employees, anomalies, organizations)
<code>/goto &lt;id&gt;</code> - Navigate directly to an article by ID (e.g., <code>/goto EID-EMP-001</code>)`;

interface SearchResult {
  id: string;
  title: string;
  url: string;
  type: 'employee' | 'anomaly' | 'organization';
  content: string;
}

interface SidAssistantProps {
  frames: string[];
  horrorFrames: string[];
  helpIcon: string;
  searchContent: SearchResult[];
}
const HORROR_TEXT = `Ḯ̵̧̳̯͔͇̦̪̰̳̖͎̞̍͛̑͐̈́͘͝͝ ̷̡̳̬̹̝͖̹̗̻̬̟̣̱̮̓ẅ̶̢̨̛̠̼̬̖͇̫̺̲̩̣͔Í̶̢̩̘̯͙̖̳̈̇͑̃͑̑̅̒̈̇͌̕͘͝L̵̮̺̖̜̣̗̻̟͕̖̘͍̋̎̽͂́̃̆̏́̈́͐͜͠͝L̷̡̡̨̛̹̺̬͇̞̦̈̏̒̓̌́̀̔͋̑̕ ̶̢̳͙̯̤̜̗͕̐̏́̚Ñ̸̹͔̘̫̠̗̼̞̩͚̦̩͔̔̈́̉̇͆̀͐́̕̕͜Ö̴̡͓̭̱̲̩̫̫̘͕̱́͋̌̈́̈̾T̸̤̻̮̱̙̰̭̬̼̘̲̺̼̝̄̆͐̇̃͘ ̸̧̨̬͚͇̩̖̩͖͇̫̣͛̑̔̌̆͋̈̆̍̎̓͘̕͠B̵̨̙̳̻̞̜̫͉̜̝̬̝̳͚̌̏͛̀̎͑͑̀̂̑́͗̚̚E̷̡̡̦̭͔̪̺̥͚͍̯̼̗̐̈͛͆ͅ ̶͇̥̬̰̝͙͔̪̈́͐̈̿̀͊́̓̊̅͗̽͐̕͠C̷̤̹̼̮̰̩̰̫̣̜͊̏ͅO̸͓̪̰̞̞̙̣̬͇̠̤̎̌N̷͖̂̔̏̔͋͆̚͝T̷̢̰̟̦͇̭̰͔̜͍͓̱͍͖̅̓̂̐̊̈̀̅̏͌̓͠A̴͓͓̙͔̽̌̈́̾Ỉ̴̛̼̝̫͖̩̤͕̲̃̊̄̉̽̀̿͆̐̚͝N̶͚̞͚͚̫̳̲͉̠͇̦̣̲̼̱̉̄̇̃͋͗͐̔E̴̟͕̔̈́͗͋͐͑͆͂̕͘͘ͅD̷͈͓͉͌̎́̆̅͋̂̑̽́̃̚͝͝`;



export default function SidAssistant({ frames, horrorFrames, helpIcon, searchContent }: SidAssistantProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHorrorMode, setIsHorrorMode] = useState(false);
  const [searchIndex, setSearchIndex] = useState<Fuse<SearchResult> | null>(null);
  
  const typedInstanceRef = useRef<Typed | null>(null);
  const speechBubbleRef = useRef<HTMLDivElement>(null);
  const frameIntervalRef = useRef<number | null>(null);
  const horrorTimeoutRef = useRef<number | null>(null);
  const horrorShownRef = useRef(false);
  const pendingMessageRef = useRef<{ message: string; speed: number; useHorror: boolean } | null>(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const searchContentRef = useRef<SearchResult[]>(searchContent);

  // Update searchContentRef when prop changes
  useEffect(() => {
    searchContentRef.current = searchContent;
  }, [searchContent]);

  // Initialize search index on mount
  useEffect(() => {
    if (searchContent && !searchIndex) {
      const fuse = new Fuse(searchContent, {
        keys: [
          { name: 'title', weight: 2 },     // Higher weight for title matches
          { name: 'content', weight: 1 }    // Lower weight for content matches
        ],
        threshold: 0.3,  // Balanced threshold for fuzzy matching
        includeScore: true,
        ignoreLocation: true,  // Search entire text, not just beginning
        minMatchCharLength: 3,  // Minimum match length
      });
      setSearchIndex(fuse);
    }
  }, [searchContent]);

  const stopFrameAnimation = useCallback(() => {
    if (frameIntervalRef.current) {
      clearInterval(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    setFrameIndex(0);
  }, []);

  const getCurrentFrame = () => {
    const frameSet = isHorrorMode ? horrorFrames : frames;
    return frameSet[frameIndex % frameSet.length];
  };

  const startFrameAnimation = useCallback((useHorror = false) => {
    if (frameIntervalRef.current) return;
    const animFrames = useHorror ? horrorFrames : frames;
    frameIntervalRef.current = window.setInterval(() => {
      setFrameIndex(prev => (prev + 1) % animFrames.length);
    }, FRAME_ANIMATION_SPEED_MS);
  }, [frames, horrorFrames]);

  const typeText = useCallback((message: string, speed = TYPEWRITER_SPEED_MS, useHorror = false) => {
    if (typedInstanceRef.current) {
      typedInstanceRef.current.destroy();
      typedInstanceRef.current = null;
    }
    
    if (!speechBubbleRef.current) {
      pendingMessageRef.current = { message, speed, useHorror };
      return;
    }
    
    pendingMessageRef.current = null;
    speechBubbleRef.current.innerHTML = '';
    
    typedInstanceRef.current = new Typed(speechBubbleRef.current, {
      strings: [message.replace(/\n/g, '<br>')],
      typeSpeed: speed,
      showCursor: false,
      contentType: 'html',
      onBegin: () => {
        startFrameAnimation(useHorror);
      },
      onComplete: () => {
        stopFrameAnimation();
      },
    });
  }, [startFrameAnimation, stopFrameAnimation]);

  const endHorrorMode = useCallback(() => {
    setIsHorrorMode(false);
    stopFrameAnimation();
    typeText(GREETING);
  }, [stopFrameAnimation, typeText]);

  const handleHelpCommand = useCallback(() => {
    typeText(HELP_TEXT);
  }, [typeText]);

  const handleFhtagnCommand = useCallback(() => {
    setIsHorrorMode(true);
    typeText(HORROR_TEXT, HORROR_TYPEWRITER_SPEED_MS, true);
    horrorTimeoutRef.current = window.setTimeout(endHorrorMode, HORROR_DURATION_MS);
  }, [typeText, endHorrorMode]);

  const handleGotoCommand = useCallback((args: string) => {
    const id = args.trim().toUpperCase();
    
    if (!id) {
      typeText("Please provide an ID. Example: <code>/goto EID-EMP-001</code>");
      return;
    }
    
    const item = searchContentRef.current.find(item => item.id.toUpperCase() === id);
    
    if (!item) {
      typeText(`No article found with ID "${id}"`);
      return;
    }
    
    navigate(item.url);
  }, [typeText]);

  const handleSearchCommand = useCallback((args: string) => {
    const query = args.trim();
    
    if (!query) {
      typeText("Please provide a search query. Example: <code>/search harrow</code>");
      return;
    }
    
    if (!searchIndex) {
      typeText("Search index not available. Please refresh the page.");
      return;
    }
    
    const results = searchIndex.search(query).slice(0, 5);
    
    if (results.length === 0) {
      typeText(`No results found for "${query}"`);
      return;
    }
    
    let responseText = `Found ${results.length} result(s) for "${query}":\n\n`;
    results.forEach((result, index) => {
      const item = result.item;
      responseText += `${index + 1}. [<a href="${item.url}" data-tooltip="${item.title}">${item.id}</a>]\n`;
    });
    
    typeText(responseText);
  }, [searchIndex, typeText]);

  const handleCommand = useCallback((command: string) => {
    const trimmedCommand = command.trim();
    
    if (trimmedCommand === '/help') {
      handleHelpCommand();
    } else if (trimmedCommand === '/fhtagn') {
      handleFhtagnCommand();
    } else if (trimmedCommand.startsWith('/goto ')) {
      handleGotoCommand(trimmedCommand.replace('/goto ', ''));
    } else if (trimmedCommand.startsWith('/search ')) {
      handleSearchCommand(trimmedCommand.replace('/search ', ''));
    } else {
      typeText(DEFAULT_RESPONSE);
    }
  }, [handleHelpCommand, handleFhtagnCommand, handleGotoCommand, handleSearchCommand, typeText]);


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

  // Type pending message once speech bubble is available
  useEffect(() => {
    if (isVisible && speechBubbleRef.current && pendingMessageRef.current) {
      const { message, speed, useHorror } = pendingMessageRef.current;
      typeText(message, speed, useHorror);
    }
  }, [isVisible, typeText]);

  const hidePanel = useCallback(() => {
    setIsVisible(false);
    if (typedInstanceRef.current) {
      typedInstanceRef.current.destroy();
      typedInstanceRef.current = null;
    }
    if (horrorTimeoutRef.current) {
      clearTimeout(horrorTimeoutRef.current);
      horrorTimeoutRef.current = null;
    }
    stopFrameAnimation();
    setIsHorrorMode(false);
  }, [stopFrameAnimation]);

  const handleSend = useCallback(() => {
    const message = inputValue.trim();
    if (!message) return;
    
    setInputValue('');
    handleCommand(message);
  }, [inputValue, handleCommand]);

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
      if (typedInstanceRef.current) typedInstanceRef.current.destroy();
      if (frameIntervalRef.current) clearInterval(frameIntervalRef.current);
    };
  }, []);

  return (
    <div class={styles.container}>
      {!isVisible && (
        <img 
          class={styles.helpIcon} 
          src={helpIcon} 
          alt="Help" 
          width={ICON_SIZE} 
          height={ICON_SIZE}
          onClick={showPanel}
          draggable={false}
        />
      )}
      
      {isVisible && (
        <div 
          class={`${styles.panel} window`}
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
          <div class={`window-body ${styles.body}`}>
            <div class={styles.content}>
              <div class={styles.character}>
                <img 
                  src={getCurrentFrame()}
                  alt="SID Assistant" 
                  width={100}
                  height={100}
                  draggable={false}
                />
              </div>
              <div class={styles.speech}>
                <div ref={speechBubbleRef} class={`${styles.speechBubble} ${isHorrorMode ? styles.horror : ''}`}></div>
              </div>
            </div>
            <div class={styles.inputArea}>
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
    </div>
  );
}
