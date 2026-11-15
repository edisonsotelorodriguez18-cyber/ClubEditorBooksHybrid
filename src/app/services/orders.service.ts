import { Injectable } from '@angular/core';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { CartLine, StoreOrder } from '../models/store.models';
import { db } from './firebase';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  async create(userId: string, items: CartLine[], address: string): Promise<void> {
    const order: StoreOrder = { buyerId: userId, items: items.map(({ book, quantity }) => ({ productId: book.id, name: book.name, price: book.price, quantity })), total: items.reduce((sum, item) => sum + item.book.price * item.quantity, 0), status: 'Pendiente', deliveryLocation: address, createdAt: new Date().toISOString() };
    if (db && !userId.startsWith('demo-')) await addDoc(collection(db, 'orders'), order);
    else { const stored = JSON.parse(localStorage.getItem('club-editor-demo-orders') || '[]') as StoreOrder[]; stored.unshift({ ...order, id: `demo-${Date.now()}` }); localStorage.setItem('club-editor-demo-orders', JSON.stringify(stored)); }
  }
  async history(userId: string): Promise<StoreOrder[]> {
    if (db && !userId.startsWith('demo-')) { const snap = await getDocs(query(collection(db, 'orders'), where('buyerId', '==', userId))); return snap.docs.map((item) => ({ id: item.id, ...item.data() } as StoreOrder)).sort((a, b) => b.createdAt.localeCompare(a.createdAt)); }
    return (JSON.parse(localStorage.getItem('club-editor-demo-orders') || '[]') as StoreOrder[]).filter((order) => order.buyerId === userId);
  }
}
