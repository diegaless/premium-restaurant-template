# Plantilla de restaurantes

Dos webs independientes comparten el mismo motor de reservas, carta, locales, imágenes y SEO:

| Versión                                             | Configuración               | Desarrollo                             | Entrega                                     |
| --------------------------------------------------- | --------------------------- | -------------------------------------- | ------------------------------------------- |
| Ejemplo Mott 32, conservado con su diseño editorial | `examples/mott32.config.js` | `npm run start` · puerto 5173          | `npm run build` → `dist/`                   |
| Plantilla genérica Casa Oliva, en español           | `template/site-config.js`   | `npm run start:template` · puerto 5174 | `npm run build:template` → `dist-template/` |

Casa Oliva es un restaurante ficticio con una presentación mediterránea, fotografías generadas para la demostración y la misma base de carta, reservas, galerías y suscripciones que el ejemplo. Es la base para nuevos clientes; nombre, contacto, precios y dirección son datos de ejemplo. Las ilustraciones neutras siguen disponibles como alternativa. Mott 32 conserva sus fotografías y contenido como ejemplo; sus marcas e imágenes deben sustituirse para otro negocio. Los [prompts y archivos de Casa Oliva](docs/oliva-image-prompts.md) documentan las imágenes generadas.

## Empezar

Requiere Node.js 20.19 o posterior compatible con Vite; se recomienda Node.js 24.

```bash
npm ci
npm run start:template
```

Abre `http://localhost:5174/`. Edita `template/site-config.js` para cambiar nombre, colores, textos, imágenes, locales, carta, reservas y metadatos. Los cambios permanentes se hacen en la configuración. No hace falta modificar las tarjetas HTML al añadir o quitar platos o locales.

`/?template=1` abre un editor de demostración para nombre, email y estilo. Solo guarda cambios en ese navegador y se desactiva cuando `seo.indexable` es `true`. No es un CMS.

La [guía de adaptación](docs/client-adaptation.md) explica los campos y la entrega a clientes.

## Compilar y servir

```bash
npm run build:all
npm run serve
```

El ejemplo queda en `http://localhost:4173/`. Para servir la plantilla en otra terminal:

```bash
PORT=4174 npm run serve:template
```

En PowerShell, establece el puerto con `$env:PORT = "4174"` antes de ejecutar `npm run serve:template`. El servidor usa `127.0.0.1` por defecto. `HOST` permite configurar su dirección de escucha.

`npm run preview` y `npm run preview:template` ofrecen también una revisión local con Vite. Para un servidor Node de entrega, utiliza `serve` con la carpeta compilada.

## Qué genera la compilación

- Páginas y tarjetas derivadas de la configuración, incluidas `/location/<slug>/` para cada local. Los antiguos enlaces con `?city=` siguen funcionando.
- Títulos, descripciones, enlaces canónicos, Open Graph y datos estructurados presentes en el HTML antes de ejecutar JavaScript.
- País y dirección propios de cada local; `sitemap.xml` y `robots.txt`.
- Fotografías JPG/JPEG en WebP, con versiones de hasta 640 y 1600 píxeles, carga diferida y tamaños adaptativos.
- Solo los recursos referenciados por cada versión. Los originales de las fotos quedan en el proyecto, fuera de la entrega.

Ambas demostraciones tienen `seo.indexable: false`. Define el dominio, datos y contenido finales antes de activar la indexación. La configuración rechaza dominios de ejemplo cuando se intenta indexar.

`site-config.js` selecciona el ejemplo por defecto. Puedes apuntar `SITE_CONFIG` a otra configuración compatible y usar `SITE_URL` para cambiar el dominio al compilar. Consulta `.env.example`; las variables utilizadas por Vite pueden guardarse en `.env.local`. El servidor `serve` recibe sus variables del entorno del proceso.

## Lista VIP funcional

Los formularios envían JSON a `newsletter.endpoint`, que por defecto es `/api/newsletter`. El servidor incluido valida correo y consentimiento, evita duplicados y guarda cada alta en `.data/<brand.slug>-subscribers.jsonl`. Solo muestra confirmación tras recibir una respuesta correcta; si falla, conserva el correo y permite reintentar.

El destino puede cambiarse con `NEWSLETTER_DATA_FILE`. Usa almacenamiento persistente, acceso restringido y copias de seguridad en el servidor. El almacenamiento incluido está pensado para una instancia Node; para varias instancias usa una base de datos o un proveedor de suscripciones. Los datos y archivos `.env` están excluidos de Git. La lista guarda suscriptores; no envía campañas de correo.

## Publicar

- **GitHub Pages, ambas webs:** `npm run build:pages` genera `dist-pages/` con una portada, Casa Oliva en `/oliva/` y Mott 32 en `/mott32/`. El dominio es `https://r1.diegoayala.com/`. `npm run check:pages` comprueba las páginas, los recursos, la navegación, los carruseles, las reservas y el comportamiento en móvil dentro de esas rutas. La compilación conserva las dos demostraciones fuera de los buscadores y oculta las suscripciones, ya que Pages no ejecuta la API Node.
- **Publicación automática:** `.github/workflows/pages.yml` compila, verifica y publica las dos webs al actualizar `main`. En Settings → Pages, la fuente debe ser **GitHub Actions**, con `r1.diegoayala.com` como dominio y HTTPS activo. En Cloudflare se utiliza un CNAME `r1` → `diegaless.github.io` con **Solo DNS**. Los cambios de contenido en cualquiera de las dos configuraciones se publican juntos. El repositorio sigue conservando las versiones locales con suscripción para un futuro alojamiento con servidor.
- **Servidor Node:** entrega `dist/` o `dist-template/`, `scripts/serve.mjs`, `server/newsletter.mjs` y `package.json`. Ejecuta `node scripts/serve.mjs dist-template`, por ejemplo. El servidor no necesita dependencias externas en ejecución. Configura HTTPS en el alojamiento y un directorio persistente para las altas.
- **Alojamiento estático:** publica la carpeta compilada. En Netlify o Vercel, usa `npm run build:template` y `dist-template` para la genérica; los archivos incluidos apuntan por defecto al ejemplo. Configura `newsletter.endpoint` con una API real antes de compilar, o desactiva `vip.enabled`. Un alojamiento estático por sí solo no ejecuta la API Node.

Una API alternativa recibe `{ email, consent, site, website }` y confirma con una respuesta HTTP 2xx y `{ "ok": true }`. Debe validar y guardar el consentimiento; si está en otro dominio, habilita CORS para el dominio del restaurante. Nunca incluyas claves privadas en la configuración que recibe el navegador.

## Comprobaciones

```bash
npm test
npm run build:all
npx playwright install chromium --only-shell
```

Con cada versión servida, ejecuta:

```bash
CHECK_URL=http://127.0.0.1:4173 npm run check
CHECK_URL=http://127.0.0.1:4173 npm run check:responsive
CHECK_URL=http://127.0.0.1:4173 npm run check:flows
CHECK_URL=http://127.0.0.1:4173 npm run check:carousels
CHECK_URL=http://127.0.0.1:4173 npm run check:links
```

Repite con el puerto 4174 para la genérica. En PowerShell, asigna `$env:CHECK_URL` antes de los comandos. Para estas pruebas usa un `NEWSLETTER_DATA_FILE` temporal: la comprobación del formulario crea una suscripción de prueba `@example.invalid`.

Las pruebas cubren sustitución completa de locales, altas/bajas de platos, HTML sin marca heredada, metadatos, enlaces y anclas, almacenamiento de suscripciones, imágenes rotas, diez tamaños de pantalla, ventanas de reserva, filtros y errores del formulario. Las galerías interiores se comprueban tanto al pulsar una foto como al arrastrar. La integración continua compila y prueba ambas versiones.

Los carruseles de portada del ejemplo se configuran en `examples/home-carousels.js`, con la selección y fotografías de la referencia Mott 32. En Casa Oliva, la galería se deriva de `menu.items`, por lo que cambia con la carta. Todas las fotos comparten el mismo ancho, alto y alineación, con un encuadre de proporción 2:3 y un tamaño limitado según la altura de la pantalla. La ampliación conserva la imagen original. Los controles funcionan con una selección corta, un único local y carruseles circulares. Las pruebas comprueban el tamaño uniforme, el espacio ocupado, el centrado de los locales, ambos extremos o una vuelta completa, el teclado y la ampliación de fotos.
