import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { CartLine, Book } from '../models/store.models';

@Injectable({ providedIn: 'root' })
export class CartService {
  private keyFor(userId: string): string { return `club-editor-cart-v1:${userId}`; }
  async getItems(userId: string): Promise<CartLine[]> {
    const key = this.keyFor(userId);
    try { const result = await Preferences.get({ key }); return result.value ? JSON.parse(result.value) as CartLine[] : []; }
    catch { const data = localStorage.getItem(key); return data ? JSON.parse(data) as CartLine[] : []; }
  }
  async add(book: Book, userId: string): Promise<CartLine[]> {
    const items = await this.getItems(userId); const line = items.find((item) => item.book.id === book.id);
    if (line) line.quantity += 1; else items.push({ book, quantity: 1 });
    await this.save(items, userId); return items;
  }
  async change(bookId: string, delta: number, userId: string): Promise<CartLine[]> {
    const items = await this.getItems(userId).then((rows) => rows.map((item) => item.book.id === bookId ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0));
    await this.save(items, userId); return items;
  }
  async clear(userId: string): Promise<void> { await this.save([], userId); }
  async total(userId: string): Promise<number> { return (await this.getItems(userId)).reduce((sum, item) => sum + item.book.price * item.quantity, 0); }
  private async save(items: CartLine[], userId: string): Promise<void> {
    const key = this.keyFor(userId);
    const value = JSON.stringify(items);
    try { await Preferences.set({ key, value }); }
    catch { localStorage.setItem(key, value); }
  }
}
