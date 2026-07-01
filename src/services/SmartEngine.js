import { formatCurrency } from '../utils/formatters';

// ── Historical mock data (3 months) ──
export const HISTORICAL_DATA = {
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

/**
 * SmartEngine decouples cognitive decisions from the UI layer.
 * Rationale: Utilizing an Intent Routing Pattern and $O(1)$ aggregations where possible 
 * prevents $O(n^2)$ bottlenecks during chat interactions and promotes Clean Architecture.
 */
export const SmartEngine = {
  /**
   * Processes natural language to determine the best response and intent.
   * @param {string} text 
   * @param {Object} context 
   * @returns {Object} Response object with steps, text, and replies.
   */
  processInput: (text, context) => {
    // ── Strict boundary validation / Type protection ──
    const safeText = typeof text === 'string' ? text : '';
    const safeContext = context && typeof context === 'object' ? context : {};
    const safeIncome = Array.isArray(safeContext.income) ? safeContext.income : [];
    const safeExpenses = Array.isArray(safeContext.expenses) ? safeContext.expenses : [];

    const lower = safeText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    // Memoized lazy calculations to avoid O(n) loops if the intent doesn't require them.
    let _totalIncome = null;
    let _totalExpenses = null;
    
    const getTotalIncome = () => {
      if (_totalIncome === null) _totalIncome = safeIncome.reduce((s, i) => s + i.value, 0);
      return _totalIncome;
    };
    
    const getTotalExpenses = () => {
      if (_totalExpenses === null) _totalExpenses = safeExpenses.reduce((s, e) => s + e.value, 0);
      return _totalExpenses;
    };

    // Intent Router Array supporting both Portuguese and English
    const intents = [
      {
        match: /fatura|cartao|minimo|rotativo|atrasad|card|credit|minimum|revolving|late/i,
        handler: () => ({
          thinkSteps: [
            { icon: '🚨', text: 'Alert: Detected mention of credit card minimum payment/revolving credit.' },
            { icon: '🔍', text: 'Analyzing average revolving interest rates (approx. 14% per month)...' },
            { icon: '🧮', text: 'Comparing with credit alternatives (Personal loan at 3% per month)...' },
            { icon: '🛡️', text: 'Preventive Action: Generating financial intervention simulation.' },
          ],
          response: `🚨 **Important Warning:** Paying only the minimum on your credit card can create a dangerous snowball effect due to revolving credit interest (which can reach over 14% per month).\n\n💡 **My suggestion:** If you can't pay the full bill, look for a personal loan with a lower rate (e.g., 3% per month) to pay off the card in full. This can save you hundreds of Reais!`,
          specialContent: { type: '__DEBT_WARNING__' },
          replies: ['📊 View detailed simulation', '💰 Where to get a loan?', '💸 How to negotiate debt?'],
        })
      },
      {
        match: /comprar|geladeira|parcelado|vista|desconto|buy|purchase|installment|discount|cash/i,
        handler: () => {
          const priceMatch = safeText.match(/(?:por|de|valor|price|value)\s*(?:R\$|\$)?\s*(\d+[\.,]?\d*)/i);
          const installmentMatch = safeText.match(/(\d+)\s*(?:x|installments|times)/i);
          const discountMatch = safeText.match(/(\d+)\s*%/i);

          const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 2000;
          const installments = installmentMatch ? parseInt(installmentMatch[1], 10) : 12;
          const discount = discountMatch ? parseFloat(discountMatch[1]) : 10;
          
          const cashPrice = price * (1 - discount / 100);
          const saved = price - cashPrice;
          const currentBalance = getTotalIncome() - getTotalExpenses();

          const canAffordCash = currentBalance >= (cashPrice + 500);

          const recommendation = canAffordAffordCash(canAffordCash, cashPrice, saved, discount, installments);

          return {
            thinkSteps: [
              { icon: '🛒', text: 'Input Analysis: Point of Sale purchase decision.' },
              { icon: '🔢', text: `Extracting data: Total Value = R$ ${price}, Discount = ${discount}%, Installments = ${installments}x` },
              { icon: '🏦', text: `Checking net balance: R$ ${currentBalance}` },
              { icon: '⚖️', text: 'Calculating Opportunity Cost (Discount vs. Liquidity vs. Yield)...' },
              { icon: '💡', text: 'Generating recommendation based on cash flow...' },
            ],
            response: `I did the math for you! 🧮\n\n${recommendation}`,
            replies: ['📊 How did you calculate?', '💸 Back to summary'],
          };
        }
      },
      {
        match: /mercado|supermercado|alimenta|grocery|groceries|supermarket|food/i,
        handler: () => {
          const currentMercado = safeExpenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
          const prevMercado = HISTORICAL_DATA['abril'].expenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
          const prev2Mercado = HISTORICAL_DATA['março'].expenses.filter(e => e.category === 'Mercado').reduce((s, e) => s + e.value, 0);
          const pctChange = prevMercado > 0 ? Math.round(((currentMercado - prevMercado) / prevMercado) * 100) : 0;
          return {
            thinkSteps: [
              { icon: '📝', text: 'Input Analysis: Query about Groceries.' },
              { icon: '🔍', text: 'Fetching expense history: Groceries/Food...' },
              { icon: '📊', text: `Data found: Mar R$ ${prev2Mercado} → Apr R$ ${prevMercado} → May R$ ${currentMercado}` },
              { icon: '📈', text: `Variation from previous month: ${pctChange > 0 ? '+' : ''}${pctChange}%` },
              { icon: '💡', text: 'Generating comparative analysis...' },
            ],
            response: `I analyzed your spending history on **Groceries**: 📊\n\n🔹 March: **${formatCurrency(prev2Mercado)}**\n🔹 April: **${formatCurrency(prevMercado)}**\n🔹 May (current): **${formatCurrency(currentMercado)}**\n\n${pctChange > 0 ? `⚠️ Increase of **${pctChange}%** compared to last month.` : `✅ Reduction of **${Math.abs(pctChange)}%** — good job!`}\n\n💡 **Tip:** For a 1-person household, the ideal is to keep groceries under **R$ 70.00/month**. Want me to set a goal for this?`,
            specialContent: { type: '__COMPARISON__', category: 'Mercado', current: currentMercado, previous: prevMercado, prev2: prev2Mercado },
            replies: ['📊 View monthly summary', '🎯 Set grocery goal', '💡 More tips'],
          };
        }
      },
      {
        match: /resumo|relatorio|visao geral|ver resumo|summary|report|overview/i,
        handler: () => ({
          thinkSteps: [
            { icon: '📝', text: 'Input Analysis: Financial summary request.' },
            { icon: '📊', text: 'Compiling current month data...' },
            { icon: '📈', text: 'Comparing with previous months...' },
            { icon: '🎨', text: 'Generating complete visual report...' },
          ],
          response: `Here is your **Financial Summary for May**: 📋\n\n💰 Income: **${formatCurrency(getTotalIncome())}**\n💸 Expenses: **${formatCurrency(getTotalExpenses())}**\n📊 Balance: **${formatCurrency(getTotalIncome() - getTotalExpenses())}**`,
          specialContent: { type: '__FULL_REPORT__' },
          replies: ['💰 How much did I earn?', '💸 How much did I spend?', '🎯 Set goal'],
        })
      },
      {
        match: /meta|orcamento|objetivo|definir|goal|budget|limit|set goal/i,
        handler: () => ({
          thinkSteps: [
            { icon: '📝', text: 'Input Analysis: Goal/Budget definition.' },
            { icon: '🔍', text: 'Analyzing spending patterns of the last 3 months...' },
            { icon: '🧮', text: 'Calculating suggested goals by category...' },
            { icon: '🎯', text: 'Generating personalized budget plan...' },
          ],
          response: 'Based on your history, I set up **goal suggestions** for this month: 🎯',
          specialContent: { type: '__BUDGET_GOAL__' },
          replies: ['📊 View monthly summary', '💡 Saving tips', '💸 Expenses by category'],
        })
      },
      {
        match: /dica|economizar|economia|poupar|guardar|tip|save|saving/i,
        handler: () => ({
          thinkSteps: [
            { icon: '📝', text: 'Input Analysis: Financial tips request.' },
            { icon: '🔍', text: 'Analyzing spending pattern and opportunities...' },
            { icon: '💡', text: 'Generating personalized tips...' },
          ],
          response: 'Based on your financial profile, here are **personalized tips**: 💡\n\n1️⃣ **Groceries:** Make a list before going and compare prices. Store brands can save up to 30%.\n\n2️⃣ **Beauty:** Try spacing out haircuts to every 5-6 weeks. Savings of ~R$ 17/month.\n\n3️⃣ **Side Hustles:** Record all Pix payments — this helps tracking and serves as proof of income.\n\n4️⃣ **Reserve:** Try to save at least **10%** of your income. With R$ 200 from side jobs, that would be **R$ 20** each time.\n\n5️⃣ **Gas:** Cooking in bulk and freezing reduces gas consumption by up to 40%.',
          replies: ['🎯 Set goal', '📊 View summary', '💰 How much have I saved?'],
        })
      },
      {
        match: /quanto gastei|gastos|despesa|spend|expense|spent/i,
        handler: () => {
          const breakdown = safeExpenses.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.value;
            return acc;
          }, {});
          const lines = Object.entries(breakdown).map(([cat, val]) => `• **${cat}:** ${formatCurrency(val)}`).join('\n');
          return {
            thinkSteps: [
              { icon: '📝', text: 'Input Analysis: Expenses query.' },
              { icon: '🔍', text: 'Fetching all expenses for the month...' },
              { icon: '📊', text: `Total of ${safeExpenses.length} transactions found.` },
            ],
            response: `Your expenses in **May** so far: 💸\n\n${lines}\n\n📊 **Total:** ${formatCurrency(getTotalExpenses())}`,
            replies: ['📊 Compare with last month', '🎯 Set goal', '💡 Saving tips'],
          };
        }
      },
      {
        match: /quanto ganhei|receita|renda|ganho|earn|income|revenue/i,
        handler: () => {
          const breakdown = safeIncome.reduce((acc, i) => {
            acc[i.category] = (acc[i.category] || 0) + i.value;
            return acc;
          }, {});
          const lines = Object.entries(breakdown).map(([cat, val]) => `• **${cat}:** ${formatCurrency(val)}`).join('\n');
          return {
            thinkSteps: [
              { icon: '📝', text: 'Input Analysis: Income query.' },
              { icon: '🔍', text: 'Fetching all income sources for the month...' },
              { icon: '📊', text: `Total of ${safeIncome.length} income sources found.` },
            ],
            response: `Your income in **May** so far: 💰\n\n${lines}\n\n📊 **Total:** ${formatCurrency(getTotalIncome())}`,
            replies: ['💸 View expenses', '📊 Complete summary', '🎯 Set goal'],
          };
        }
      },
      {
        match: /extrato|transac|historico|moviment|statement|transactions|history/i,
        handler: () => ({
          thinkSteps: [
            { icon: '📝', text: 'Input Analysis: Statement request.' },
            { icon: '🔍', text: 'Compiling transactions for the month...' },
          ],
          response: '📄 **May Statement:**\n\n🟢 +R$ 200.00 — Electrical work (Pix)\n🔴 -R$ 50.00 — Hairdresser\n🔴 -R$ 80.00 — Supermarket Bom Preço\n\n📊 **Balance:** ' + formatCurrency(getTotalIncome() - getTotalExpenses()),
          replies: ['📊 View summary', '💸 Expenses by category', '💡 Tips'],
        })
      },
      {
        match: /ajuda|o que voce faz|o que vc faz|funcionalidade|como funciona|help|features|how it works/i,
        handler: () => ({
          thinkSteps: [
            { icon: '📝', text: 'Input Analysis: Help request.' },
            { icon: '📋', text: 'Listing available features...' },
          ],
          response: 'I can help you with many things! 🚀\n\n🎤 **Audio:** Record income and expenses by voice\n📷 **Image:** Send photo of statement or receipt\n📊 **Summary:** View your monthly report\n💸 **Expenses:** Consult expenses by category\n💰 **Income:** See where your money comes from\n📈 **Compare:** Compare with previous months\n🎯 **Goals:** Set spending limits\n💡 **Tips:** Receive personalized tips\n\nJust ask! 😊',
          replies: ['📊 View summary', '💡 Saving tips', '🎯 Set goal'],
        })
      },
      {
        match: /^(oi|ola|bom dia|boa tarde|boa noite|eai|e ai|hey|hello|hi|greetings)/i,
        handler: () => ({
          thinkSteps: [],
          response: 'Hello! 😊 How can I help you with your finances? You can ask about expenses, income, or ask for tips!',
          replies: ['📊 View summary', '💡 Tips', '❓ What do you do?'],
          skipThinking: true,
        })
      }
    ];

    for (const intent of intents) {
      if (intent.match.test(lower)) {
        return intent.handler();
      }
    }

    // Fallback response
    return {
      thinkSteps: [
        { icon: '📝', text: 'Input Analysis: Processing free text...' },
        { icon: '🤔', text: 'Trying to identify user intent...' },
      ],
      response: `I'm still learning, but I can help you with:\n\n📊 Financial Summary\n💸 Expenses query\n💰 Income query\n📈 Monthly comparisons\n🎯 Budget goals\n💡 Saving tips\n\nTry asking me something like: **"how much did I spend on groceries?"** or **"show me the monthly summary"** 😊`,
      replies: ['📊 View monthly summary', '💸 How much did I spend?', '💡 Saving tips'],
    };
  }
};

// Helper function to extract purchase decision recommendation
function canAffordAffordCash(canAffordCash, cashPrice, saved, discount, installments) {
  return canAffordCash
    ? `✅ **Pay in cash via Pix!** You have enough balance. Paying **${formatCurrency(cashPrice)}**, you save **${formatCurrency(saved)}**. This ${discount}% discount is much higher than the yield of keeping this money in the account (approx. 0.8% per month).`
    : `⚠️ **Attention:** Although the ${discount}% discount is good (savings of ${formatCurrency(saved)}), paying **${formatCurrency(cashPrice)}** in cash will compromise your current balance and you might fall short for rent or basic bills.\n\n💡 **Suggestion:** Accept the installment plan of ${installments}x to protect your cash flow and emergency reserve.`;
}
