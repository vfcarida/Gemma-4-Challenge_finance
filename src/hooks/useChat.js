import { useState, useCallback, useRef, useEffect } from 'react';
import { StorageService } from '../services/StorageService';
import { SmartEngine, HISTORICAL_DATA } from '../services/SmartEngine';

const DEMO_STATES = {
  IDLE_AFTER_WELCOME: 'IDLE_AFTER_WELCOME',
  AUDIO_INPUT: 'AUDIO_INPUT',
  AUDIO_THINKING: 'AUDIO_THINKING',
  IDLE_AFTER_AUDIO: 'IDLE_AFTER_AUDIO',
  IMAGE_INPUT: 'IMAGE_INPUT',
  IMAGE_THINKING: 'IMAGE_THINKING',
  INTERACTIVE: 'INTERACTIVE',
};

function timestamp() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

const welcomeMessage = {
  id: 'welcome',
  type: 'bot',
  content: 'Hello! I am GemmaFin, your intelligent financial assistant. 👋\n\nHow can I help with your finances today? You can send audio, a photo of a receipt, or type any question about your finances.',
  timestamp: timestamp(),
  icon: 'bot',
  suggestedReplies: ['🎤 Send audio', '📎 Send image', '❓ What do you do?'],
};

export function useChat() {
  // Use resilient storage service
  const initialState = StorageService.loadState();

  const [messages, setMessages] = useState(initialState?.messages || [welcomeMessage]);
  const [balance, setBalance] = useState(initialState?.balance || 0);
  const [demoPhase, setDemoPhase] = useState(initialState?.demoPhase || DEMO_STATES.IDLE_AFTER_WELCOME);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [expenses, setExpenses] = useState(initialState?.expenses || []);
  const [income, setIncome] = useState(initialState?.income || []);

  const scrollRef = useRef(null);

  // Persistence effect
  useEffect(() => {
    StorageService.saveState({ messages, balance, demoPhase, expenses, income });
  }, [messages, balance, demoPhase, expenses, income]);

  // Scroll to bottom helper
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }
    }, 100);
  }, []);

  // Add message helper
  const addMessage = useCallback((msg) => {
    setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random(), timestamp: timestamp() }]);
    scrollToBottom();
  }, [scrollToBottom]);

  // ── Audio Input Simulation ──
  const handleAudioInput = useCallback(() => {
    if (demoPhase !== DEMO_STATES.IDLE_AFTER_WELCOME) return;
    setDemoPhase(DEMO_STATES.AUDIO_INPUT);
    setIsRecording(true);

    setTimeout(() => {
      setIsRecording(false);
      addMessage({
        type: 'user',
        content: 'I did some electrical work today, it took about 3 hours and I charged 200 reais on Pix. But then I went to the hairdresser and spent 50 reais, didn\'t get a receipt.',
        icon: 'audio',
      });
      setDemoPhase(DEMO_STATES.AUDIO_THINKING);

      setTimeout(() => {
        setIsThinking(true);
        const steps = [
          { icon: '📥', text: 'Input Analysis: Audio detected.' },
          { icon: '🗣️', text: 'Transcription via Speech-to-Text completed.' },
          { icon: '💰', text: 'Extracting income: R$ 200.00 (Category: Informal Services/Side Job)' },
          { icon: '💸', text: 'Extracting expense: R$ 50.00 (Category: Personal Care/Beauty)' },
          { icon: '🔢', text: 'Calculation: +200 - 50 = 150' },
          { icon: '⚡', text: 'Action: Execute update_ledger() function' },
        ];
        steps.forEach((step, i) => {
          setTimeout(() => { setThinkingSteps((prev) => [...prev, step]); scrollToBottom(); }, (i + 1) * 700);
        });

        setTimeout(() => {
          setIsThinking(false);
          setThinkingSteps([]);
          setBalance(150);
          setIncome((prev) => [...prev, { category: 'Informal Services', value: 200 }]);
          setExpenses((prev) => [...prev, { category: 'Beauty', value: 50 }]);

          addMessage({
            type: 'bot',
            content: 'All noted! ✅\n\nI recorded your income of **R$ 200.00** (Services) and the expense of **R$ 50.00** (Beauty).\n\nYour updated balance is **R$ 150.00**.',
            icon: 'bot',
            suggestedReplies: ['📎 Send statement', '📊 View summary', '💡 Saving tips'],
          });

          setTimeout(() => {
            addMessage({ type: 'bot', content: '__MINI_REPORT__', icon: 'chart' });
            setDemoPhase(DEMO_STATES.IDLE_AFTER_AUDIO);
            scrollToBottom();
          }, 1200);
        }, steps.length * 700 + 1000);
      }, 800);
    }, 1500);
  }, [demoPhase, addMessage, scrollToBottom]);

  // ── Image Input Simulation ──
  const handleImageInput = useCallback(() => {
    if (demoPhase !== DEMO_STATES.IDLE_AFTER_AUDIO) return;
    setDemoPhase(DEMO_STATES.IMAGE_INPUT);

    addMessage({ type: 'user', content: '__BANK_STATEMENT_IMAGE__', icon: 'image' });

    setTimeout(() => {
      setDemoPhase(DEMO_STATES.IMAGE_THINKING);
      setIsThinking(true);
      const steps = [
        { icon: '📷', text: 'Input Analysis: Image detected.' },
        { icon: '🔍', text: 'Processing Vision OCR on bank statement...' },
        { icon: '💸', text: 'Extracting expense: R$ 80.00 (Category: Groceries/Food)' },
        { icon: '📈', text: 'Checking history: Groceries Apr R$72 → May R$80 (+11%)' },
        { icon: '🔢', text: 'Calculation: 150 - 80 = 70' },
        { icon: '⚡', text: 'Action: Execute update_ledger() function' },
        { icon: '💡', text: 'Generating personalized saving tip...' },
      ];
      steps.forEach((step, i) => {
        setTimeout(() => { setThinkingSteps((prev) => [...prev, step]); scrollToBottom(); }, (i + 1) * 600);
      });

      setTimeout(() => {
        setIsThinking(false);
        setThinkingSteps([]);
        setBalance(70);
        setExpenses((prev) => [...prev, { category: 'Mercado', value: 80 }]);

        addMessage({
          type: 'bot',
          content: 'I read your bank statement. 📄\n\nI identified an expense of **R$ 80.00** at the Supermarket. Your new balance is **R$ 70.00**.\n\n📈 **Comparison:** Last month you spent **R$ 72.00** on groceries. This month it\'s already **R$ 80.00** — an increase of **11%**.\n\n💡 **Tip:** I noticed your grocery expenses increased. Do you want me to remind you to research cheaper brands next time?',
          icon: 'bot',
          suggestedReplies: ['🛒 Grocery details', '📊 View monthly summary', '💡 Saving tips', '🎯 Set goal'],
        });

        setDemoPhase(DEMO_STATES.INTERACTIVE);
      }, steps.length * 600 + 800);
    }, 800);
  }, [demoPhase, addMessage, scrollToBottom]);

  // ── Smart text input handling ──
  const handleTextInput = useCallback((text) => {
    if (!text.trim()) return;

    addMessage({ type: 'user', content: text, icon: 'text' });

    // Handle initial state guide
    if (demoPhase === DEMO_STATES.IDLE_AFTER_WELCOME) {
      setTimeout(() => {
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
          setIsTyping(false);
          addMessage({
            type: 'bot',
            content: 'To start, send me an **audio** 🎤 telling me about your income and expenses for the day! Then we can talk about everything.',
            icon: 'bot',
            suggestedReplies: ['🎤 Send audio', '❓ What do you do?'],
          });
        }, 1200);
      }, 500);
      return;
    }

    // Handle mid-demo state guide
    if (demoPhase === DEMO_STATES.IDLE_AFTER_AUDIO) {
      setTimeout(() => {
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
          setIsTyping(false);
          addMessage({
            type: 'bot',
            content: 'Good question! But first, how about sending a **photo of your statement** 📎 so I can have more data? Then I will answer everything!',
            icon: 'bot',
            suggestedReplies: ['📎 Send statement'],
          });
        }, 1200);
      }, 500);
      return;
    }

    // Interactive mode — process via smart engine
    const smart = SmartEngine.processInput(text, { income, expenses });

    if (smart.skipThinking) {
      setTimeout(() => {
        setIsTyping(true);
        scrollToBottom();
        setTimeout(() => {
          setIsTyping(false);
          addMessage({
            type: 'bot',
            content: smart.response,
            icon: 'bot',
            suggestedReplies: smart.replies,
          });
        }, 800);
      }, 400);
      return;
    }

    // Process with thinking animation
    setTimeout(() => {
      if (smart.thinkSteps.length > 0) {
        setIsThinking(true);
        smart.thinkSteps.forEach((step, i) => {
          setTimeout(() => { setThinkingSteps((prev) => [...prev, step]); scrollToBottom(); }, (i + 1) * 500);
        });

        setTimeout(() => {
          setIsThinking(false);
          setThinkingSteps([]);

          setIsTyping(true);
          scrollToBottom();

          setTimeout(() => {
            setIsTyping(false);
            addMessage({
              type: 'bot',
              content: smart.response,
              icon: 'bot',
              suggestedReplies: smart.replies,
            });

            if (smart.specialContent) {
              setTimeout(() => {
                addMessage({
                  type: 'bot',
                  content: JSON.stringify(smart.specialContent),
                  icon: 'special',
                  _special: smart.specialContent,
                });
                scrollToBottom();
              }, 600);
            }
          }, 800);
        }, smart.thinkSteps.length * 500 + 600);
      }
    }, 500);
  }, [demoPhase, addMessage, scrollToBottom, income, expenses]);

  // ── Unified Quick Reply Handler ──
  const handleQuickReply = useCallback((text) => {
    // English translation matching the translations implemented above
    if (text === '🎤 Send audio' || text === '🎤 Enviar áudio') {
      handleAudioInput();
    } else if (text === '📎 Send image' || text === '📎 Send statement' || text === '📎 Enviar imagem' || text === '📎 Enviar extrato') {
      handleImageInput();
    } else {
      handleTextInput(text);
    }
  }, [handleAudioInput, handleImageInput, handleTextInput]);

  // ── State Reset ──
  const resetChat = useCallback(() => {
    setMessages([{ ...welcomeMessage, timestamp: timestamp() }]);
    setBalance(0);
    setDemoPhase(DEMO_STATES.IDLE_AFTER_WELCOME);
    setIsThinking(false);
    setThinkingSteps([]);
    setIsRecording(false);
    setIsTyping(false);
    setExpenses([]);
    setIncome([]);
    StorageService.clearState();
  }, []);

  return {
    messages, balance, demoPhase, isThinking, thinkingSteps, isRecording, isTyping,
    expenses, income, scrollRef,
    handleAudioInput, handleImageInput, handleTextInput, handleQuickReply, resetChat,
    canRecordAudio: demoPhase === DEMO_STATES.IDLE_AFTER_WELCOME,
    canUploadImage: demoPhase === DEMO_STATES.IDLE_AFTER_AUDIO,
    isInteractive: demoPhase === DEMO_STATES.INTERACTIVE,
    historicalData: HISTORICAL_DATA,
  };
}
