import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { BehaviorSubject } from 'rxjs';
import { StoreUser } from '../models/store.models';
import { auth, db, firebaseEnabled } from './firebase';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user$ = new BehaviorSubject<StoreUser | null>(null);
  readonly demoMode = !firebaseEnabled;
  constructor() {
    if (auth) onAuthStateChanged(auth, (user) => this.user$.next(user ? { uid: user.uid, name: user.displayName || user.email || 'Cliente', email: user.email || '' } : null));
    else {
      const saved = localStorage.getItem('club-editor-demo-user');
      if (saved) this.user$.next(JSON.parse(saved) as StoreUser);
    }
  }
  async login(email: string, password: string): Promise<void> {
    if (auth) { await signInWithEmailAndPassword(auth, email, password); return; }
    this.setDemoUser(email, email.split('@')[0] || 'Cliente');
  }
  async register(name: string, email: string, password: string): Promise<void> {
    if (auth && db) {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await setDoc(doc(db, 'users', result.user.uid), { uid: result.user.uid, name, email, role: 'Comprador', createdAt: new Date().toISOString() });
      this.user$.next({ uid: result.user.uid, name, email });
      return;
    }
    this.setDemoUser(email, name);
  }
  async logout(): Promise<void> {
    if (auth) await signOut(auth);
    localStorage.removeItem('club-editor-demo-user');
    this.user$.next(null);
  }
  private setDemoUser(email: string, name: string): void {
    const user = { uid: `demo-${email.toLowerCase()}`, name, email };
    localStorage.setItem('club-editor-demo-user', JSON.stringify(user));
    this.user$.next(user);
  }
}
