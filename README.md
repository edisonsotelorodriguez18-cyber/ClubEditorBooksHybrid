# Club Editor — tienda híbrida de libros

Aplicación académica desarrollada con Ionic, Angular y Capacitor. Incluye acceso y registro, catálogo de libros, búsqueda, filtros, carrito persistido en el dispositivo e historial de pedidos. Android e iOS se generan desde la misma base web.

## Requisitos

- Node.js 24.12 o posterior y npm (con Node.js 24.11 también se compiló; npm advierte que algunas dependencias solicitan 24.12).
- Android Studio y Android SDK para compilar o ejecutar Android.
- macOS y Xcode para compilar o ejecutar iOS. La carpeta `ios/` se incluye como proyecto nativo de Capacitor, pero Xcode no está disponible en Windows.
- Firebase para habilitar autenticación y datos remotos. Sin Firebase la aplicación abre en modo demostración local.

## Instalación y ejecución web

```bash
npm install
npm start
```

Abre la dirección local que informa Angular CLI (habitualmente `http://localhost:4200`). En modo demostración se puede crear una sesión con cualquier correo y contraseña; los pedidos de demostración se guardan en el almacenamiento local del navegador.

## Configurar Firebase

1. Crea un proyecto en Firebase, registra una aplicación web y habilita Authentication con correo y contraseña, además de Cloud Firestore.
2. Copia los valores de la configuración web en `src/environments/environment.ts` y `src/environments/environment.prod.ts`. No subas archivos de credenciales de cuentas de servicio.
3. Crea los documentos de libros en `products`, con los campos `name`, `author`, `description`, `price` (número), `stock` (número), `imageUrl` y `category`.
4. Aplica las reglas del archivo `firestore.rules` desde Firebase Console. Revisa las reglas conforme al alcance y los datos reales del servicio antes de producción.

El registro crea usuarios con rol `Comprador`. La aplicación consulta `products` y crea pedidos en `orders`; el carrito usa Capacitor Preferences y no requiere una colección remota.

## Android

```bash
npm run build
npx cap sync android
npx cap open android
```

En Android Studio, selecciona un emulador o conecta un teléfono con depuración USB y usa **Run** para instalar la versión de prueba. Para preparar el archivo de distribución:

1. Abre **Build > Generate Signed Bundle / APK** y selecciona **Android App Bundle**.
2. Crea o selecciona un keystore de carga, completa el alias y las contraseñas y guarda una copia segura fuera del repositorio.
3. Elige la variante `release` y finaliza el asistente. Android Studio generará un AAB firmado para cargarlo en Google Play Console.

Android Studio generó correctamente el Android App Bundle de la variante `release` y se firmó con un keystore propio. El archivo está en `android/app/release/app-release.aab`. El AAB no se incluye en GitHub; para generar otro, sigue los pasos anteriores y mantén el keystore fuera del repositorio. No se debe subir el keystore, sus contraseñas ni `key.properties` a GitHub. La creación de la ficha y el envío a producción dependen del acceso y la membresía de Google Play Console.

Para ejecutar el dispositivo desde la terminal también se puede usar:

```bash
npx cap run android
```

La secuencia corresponde a la guía de publicación suministrada: compilar los recursos web, sincronizar Capacitor, abrir el proyecto Android, generar un bundle y firmarlo antes de distribuirlo (UCompensar, s. f.).

## iOS

En un Mac con Xcode:

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Selecciona un simulador para probar. Para distribución, configura la identidad de firma y el perfil de aprovisionamiento en Xcode, crea el archivo de distribución y gestiona la carga desde App Store Connect. Este proyecto no se compiló para iOS porque el equipo disponible usa Windows. La publicación depende del acceso y la membresía de Apple Developer; el alcance académico no presupone que se publique en la tienda.

La guía del curso describe los pasos de Capacitor y la generación de paquetes de distribución en Android Studio y Xcode (UCompensar, s. f.).

## Build Android debug

```bash
npm run cap:sync
npm run android
```

## Estructura clave

- `src/app/home`: interfaz de acceso y tienda.
- `src/app/services/auth.service.ts`: autenticación Firebase y modo demostración.
- `src/app/services/catalog.service.ts`: consulta de productos.
- `src/app/services/cart.service.ts`: persistencia local con Capacitor Preferences.
- `src/app/services/orders.service.ts`: creación e historial de pedidos.
- `android/` e `ios/`: proyectos nativos generados por Capacitor.
- `firestore.rules`: reglas base para proteger perfiles y pedidos.

## Requisitos funcionales abordados

| Requisito | Evidencia en la aplicación |
| --- | --- |
| Registro, inicio y cierre de sesión | `AuthService` |
| Catálogo, búsqueda y categorías | `CatalogService` e interfaz de catálogo |
| Carrito de compras y cantidades | `CartService` con Preferences |
| Registro de pedido | `OrdersService` y confirmación del carrito |
| Historial de pedidos | consulta por usuario en Firestore |
| Plataformas móvil y web | Ionic + Capacitor, `android/`, `ios/` |

## Repositorio

El proyecto se entrega con su código fuente. Para subirlo a GitHub, crea un repositorio vacío, revisa que la configuración privada no esté agregada y usa los comandos de Git habituales (`git init`, `git add`, `git commit`, `git remote add origin`, `git push`). Nunca subas claves de servicio ni el keystore de firma.
