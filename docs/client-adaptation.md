# Adaptar la plantilla a un restaurante

## 1. Crear la versión del cliente

Parte de `template/site-config.js`. Puedes editarlo directamente o copiarlo a otra carpeta del proyecto y seleccionar la copia con `SITE_CONFIG`. Conserva la importación de `core/defaults.js` con la ruta relativa correcta.

El ejemplo Mott 32 está en `examples/mott32.config.js`; su contenido editorial extenso permanece en las páginas HTML originales. La genérica genera su contenido desde `content` y no requiere editar esas páginas.

## 2. Identidad y contenido

- `brand`: nombre, nombre legal, `slug` único, idioma, correo, teléfono, cocina y rango de precios. El `slug` separa las preferencias del navegador y las altas VIP de cada restaurante.
- `brand.logo` y `footerLogo`: rutas del logotipo. Con una cadena vacía se muestra el nombre como texto.
- `activePreset`: `fine-dining`, `casual-modern` o `bar-night`. Los colores se pueden ajustar en `themePresets`.
- `navigation`: enlaces del menú y pie. `socialLinks`: perfiles propios.
- `content.home`, `food` y `drinks`: imágenes y textos principales. `content.editorial`: bloques de páginas informativas, como privacidad.
- `content.home.galleryTitle`, `galleryEyebrow` y `locationsEyebrow`: títulos de la galería y del restaurante en la portada. La galería genérica se crea con los platos y bebidas de `menu.items`; todas las fotos tienen el mismo tamaño. Puedes fijar una selección propia en `content.homeCarousels.food`.
- `content.events`: imagen, textos y contacto del bloque para comidas y celebraciones. Elimina este objeto si no se necesita.
- `vip` y `newsletter`: imagen, textos, consentimiento y servicio de suscripción. Con `vip.enabled: false` se eliminan las invitaciones a suscribirse.

Los textos aceptan `{brand}`, `{email}`, `{careersEmail}` y `{privacyEmail}` donde se usan los mensajes compartidos. No guardes credenciales aquí: la configuración se incorpora al sitio público.

## 3. Locales y reservas

Cada elemento de `locations` necesita un `slug` único en minúsculas, nombre, región, estado, dirección e imagen. Usa `status: "open"` para un local abierto y `"coming-soon"` para una próxima apertura.

Completa `postalAddress` con localidad, región, código postal y país de ese local. Cada ficha tendrá su URL `/location/<slug>/` y sus propios datos estructurados.

`reserve` acepta enlaces HTTPS a un proveedor de reservas o enlaces `mailto:` y `tel:`. `reservationProvider` identifica el servicio. Sustituye el correo de ejemplo antes de entregar. Comprueba el enlace en el proveedor real; el sitio dirige al servicio o contacto elegido y no gestiona disponibilidad de mesas.

`cuisinePdf` y `drinksPdf` son opcionales: no se muestra un PDF de otro local si faltan. Incluye los PDF finales en `assets/`.

## 4. Carta

Cada elemento de `menu.items` tiene:

```js
{
  id: "arroz-de-temporada",          // Identificador estable, no el título
  kind: "food",                     // food o drinks
  category: "signature",            // Etiqueta en menu.categories
  title: "Arroz de temporada",
  description: "Setas, verduras y caldo de la casa.",
  image: "/assets/arroz.jpg",
  locations: ["madrid"],             // Slugs existentes en locations
  price: "22 €",
  allergens: ["apio"],
  dietary: ["vegetariano"]
}
```

Añadir, renombrar o eliminar elementos actualiza tarjetas y filtros al compilar. Los precios y alérgenos deben corresponder a la carta del cliente. Una lista `locations` vacía deja el producto fuera de los locales disponibles.

## 5. Fotografías y archivos

Coloca fotos JPG/JPEG, logotipos SVG/PNG y PDF directamente en `assets/` y referencia rutas `/assets/nombre-del-archivo.ext`. Utiliza nombres sin espacios. Las fotos JPG/JPEG se convierten automáticamente en WebP con variantes para pantallas pequeñas y grandes.

La carpeta `public/assets/` y la caché se regeneran; no se editan ni se entregan los originales pesados. La compilación elimina del resultado los recursos que esa versión no utiliza. Casa Oliva utiliza fotografías generadas de demostración (`oliva-*.jpg`), documentadas en `docs/oliva-image-prompts.md`; sustitúyelas por las del cliente. Las ilustraciones `template-*.svg` siguen disponibles como alternativa sin cambiar la estructura.

## 6. Dominio y metadatos

Completa `seo.baseUrl`, `seo.pages` y `seo.sameAs`. El dominio también se puede proporcionar con `SITE_URL` al compilar. La carpeta de entrega ya contiene los metadatos, los datos estructurados y el mapa del sitio.

Activa `seo.indexable` cuando nombre, dominio, direcciones, imágenes y textos sean definitivos. Las demostraciones están excluidas de indexación. Revisa la política de privacidad de ejemplo para que describa los datos, proveedores y plazos reales del restaurante.

## 7. Suscripciones y entrega

El servidor Node incluido guarda las altas con consentimiento en un archivo privado. Configura `NEWSLETTER_DATA_FILE` fuera de la carpeta pública, en un volumen persistente con copias de seguridad. Para usar un proveedor de correo, conecta una API en `newsletter.endpoint`; la clave del proveedor pertenece al servidor.

Si la entrega es estática, configura esa API externa o desactiva VIP. Si se utiliza el servidor incluido, documenta al cliente dónde se guardan las altas y cómo tramitar bajas. No hay envío de campañas ni gestión de mesas integrados.

Compila con `npm run build:template`, comprueba el resultado con `npm run serve:template` y ejecuta las verificaciones del README. Revisa especialmente las reservas, los correos, los PDF, el formulario y la ficha de cada local. Para que el cliente edite contenido sin código, hace falta conectar un CMS o un panel de administración.
