export interface Book {
  id: string;
  name: string;
  author: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  category: string;
}

export interface CartLine { book: Book; quantity: number; }
export interface StoreUser { uid: string; name: string; email: string; }
export interface StoreOrder {
  id?: string;
  buyerId: string;
  items: { productId: string; name: string; price: number; quantity: number }[];
  total: number;
  status: string;
  deliveryLocation: string;
  createdAt: string;
}
