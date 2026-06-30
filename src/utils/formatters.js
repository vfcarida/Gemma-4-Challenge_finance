/**
 * Formats a numeric value into BRL currency string.
 * Rationale: Centralized formatting ensures consistency across the UI and business logic.
 * @param {number} value - The numeric value to format.
 * @returns {string} The formatted currency string.
 */
export function formatCurrency(value) {
  if (typeof value !== 'number' || isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
