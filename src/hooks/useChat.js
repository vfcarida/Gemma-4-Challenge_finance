import { useState, useCallback, useRef, useEffect } from 'react';

const STORAGE_KEY = 'gemmafin_state';

const DEMO_STATES = {
  IDLE_AFTER_WELCOME: 'IDLE_AFTER_WELCOME',
  AUDIO_INPUT: 'AUDIO_INPUT',
  AUDIO_THINKING: 'AUDIO_THINKING',
  IDLE_AFTER_AUDIO: 'IDLE_AFTER_AUDIO',
  IMAGE_INPUT: 'IMAGE_INPUT',
  IMAGE_THINKING: 'IMAGE_THINKING',
  INTERACTIVE: 'INTERACTIVE',
};

// ── Historical mock data (3 months) ──
const HISTORICAL_DATA = {
  'março': {
    income: [
      { category: 'Serviços Informais', value: 350 },
      { category: 'Faxina', value: 150 },
    ],
    expenses: [
      { category: 'Mercado', value: 65 },
      { category: 'Gás', value: 30 },
      { category: 'Transporte', value: 45 },
      { category: 'Celular', value: 25 },
    ],
  },
  'abril': {
    income: [
      { category: 'Serviços Informais', value: 400 },
      { category: 'Faxina', value: 200 },
    ],
    expenses: [
      { category: 'Mercado', value: 72 },
      { category: 'Beleza', value: 35 },
      { category: 'Gás', value: 30 },
      { category: 'Transporte', value: 50 },
      { category: 'Celular', value: 25 },
    ],
  },
};

function timestamp() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// ── Persistence Helpers ──
function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

const welcomeMessage = {
  id: 'welcome',
  type: 'bot',
  content: 'Olá! Sou o GemmaFin, seu assistente financeiro inteligente. 👋\n\nComo posso ajudar com suas finanças hoje? Pode mandar áudio, foto de recibo ou digitar qualquer pergunta sobre suas finanças.',
  timestamp: timestamp(),
  icon: 'bot',
  suggestedReplies: ['🎤 Enviar áudio', '📎 Enviar imagem', '❓ O que você faz?'],
};

// ── Smart response engine ──
function findSmartResponse(text, { income, expenses }) {
  // Normalize text for matching
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const totalIncome = income.reduce((s, i) => s + i.value, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.value, 0);

  // Debt Rescue & Refinancing Alert (Credit Card Trap)
  if (lower.includes('fatura') || lower.includes('cartao') || lower.includes('minimo') || lower.includes('rotativo') || lower.includes('atrasad')) {
    return {
      thinkSteps: [
        { icon: '🚨', text: 'Alerta: Detectada menção a pagamento mínimo/rotativo de cartão.' },
        { icon: '🔍', text: 'Analisando juros médios do rotativo (aprox. 14% ao mês)...' },
        { icon: '🧮', text: 'Comparando com alternativas de crédito (Empréstimo pessoal a 3% ao mês)...' },
        { icon: '🛡️', text: 'Ação preventiva: Gerando simulação de intervenção financeira.' },
      ],
      response: `🚨 **Aviso Importante:** Pagar apenas o mínimo do cartão pode criar uma bola de neve perigosa devido aos juros do crédito rotativo (que chegam a mais de 14% ao mês).\n\n💡 **Minha sugestão:** Se você não consegue pagar a fatura total, procure um empréstimo pessoal com taxa menor (ex: 3% ao mês) para quitar o cartão à vista. Isso pode te salvar centenas de Reais!`,
      specialContent: { type: '__DEBT_WARNING__' },
      replies: ['📊 Ver simulação detalhada', '💰 Onde consigo empréstimo?', '💸 Como negociar dívida?'],
    };
  }

  // Point-of-Sale Decision Engine (Installments vs. Cash Discount)
  if (lower.includes('comprar') || lower.includes('geladeira') || lower.includes('parcelado') || lower.includes('vista') || lower.includes('desconto')) {
    // Attempt to extract values using regex, fallback to defaults
    const priceMatch = text.match(/(?:por|de|valor)\s*(?:R\$)?\s*(\d+[\.,]?\d*)/i);
    const installmentMatch = text.match(/(\d+)\s*x/i);
    const discountMatch = text.match(/(\d+)\s*%/i);

    const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 2000;
    const installments = installmentMatch ? parseInt(installmentMatch[1], 10) : 12;
    const discount = discountMatch ? parseFloat(discountMatch[1]) : 10;
    
    const cashPrice = price * (1 - discount / 100);
    const saved = price - cashPrice;
    const currentBalance = totalIncome - totalExpenses; // using current balance

    // Logic: if current balance > cash price + safety margin (e.g., 500)
    const canAffordCash = currentBalance >= (cashPrice + 500);

    const recommendation = canAffordCash
      ? `✅ **Pague à vista no Pix!** Você tem saldo suficiente. Pagando **${formatCurrency(cashPrice)}**, você economiza **${formatCurrency(saved)}**. Esse desconto de ${discount}% é muito maior do que o rendimento desse dinheiro parado na conta (aprox. 0.8% ao mês no CDI).`
      : `⚠️ **Atenção:** Embora o desconto de ${discount}% seja bom (economia de ${formatCurrency(saved)}), pagar **${formatCurrency(cashPrice)}** à vista vai comprometer seu saldo atual e pode faltar para o aluguel ou contas básicas.\n\n💡 **Sugestão:** Aceite o parcelamento em ${installments}x para proteger seu fluxo de caixa e sua reserva de emergência.`;

    return {
      thinkSteps: [
        { icon: '🛒', text: 'Análise de entrada: Decisão de compra no Ponto de Venda.' },
        { icon: '🔢', text: `Extraindo dados: Valor total = R$${price}, Desconto = ${discount}%, Parcelas = ${installments}x` },
        { icon: '🏦', text: `Consultando saldo líquido: R$${currentBalance}` },
        { icon: '⚖️', text: 'Calculando Custo de Oportunidade (Desconto vs. Liquidez vs. CDI)...' },
        { icon: '💡', text: 'Gerando recomendação baseada em fluxo de caixa...' },
      ],
      response: `Fiz as contas para você! 🧮\n\n${recommendation}`,
      replies: ['📊 Como você calculou?', '💸 Voltar ao resumo'],
    };
  }

  // Grocery query
  if (lower.includes('mercado') || lower.includes('supermercado') || lower.includes('alimenta')) {
    const currentMercado = expenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
    const prevMercado = HISTORICAL_DATA['abril'].expenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
    const prev2Mercado = HISTORICAL_DATA['março'].expenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
    const pctChange = prevMercado > 0 ? Math.round(((currentMercado - prevMercado) / prevMercado) * 100) : 0;
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Consulta sobre gastos com Mercado.' },
        { icon: '🔍', text: 'Buscando histórico de despesas: Mercado/Alimentação...' },
        { icon: '📊', text: `Dados encontrados: Mar R$${prev2Mercado} → Abr R$${prevMercado} → Mai R$${currentMercado}` },
        { icon: '📈', text: `Variação mês anterior: ${pctChange > 0 ? '+' : ''}${pctChange}%` },
        { icon: '💡', text: 'Gerando análise comparativa...' },
      ],
      response: `Analisei seu histórico de gastos no **Mercado**: 📊\n\n🔹 Março: **${formatCurrency(prev2Mercado)}**\n🔹 Abril: **${formatCurrency(prevMercado)}**\n🔹 Maio (atual): **${formatCurrency(currentMercado)}**\n\n${pctChange > 0 ? `⚠️ Aumento de **${pctChange}%** em relação ao mês passado.` : `✅ Redução de **${Math.abs(pctChange)}%** — bom trabalho!`}\n\n💡 **Dica:** Para uma família de 1 pessoa, o ideal é manter o mercado abaixo de **R$ 70,00/mês**. Quer que eu defina uma meta pra isso?`,
      specialContent: { type: '__COMPARISON__', category: 'Mercado', current: currentMercado, previous: prevMercado, prev2: prev2Mercado },
      replies: ['📊 Ver resumo do mês', '🎯 Definir meta de mercado', '💡 Mais dicas'],
    };
  }

  // Summary / report
  if (lower.includes('resumo') || lower.includes('relatorio') || lower.includes('visao geral') || lower.includes('ver resumo')) {
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Solicitação de resumo financeiro.' },
        { icon: '📊', text: 'Compilando dados do mês atual...' },
        { icon: '📈', text: 'Comparando com meses anteriores...' },
        { icon: '🎨', text: 'Gerando relatório visual completo...' },
      ],
      response: `Aqui está seu **resumo financeiro de Maio**: 📋\n\n💰 Receitas: **${formatCurrency(totalIncome)}**\n💸 Despesas: **${formatCurrency(totalExpenses)}**\n📊 Saldo: **${formatCurrency(totalIncome - totalExpenses)}**`,
      specialContent: { type: '__FULL_REPORT__' },
      replies: ['💰 Quanto ganhei?', '💸 Quanto gastei?', '🎯 Definir meta'],
    };
  }

  // Goal / budget
  if (lower.includes('meta') || lower.includes('orcamento') || lower.includes('objetivo') || lower.includes('definir')) {
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Definição de meta/orçamento.' },
        { icon: '🔍', text: 'Analisando padrão de gastos dos últimos 3 meses...' },
        { icon: '🧮', text: 'Calculando metas sugeridas por categoria...' },
        { icon: '🎯', text: 'Gerando plano de orçamento personalizado...' },
      ],
      response: 'Baseado no seu histórico, montei **sugestões de metas** para este mês: 🎯',
      specialContent: { type: '__BUDGET_GOAL__' },
      replies: ['📊 Ver resumo do mês', '💡 Dicas de economia', '💸 Gastos por categoria'],
    };
  }

  // Savings tips
  if (lower.includes('dica') || lower.includes('economizar') || lower.includes('economia') || lower.includes('poupar') || lower.includes('guardar')) {
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Solicitação de dicas financeiras.' },
        { icon: '🔍', text: 'Analisando padrão de gastos e oportunidades...' },
        { icon: '💡', text: 'Gerando dicas personalizadas...' },
      ],
      response: 'Baseado no seu perfil financeiro, aqui vão **dicas personalizadas**: 💡\n\n1️⃣ **Mercado:** Faça lista antes de ir e compare preços. Marcas próprias economizam até 30%.\n\n2️⃣ **Beleza:** Tente espaçar o corte para cada 5-6 semanas. Economia de ~R$ 17/mês.\n\n3️⃣ **Bicos:** Registre todos os pagamentos Pix — isso ajuda no controle e pode servir de comprovante de renda.\n\n4️⃣ **Reserva:** Tente guardar pelo menos **10%** da sua renda. Com R$ 200 de bico, seriam **R$ 20** por vez.\n\n5️⃣ **Gás:** Cozinhar em quantidade e congelar reduz o consumo de gás em até 40%.',
      replies: ['🎯 Definir meta', '📊 Ver resumo', '💰 Quanto já economizei?'],
    };
  }

  // Spending query
  if (lower.includes('quanto gastei') || lower.includes('gastos') || lower.includes('despesa')) {
    const breakdown = expenses.reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.value;
      return acc;
    }, {});
    const lines = Object.entries(breakdown).map(([cat, val]) => `• **${cat}:** ${formatCurrency(val)}`).join('\n');
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Consulta de despesas.' },
        { icon: '🔍', text: 'Buscando todas as despesas do mês...' },
        { icon: '📊', text: `Total de ${expenses.length} transações encontradas.` },
      ],
      response: `Suas despesas em **Maio** até agora: 💸\n\n${lines}\n\n📊 **Total:** ${formatCurrency(totalExpenses)}`,
      replies: ['📊 Comparar com mês passado', '🎯 Definir meta', '💡 Dicas de economia'],
    };
  }

  // Income query
  if (lower.includes('quanto ganhei') || lower.includes('receita') || lower.includes('renda') || lower.includes('ganho')) {
    const breakdown = income.reduce((acc, i) => {
      acc[i.category] = (acc[i.category] || 0) + i.value;
      return acc;
    }, {});
    const lines = Object.entries(breakdown).map(([cat, val]) => `• **${cat}:** ${formatCurrency(val)}`).join('\n');
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Consulta de receitas.' },
        { icon: '🔍', text: 'Buscando todas as entradas do mês...' },
        { icon: '📊', text: `Total de ${income.length} fontes de renda encontradas.` },
      ],
      response: `Suas receitas em **Maio** até agora: 💰\n\n${lines}\n\n📊 **Total:** ${formatCurrency(totalIncome)}`,
      replies: ['💸 Ver despesas', '📊 Resumo completo', '🎯 Definir meta'],
    };
  }

  // Transaction history / Statement
  if (lower.includes('extrato') || lower.includes('transac') || lower.includes('historico') || lower.includes('moviment')) {
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Solicitação de extrato.' },
        { icon: '🔍', text: 'Compilando movimentações do mês...' },
      ],
      response: '📄 **Extrato de Maio:**\n\n🟢 +R$ 200,00 — Bico elétrica (Pix)\n🔴 -R$ 50,00 — Cabeleireiro\n🔴 -R$ 80,00 — Mercado Bom Preço\n\n📊 **Saldo:** ' + formatCurrency(totalIncome - totalExpenses),
      replies: ['📊 Ver resumo', '💸 Gastos por categoria', '💡 Dicas'],
    };
  }

  // Help / Capabilities
  if (lower.includes('ajuda') || lower.includes('o que voce faz') || lower.includes('o que vc faz') || lower.includes('funcionalidade') || lower.includes('como funciona')) {
    return {
      thinkSteps: [
        { icon: '📝', text: 'Análise de entrada: Solicitação de ajuda.' },
        { icon: '📋', text: 'Listando funcionalidades disponíveis...' },
      ],
      response: 'Posso te ajudar com várias coisas! 🚀\n\n🎤 **Áudio:** Registre ganhos e gastos por voz\n📷 **Imagem:** Envie foto de extrato ou recibo\n📊 **Resumo:** Veja seu relatório do mês\n💸 **Gastos:** Consulte despesas por categoria\n💰 **Receitas:** Veja de onde vem seu dinheiro\n📈 **Comparar:** Compare com meses anteriores\n🎯 **Metas:** Defina limites de gastos\n💡 **Dicas:** Receba dicas personalizadas\n\nÉ só perguntar! 😊',
      replies: ['📊 Ver resumo', '💡 Dicas de economia', '🎯 Definir meta'],
    };
  }

  // Greeting
  if (lower.match(/^(oi|ola|bom dia|boa tarde|boa noite|eai|e ai|hey|hello)/)) {
    return {
      thinkSteps: [],
      response: 'Olá! 😊 Como posso te ajudar com suas finanças? Pode perguntar sobre gastos, receitas, ou pedir dicas!',
      replies: ['📊 Ver resumo', '💡 Dicas', '❓ O que você faz?'],
      skipThinking: true,
    };
  }

  // Fallback response
  return {
    thinkSteps: [
      { icon: '📝', text: 'Análise de entrada: Processando texto livre...' },
      { icon: '🤔', text: 'Tentando identificar intenção do usuário...' },
    ],
    response: `Ainda estou aprendendo, mas posso te ajudar com:\n\n📊 Resumo financeiro\n💸 Consulta de gastos\n💰 Consulta de receitas\n📈 Comparações mensais\n🎯 Metas de orçamento\n💡 Dicas de economia\n\nTenta me perguntar algo como: **"quanto gastei no mercado?"** ou **"me mostra o resumo do mês"** 😊`,
    replies: ['📊 Ver resumo do mês', '💸 Quanto gastei?', '💡 Dicas de economia'],
  };
}

export function useChat() {
  const initialState = loadState();

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
    saveState({ messages, balance, demoPhase, expenses, income });
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
        content: 'Fiz um bico de elétrica hoje, demorou umas 3 horas e cobrei 200 reais no Pix. Mas depois passei no cabeleireiro e gastei 50 reais, não peguei nota.',
        icon: 'audio',
      });
      setDemoPhase(DEMO_STATES.AUDIO_THINKING);

      setTimeout(() => {
        setIsThinking(true);
        const steps = [
          { icon: '📥', text: 'Análise de entrada: Áudio detectado.' },
          { icon: '🗣️', text: 'Transcrição via Speech-to-Text concluída.' },
          { icon: '💰', text: 'Extraindo receita: R$ 200,00 (Categoria: Serviços Informais/Bico)' },
          { icon: '💸', text: 'Extraindo despesa: R$ 50,00 (Categoria: Cuidados Pessoais/Beleza)' },
          { icon: '🔢', text: 'Cálculo: +200 - 50 = 150' },
          { icon: '⚡', text: 'Ação: Executar função update_ledger()' },
        ];
        steps.forEach((step, i) => {
          setTimeout(() => { setThinkingSteps((prev) => [...prev, step]); scrollToBottom(); }, (i + 1) * 700);
        });

        setTimeout(() => {
          setIsThinking(false);
          setThinkingSteps([]);
          setBalance(150);
          setIncome((prev) => [...prev, { category: 'Serviços Informais', value: 200 }]);
          setExpenses((prev) => [...prev, { category: 'Beleza', value: 50 }]);

          addMessage({
            type: 'bot',
            content: 'Tudo anotado! ✅\n\nRegistrei sua entrada de **R$ 200,00** (Serviços) e a saída de **R$ 50,00** (Beleza).\n\nSeu saldo atualizado é **R$ 150,00**.',
            icon: 'bot',
            suggestedReplies: ['📎 Enviar extrato', '📊 Ver resumo', '💡 Dicas de economia'],
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
        { icon: '📷', text: 'Análise de entrada: Imagem detectada.' },
        { icon: '🔍', text: 'Processando Vision OCR no extrato bancário...' },
        { icon: '💸', text: 'Extraindo despesa: R$ 80,00 (Categoria: Mercado/Alimentação)' },
        { icon: '📈', text: 'Consultando histórico: Mercado Abr R$72 → Mai R$80 (+11%)' },
        { icon: '🔢', text: 'Cálculo: 150 - 80 = 70' },
        { icon: '⚡', text: 'Ação: Executar função update_ledger()' },
        { icon: '💡', text: 'Gerando dica personalizada de economia...' },
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
          content: 'Li o seu print do extrato. 📄\n\nIdentifiquei um gasto de **R$ 80,00** no Mercado. Seu novo saldo é **R$ 70,00**.\n\n📈 **Comparação:** No mês passado você gastou **R$ 72,00** no mercado. Esse mês já são **R$ 80,00** — aumento de **11%**.\n\n💡 **Dica:** Notei que seus gastos com mercado aumentaram. Quer que eu te lembre de pesquisar marcas mais baratas na próxima vez?',
          icon: 'bot',
          suggestedReplies: ['🛒 Detalhes do mercado', '📊 Ver resumo do mês', '💡 Dicas de economia', '🎯 Definir meta'],
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
            content: 'Para começar, me envie um **áudio** 🎤 contando sobre seus ganhos e gastos do dia! Depois podemos conversar sobre tudo.',
            icon: 'bot',
            suggestedReplies: ['🎤 Enviar áudio', '❓ O que você faz?'],
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
            content: 'Boa pergunta! Mas primeiro, que tal enviar uma **foto do extrato** 📎 pra eu ter mais dados? Depois respondo tudo!',
            icon: 'bot',
            suggestedReplies: ['📎 Enviar extrato'],
          });
        }, 1200);
      }, 500);
      return;
    }

    // Interactive mode — process via smart engine
    const smart = findSmartResponse(text, { income, expenses });

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
    if (text === '🎤 Enviar áudio') {
      handleAudioInput();
    } else if (text === '📎 Enviar imagem' || text === '📎 Enviar extrato') {
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
    localStorage.removeItem(STORAGE_KEY);
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
