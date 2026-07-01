import { describe, it, expect } from 'vitest';
import { SmartEngine } from '../SmartEngine';

describe('SmartEngine', () => {
  const mockContext = {
    income: [{ category: 'Salary', value: 3000 }],
    expenses: [{ category: 'Mercado', value: 500 }]
  };

  it('should handle basic greeting intent safely', () => {
    const result = SmartEngine.processInput('oi', mockContext);
    expect(result.response).toContain('Hello!');
    expect(result.skipThinking).toBe(true);
  });

  it('should detect debt warning intent', () => {
    const result = SmartEngine.processInput('minha fatura do cartao atrasou', mockContext);
    expect(result.specialContent.type).toBe('__DEBT_WARNING__');
    expect(result.response).toContain('Important Warning');
  });

  it('should calculate Point of Sale recommendation correctly for cash payment', () => {
    // Current balance = 3000 - 500 = 2500
    // Price = 1000, Discount = 10% -> Cash = 900
    // 2500 >= 900 + 500 (1400), so it should recommend cash.
    const result = SmartEngine.processInput('comprar geladeira por R$ 1000 com 10% de desconto', mockContext);
    expect(result.response).toContain('Pay in cash');
  });

  it('should handle null/empty pointers in text safely by returning fallback instead of throwing', () => {
    // Injecting null shouldn't crash
    const result = SmartEngine.processInput(null, mockContext);
    expect(result).toBeDefined();
    expect(result.response).toContain("I'm still learning");
  });

  it('should handle missing or invalid context properties gracefully', () => {
    const result = SmartEngine.processInput('quanto gastei', null);
    expect(result.response.replace(/\u00a0/g, ' ')).toContain('R$ 0,00'); // Safe fallback to 0
  });

  it('should handle bilingual queries (English/Portuguese) for credit card intent', () => {
    const resultPT = SmartEngine.processInput('minha fatura do cartao atrasou', mockContext);
    const resultEN = SmartEngine.processInput('my credit card payment is late', mockContext);

    expect(resultPT.specialContent.type).toBe('__DEBT_WARNING__');
    expect(resultEN.specialContent.type).toBe('__DEBT_WARNING__');
    expect(resultPT.response).toBe(resultEN.response);
  });

  it('should calculate totals in O(1) lazy eval correctly without crashing on empty arrays', () => {
    const emptyContext = { income: [], expenses: [] };
    const result = SmartEngine.processInput('quanto gastei', emptyContext);
    expect(result.response.replace(/\u00a0/g, ' ')).toContain('R$ 0,00'); // 0 formatted
  });
});
