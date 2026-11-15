import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular/lazy';
import { Book, CartLine, StoreOrder, StoreUser } from '../models/store.models';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { CatalogService } from '../services/catalog.service';
import { OrdersService } from '../services/orders.service';

@Component({ selector: 'app-home', templateUrl: 'home.page.html', styleUrls: ['home.page.scss'], standalone: false })
export class HomePage implements OnInit {
  user: StoreUser | null = null; books: Book[] = []; filteredBooks: Book[] = []; cart: CartLine[] = []; orders: StoreOrder[] = [];
  activeTab: 'catalog' | 'cart' | 'orders' | 'profile' = 'catalog'; search = ''; category = 'Todos'; isRegister = false; isLoading = true; busy = false;
  email = ''; password = ''; fullName = ''; address = ''; readonly demoMode: boolean;
  constructor(private auth: AuthService, private catalog: CatalogService, private cartService: CartService, private ordersService: OrdersService, private alert: AlertController, private toastController: ToastController, private changeDetector: ChangeDetectorRef) { this.demoMode = auth.demoMode; }
  async ngOnInit(): Promise<void> {
    this.auth.user$.subscribe(async (user) => { this.user = user; if (user) { await this.refreshData(); this.address = localStorage.getItem(`club-editor-address:${user.uid}`) || ''; } else { this.cart = []; this.orders = []; this.address = ''; } this.changeDetector.markForCheck(); });
    try { this.books = await this.catalog.getBooks(); this.applyFilters(); }
    catch { await this.toast('No se pudo cargar el catálogo. Revisa Firebase o la conexión.'); }
    finally { this.isLoading = false; this.changeDetector.markForCheck(); }
  }
  async submitAuth(): Promise<void> {
    if (!this.email || !this.password || (this.isRegister && !this.fullName)) { await this.toast('Completa todos los campos.'); return; }
    this.busy = true;
    try { if (this.isRegister) await this.auth.register(this.fullName, this.email, this.password); else await this.auth.login(this.email, this.password); await this.toast('Sesión iniciada correctamente.'); }
    catch (error) { await this.toast(this.errorMessage(error)); }
    finally { this.busy = false; }
  }
  async addToCart(book: Book): Promise<void> { if (!this.user) return; this.cart = await this.cartService.add(book, this.user.uid); await this.toast(`${book.name} se agregó al carrito.`); }
  async changeQuantity(id: string, delta: number): Promise<void> { if (!this.user) return; this.cart = await this.cartService.change(id, delta, this.user.uid); }
  get cartCount(): number { return this.cart.reduce((sum, item) => sum + item.quantity, 0); }
  get cartTotal(): number { return this.cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0); }
  get categories(): string[] { return ['Todos', ...new Set(this.books.map((book) => book.category))]; }
  applyFilters(): void { const term = this.search.trim().toLocaleLowerCase(); this.filteredBooks = this.books.filter((book) => (this.category === 'Todos' || book.category === this.category) && `${book.name} ${book.author}`.toLocaleLowerCase().includes(term)); }
  formatPrice(value: number): string { return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value); }
  async saveAddress(): Promise<void> { if (!this.user) return; localStorage.setItem(`club-editor-address:${this.user.uid}`, this.address.trim()); await this.toast('Dirección guardada.'); }
  async placeOrder(): Promise<void> {
    if (!this.user || this.cart.length === 0) return;
    if (!this.address.trim()) { await this.toast('Escribe una dirección de entrega en Perfil.'); this.activeTab = 'profile'; return; }
    const prompt = await this.alert.create({ header: 'Confirmar pedido', message: `Total: ${this.formatPrice(this.cartTotal)}. ¿Registrar este pedido?`, buttons: [{ text: 'Seguir comprando', role: 'cancel' }, { text: 'Confirmar', handler: () => void this.confirmOrder() }] }); await prompt.present();
  }
  async logout(): Promise<void> { await this.auth.logout(); this.activeTab = 'catalog'; }
  private async confirmOrder(): Promise<void> {
    try { await this.ordersService.create(this.user!.uid, this.cart, this.address.trim()); await this.cartService.clear(this.user!.uid); this.cart = []; this.orders = await this.ordersService.history(this.user!.uid); this.activeTab = 'orders'; await this.toast('Pedido guardado correctamente.'); }
    catch (error) { await this.toast(this.errorMessage(error)); }
  }
  private async refreshData(): Promise<void> { if (this.user) { this.cart = await this.cartService.getItems(this.user.uid); this.orders = await this.ordersService.history(this.user.uid); } }
  private async toast(message: string): Promise<void> { const item = await this.toastController.create({ message, duration: 2600, position: 'bottom' }); await item.present(); }
  private errorMessage(error: unknown): string {
    const code = (error as { code?: string })?.code;
    const messages: Record<string, string> = { 'auth/invalid-credential': 'Correo o contraseña incorrectos.', 'auth/email-already-in-use': 'Ese correo ya tiene una cuenta.', 'auth/weak-password': 'La contraseña debe tener al menos seis caracteres.', 'auth/invalid-email': 'El correo no tiene un formato válido.', 'auth/operation-not-allowed': 'Activa el acceso por correo y contraseña en Firebase.' };
    return messages[code || ''] || (error instanceof Error ? error.message : 'Ocurrió un error. Intenta de nuevo.');
  }
}
