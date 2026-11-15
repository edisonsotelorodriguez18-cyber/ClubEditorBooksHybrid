import { Injectable } from '@angular/core';
import { collection, getDocs } from 'firebase/firestore';
import { Book } from '../models/store.models';
import { db, firebaseEnabled } from './firebase';

const DEMO_BOOKS: Book[] = [
  { id: 'book-1', name: 'Cien años de soledad', author: 'Gabriel García Márquez', description: 'Una saga familiar inolvidable en Macondo, obra fundamental de la literatura latinoamericana.', price: 58900, stock: 12, imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80', category: 'Novela' },
  { id: 'book-2', name: 'El principito', author: 'Antoine de Saint-Exupéry', description: 'Un relato poético sobre la amistad, la imaginación y las cosas esenciales.', price: 32900, stock: 18, imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80', category: 'Clásicos' },
  { id: 'book-3', name: 'Hábitos atómicos', author: 'James Clear', description: 'Una guía práctica para crear buenos hábitos y mejorar un poco cada día.', price: 69900, stock: 9, imageUrl: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=700&q=80', category: 'Desarrollo personal' },
  { id: 'book-4', name: 'La sombra del viento', author: 'Carlos Ruiz Zafón', description: 'Un misterio literario que recorre las calles y secretos de la Barcelona de posguerra.', price: 62900, stock: 7, imageUrl: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=700&q=80', category: 'Novela' },
];

@Injectable({ providedIn: 'root' })
export class CatalogService {
  readonly demoMode = !firebaseEnabled;
  async getBooks(): Promise<Book[]> {
    if (!db) return DEMO_BOOKS;
    const snapshot = await getDocs(collection(db, 'products'));
    return snapshot.docs.map((entry) => {
      const data = entry.data();
      return { id: entry.id, name: data['name'] || 'Libro', author: data['author'] || data['sellerName'] || 'Autor', description: data['description'] || '', price: Number(data['price'] || 0), stock: Number(data['stock'] || 0), imageUrl: data['imageUrl'] || '', category: data['category'] || 'Libros' };
    });
  }
}
