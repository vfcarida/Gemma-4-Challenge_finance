import { useState, useCallback, useRef, useEffect } from 'react';

// ── Constants ──
const STORAGE_KEY = 'gemafin_state';

const DEMO_STATES = {
  WELCOME: 'WELCOME',
  IDLE_AFTER_WELCOME: 'IDLE_AFTER_WELCOME',
  AUDIO_INPUT: 'AUDIO_INPUT',
  AUDIO_THINKING: 'AUDIO_THINKING',
  AUDIO_RESPONSE: 'AUDIO_RESPONSE',
  MINI_REPORT: 'MINI_REPORT',
  IDLE_AFTER_AUDIO: 'IDLE_AFTER_AUDIO',
  IMAGE_INPUT: 'IMAGE_INPUT',
  IMAGE_THINKING: 'IMAGE_THINKING',
  IMAGE_RESPONSE: 'IMAGE_RESPONSE',
  COMPLETE: 'COMPLETE',
};

// ── Helper: generate timestamp ──
function timestamp() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── Helper: format currency ──
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// ── Load state from LocalStorage ──
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

// ── Save state to LocalStorage ──
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

// ── Initial welcome message ──
const welcomeMessage = {
  id: 'welcome',
  type: 'bot',
  content:
    'Olá! Sou o GemaFin, seu assistente financeiro inteligente. 👋\n\nComo posso ajudar com suas finanças hoje? Pode mandar áudio, foto de recibo ou print de extrato.',
  timestamp: timestamp(),
  icon: 'bot',
};

// ── Hook ──
export function useChat() {
  const initialState = loadState();

  const [messages, setMessages] = useState(
    initialState?.messages || [welcomeMessage]
  );
  const [balance, setBalance] = useState(initialState?.balance || 0);
  const [demoPhase, setDemoPhase] = useState(
    initialState?.demoPhase || DEMO_STATES.IDLE_AFTER_WELCOME
  );
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [expenses, setExpenses] = useState(initialState?.expenses || []);
  const [income, setIncome] = useState(initialState?.income || []);

  const scrollRef = useRef(null);

  // ── Persist on changes ──
  useEffect(() => {
    saveState({ messages, balance, demoPhase, expenses, income });
  }, [messages, balance, demoPhase, expenses, income]);

  // ── Auto-scroll ──
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }
    }, 100);
  }, []);

  // ── Add message helper ──
  const addMessage = useCallback(
    (msg) => {
      setMessages((prev) => [...prev, { ...msg, id: Date.now() + Math.random(), timestamp: timestamp() }]);
      scrollToBottom();
    },
    [scrollToBottom]
  );

  // ── Audio Input Demo ──
  const handleAudioInput = useCallback(() => {
    if (demoPhase !== DEMO_STATES.IDLE_AFTER_WELCOME) return;

    setDemoPhase(DEMO_STATES.AUDIO_INPUT);
    setIsRecording(true);

    // Simulate recording for 1.5s
    setTimeout(() => {
      setIsRecording(false);

      // User audio message
      addMessage({
        type: 'user',
        content:
          'Fiz um bico de elétrica hoje, demorou umas 3 horas e cobrei 200 reais no Pix. Mas depois passei no cabeleireiro e gastei 50 reais, não peguei nota.',
        icon: 'audio',
      });

      setDemoPhase(DEMO_STATES.AUDIO_THINKING);

      // Start thinking after a brief pause
      setTimeout(() => {
        setIsThinking(true);

        const steps = [
          { icon: '📥', text: 'Análise de entrada: Áudio detectado.' },
          { icon: '🗣️', text: 'Transcrição via Speech-to-Text concluída.' },
          {
            icon: '💰',
            text: 'Extraindo receita: R$ 200,00 (Categoria: Serviços Informais/Bico)',
          },
          {
            icon: '💸',
            text: 'Extraindo despesa: R$ 50,00 (Categoria: Cuidados Pessoais/Beleza)',
          },
          { icon: '🔢', text: 'Cálculo: +200 - 50 = 150' },
          { icon: '⚡', text: 'Ação: Executar função update_ledger()' },
        ];

        // Reveal steps one by one
        steps.forEach((step, i) => {
          setTimeout(() => {
            setThinkingSteps((prev) => [...prev, step]);
            scrollToBottom();
          }, (i + 1) * 700);
        });

        // After all steps, show response
        setTimeout(
          () => {
            setIsThinking(false);
            setThinkingSteps([]);
            setDemoPhase(DEMO_STATES.AUDIO_RESPONSE);

            // Update balance
            setBalance(150);
            setIncome((prev) => [
              ...prev,
              { category: 'Serviços Informais', value: 200 },
            ]);
            setExpenses((prev) => [
              ...prev,
              { category: 'Beleza', value: 50 },
            ]);

            // Bot response
            addMessage({
              type: 'bot',
              content:
                'Tudo anotado! ✅\n\nRegistrei sua entrada de **R$ 200,00** (Serviços) e a saída de **R$ 50,00** (Beleza).\n\nSeu saldo atualizado é **R$ 150,00**.',
              icon: 'bot',
            });

            // Show mini report after a delay
            setTimeout(() => {
              addMessage({
                type: 'bot',
                content: '__MINI_REPORT__',
                icon: 'chart',
              });
              setDemoPhase(DEMO_STATES.IDLE_AFTER_AUDIO);
              scrollToBottom();
            }, 1200);
          },
          steps.length * 700 + 1000
        );
      }, 800);
    }, 1500);
  }, [demoPhase, addMessage, scrollToBottom]);

  // ── Image Input Demo ──
  const handleImageInput = useCallback(() => {
    if (demoPhase !== DEMO_STATES.IDLE_AFTER_AUDIO) return;

    setDemoPhase(DEMO_STATES.IMAGE_INPUT);

    // User image message
    addMessage({
      type: 'user',
      content: '__BANK_STATEMENT_IMAGE__',
      icon: 'image',
    });

    // Start thinking
    setTimeout(() => {
      setDemoPhase(DEMO_STATES.IMAGE_THINKING);
      setIsThinking(true);

      const steps = [
        { icon: '📷', text: 'Análise de entrada: Imagem detectada.' },
        { icon: '🔍', text: 'Processando Vision OCR no extrato bancário...' },
        {
          icon: '💸',
          text: 'Extraindo despesa: R$ 80,00 (Categoria: Mercado/Alimentação)',
        },
        { icon: '🔢', text: 'Cálculo: 150 - 80 = 70' },
        { icon: '⚡', text: 'Ação: Executar função update_ledger()' },
        { icon: '💡', text: 'Gerando dica personalizada de economia...' },
      ];

      steps.forEach((step, i) => {
        setTimeout(() => {
          setThinkingSteps((prev) => [...prev, step]);
          scrollToBottom();
        }, (i + 1) * 600);
      });

      setTimeout(
        () => {
          setIsThinking(false);
          setThinkingSteps([]);
          setDemoPhase(DEMO_STATES.IMAGE_RESPONSE);

          // Update balance
          setBalance(70);
          setExpenses((prev) => [
            ...prev,
            { category: 'Mercado', value: 80 },
          ]);

          // Bot response
          addMessage({
            type: 'bot',
            content:
              'Li o seu print do extrato. 📄\n\nIdentifiquei um gasto de **R$ 80,00** no Mercado. Seu novo saldo é **R$ 70,00**.\n\n💡 **Dica:** Notei que seus gastos com mercado aumentaram. Quer que eu te lembre de pesquisar marcas mais baratas na próxima vez?',
            icon: 'bot',
          });

          setDemoPhase(DEMO_STATES.COMPLETE);
        },
        steps.length * 600 + 800
      );
    }, 800);
  }, [demoPhase, addMessage, scrollToBottom]);

  // ── Text input (generic response) ──
  const handleTextInput = useCallback(
    (text) => {
      if (!text.trim()) return;

      addMessage({
        type: 'user',
        content: text,
        icon: 'text',
      });

      // Generic bot response
      setTimeout(() => {
        addMessage({
          type: 'bot',
          content:
            'Entendi! Para essa demonstração, use os botões de **áudio** 🎤 ou **imagem** 📎 para ver a simulação completa do Gemma 4 em ação.',
          icon: 'bot',
        });
      }, 1000);
    },
    [addMessage]
  );

  // ── Reset ──
  const resetChat = useCallback(() => {
    setMessages([welcomeMessage]);
    setBalance(0);
    setDemoPhase(DEMO_STATES.IDLE_AFTER_WELCOME);
    setIsThinking(false);
    setThinkingSteps([]);
    setIsRecording(false);
    setExpenses([]);
    setIncome([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    messages,
    balance,
    demoPhase,
    isThinking,
    thinkingSteps,
    isRecording,
    expenses,
    income,
    scrollRef,
    handleAudioInput,
    handleImageInput,
    handleTextInput,
    resetChat,
    canRecordAudio: demoPhase === DEMO_STATES.IDLE_AFTER_WELCOME,
    canUploadImage: demoPhase === DEMO_STATES.IDLE_AFTER_AUDIO,
    isComplete: demoPhase === DEMO_STATES.COMPLETE,
  };
}
