import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StorageService } from '../StorageService';

// Mock browser LocalStorage and Storage prototype globally for Node environment
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

const localStorageInstance = new StorageMock();
Object.defineProperty(global, 'localStorage', { value: localStorageInstance, configurable: true });
Object.defineProperty(global, 'Storage', { value: StorageMock, configurable: true });

describe('StorageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return null when local storage is empty', () => {
    expect(StorageService.loadState()).toBeNull();
  });

  it('should successfully save and load state', () => {
    const state = { balance: 150, messages: [] };
    StorageService.saveState(state);
    
    const loaded = StorageService.loadState();
    expect(loaded).toEqual(state);
  });

  it('should return null and warn when corrupted JSON is present (Injection)', () => {
    localStorage.setItem('gemmafin_state', '{ corrupted JSON');
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const loaded = StorageService.loadState();
    expect(loaded).toBeNull();
    expect(spy).toHaveBeenCalled();
  });

  it('should ignore non-object payloads (Type Failure injection)', () => {
    localStorage.setItem('gemmafin_state', JSON.stringify("string instead of object"));
    const loaded = StorageService.loadState();
    expect(loaded).toBeNull();
  });

  it('should handle QuotaExceeded gracefully', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    StorageService.saveState({ massive: 'data' });
    expect(spy).toHaveBeenCalled();
  });
});
