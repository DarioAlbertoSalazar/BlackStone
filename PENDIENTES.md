# Blackstone — pendientes antes de publicar

Sitio listo para producción. Lo único que falta son datos reales del despacho. Esta guía dice qué reemplazar, dónde aparece y cómo publicarlo.

```
blackstone-sitio/
├── PENDIENTES.md                 ← este archivo (no se publica)
├── herramientas/                 ← no se publica
│   ├── marcadores.json           ← aquí se escriben los valores reales
│   └── reemplazar-marcadores.mjs ← los aplica en todo el sitio
└── public/                       ← SOLO esta carpeta se sube al hosting
    ├── index.html, 404.html, aviso-de-privacidad.html
    ├── robots.txt, sitemap.xml, site.webmanifest, .htaccess
    ├── favicon.ico, favicon.svg, apple-touch-icon.png
    ├── css/styles.css
    ├── js/config.js, js/main.js
    ├── fonts/ (Archivo, autoalojada)
    └── img/ (WebP + JPG en varios tamaños, íconos, imagen para redes)
```

---

## 1. Marcadores por reemplazar

### Forma rápida (recomendada)

1. Abra `herramientas/marcadores.json` y escriba cada valor.
2. Desde la carpeta `blackstone-sitio`, ejecute:
   - `node herramientas/reemplazar-marcadores.mjs --prueba`, para ver qué cambiaría sin escribir nada.
   - `node herramientas/reemplazar-marcadores.mjs`, para aplicar los cambios.
3. El script valida los formatos (teléfono, dominio, código postal, etc.). Si algo está mal escrito, se detiene y no modifica ningún archivo.
4. Al terminar confirma que el JSON-LD sigue siendo válido y lista los marcadores que todavía falten.

Si no usa Pinterest o Behance (u otra red), deje su valor vacío (`""`). El script la quita del pie de página y de los datos estructurados.

### Forma manual

Use buscar y reemplazar en su editor, en toda la carpeta `public/`.

### Tabla de marcadores

| Marcador | Qué es | Formato / ejemplo | Archivos |
|---|---|---|---|
| `{{DOMINIO}}` | Dominio del sitio | `blackstone.mx`, sin `https://` ni `/` final | index.html, aviso-de-privacidad.html, robots.txt, sitemap.xml, js/config.js |
| `{{TELEFONO}}` | Teléfono para enlaces `tel:` y schema | `+528112345678`: +52 y 10 dígitos, sin espacios | index.html, aviso-de-privacidad.html, js/config.js |
| `{{TELEFONO_VISIBLE}}` | Teléfono como se lee en pantalla | `+52 81 1234 5678` | index.html, aviso-de-privacidad.html, js/config.js |
| `{{WHATSAPP}}` | Número de WhatsApp para `wa.me` | `528112345678`: solo dígitos, con 52 | index.html (botón flotante y pie), js/config.js |
| `{{CORREO}}` | Correo de contacto y de derechos ARCO | `contacto@blackstone.mx` | index.html, aviso-de-privacidad.html, js/config.js |
| `{{RAZON_SOCIAL}}` | Nombre legal (aviso de privacidad, ©, schema) | `Blackstone Arquitectura S.C.` | index.html, aviso-de-privacidad.html |
| `{{DIRECCION}}` | Calle y número | `Av. Ricardo Margáin 444, piso 3` | index.html, aviso-de-privacidad.html, js/config.js |
| `{{COLONIA}}` | Colonia | `Valle del Campestre` | index.html, aviso-de-privacidad.html |
| `{{CODIGO_POSTAL}}` | C.P. | `66265` | index.html, aviso-de-privacidad.html, js/config.js |
| `{{GOOGLE_MAPS_URL}}` | Enlace de su ficha en Google Maps (botón "Cómo llegar" y `hasMap`) | En Google Maps: su negocio > Compartir > Copiar vínculo | index.html |
| `{{GA4_ID}}` | ID de medición de Google Analytics 4 | `G-XXXXXXXXXX` | js/config.js |
| `{{GOOGLE_SITE_VERIFICATION}}` | Código de verificación de Search Console (método "Etiqueta HTML") | Solo el valor de `content="…"` | index.html |
| `{{FORM_ENDPOINT}}` | URL del servicio de formularios | `https://formspree.io/f/abcdwxyz` | index.html, js/config.js |
| `{{INSTAGRAM_URL}}` | Perfil de Instagram | `https://www.instagram.com/…` | index.html (pie y schema) |
| `{{LINKEDIN_URL}}` | Página de LinkedIn | `https://www.linkedin.com/company/…` | index.html (pie y schema) |
| `{{PINTEREST_URL}}` | Perfil de Pinterest | `https://www.pinterest.com.mx/…` | index.html (pie y schema) |
| `{{BEHANCE_URL}}` | Perfil de Behance | `https://www.behance.net/…` | index.html (pie y schema) |

> **Mientras un marcador siga sin reemplazar:** Google Analytics no se carga y el formulario simula el envío. En la consola del navegador verá un aviso: `FORM_ENDPOINT sin configurar`. Así puede probar el sitio antes de tener los datos.

### Valores fijos que conviene revisar

Estos valores no son marcadores, pero conviene confirmarlos:

- **Coordenadas.** Hoy están en el centro de Monterrey (`25.6866, -100.3161`) como valor provisional. Aparecen en `index.html`: JSON-LD `geo`, meta `geo.position` / `ICBM` y el mapa del pie de página (`iframe` de OpenStreetMap). Sustitúyalas por las del estudio. Puede reemplazar el `iframe` por el mapa insertado de su ficha de Google Maps (Compartir > Insertar un mapa) y mantener `loading="lazy"` y el `title`.
- **Horario.** L–V 9:00–18:00 y sáb 10:00–13:00. Aparece en el pie, en el formulario (horarios del calendario, en `js/main.js`: `WEEK` y `SAT`) y en el JSON-LD (`openingHoursSpecification`). Debe coincidir con Google Business Profile.
- **Rango de precios.** `"priceRange": "$$$"` en el JSON-LD.
- **Fecha del aviso de privacidad.** "28 de octubre de 2026", en `aviso-de-privacidad.html`.

---

## 2. Contenido que debe validar (importante)

El diseño original traía contenido de ejemplo ubicado en la Ciudad de México. Se reubicó en Monterrey para que sea coherente con el SEO local, pero **sigue siendo contenido de ejemplo**:

- **Portafolio:** Casa Encino, Torre Cristal, Interior Cumbres, Casa Sierra Madre, Campus Norte y Edificio Barrio Antiguo. Sustitúyalos por proyectos reales: nombre, ubicación, tipo y año.
- **Fotografías:** deben ser de proyectos propios o tener licencia de uso. Los textos `alt` dicen "diseñada por Blackstone"; si una foto no es de un proyecto propio, cambie el `alt`.
- **Testimonios:** use solo testimonios reales y con autorización del cliente. Publicar testimonios inventados es publicidad engañosa (Ley Federal de Protección al Consumidor) y también afecta la confianza.
- **Cifras:** fundación en 2004, 22 años, 38 profesionales, 340+ proyectos y 410,000 m². Confírmelas. `foundingDate` también está en el JSON-LD.
- **Preguntas frecuentes:** confirme plazos y alcances. Si cambia un texto, cámbielo **también** en el JSON-LD (`FAQPage`), porque deben coincidir palabra por palabra.

Para cambiar imágenes, conserve el esquema de nombres (`nombre-descriptivo-480.webp`, `-800`, `-1100`, `-1400`, más sus `.jpg`). Los anchos máximos son 1400 px, y 1900 px en el hero. Herramienta gratuita sugerida: squoosh.app.

---

## 3. Formulario (Formspree o similar)

1. Cree una cuenta en formspree.io y luego un formulario nuevo.
2. Copie la URL (`https://formspree.io/f/…`) en `{{FORM_ENDPOINT}}`.
3. En el panel de Formspree, confirme el correo que recibirá las solicitudes.
4. Envíe una solicitud de prueba desde el sitio publicado.

**Campos que recibirá:** nombre, correo, telefono, tipo, ubicacion, superficie, presupuesto, fecha, fecha_legible, hora, mensaje, privacidad. El asunto se genera automáticamente con el nombre del cliente, y al responder el correo le contesta directamente al cliente.

**Anti-spam:**

- Campo trampa invisible (`_gotcha`), que Formspree reconoce de forma nativa. Si usa otro servicio (Getform, Basin, etc.), cambie el `name` del campo `#f-web` en `index.html` al que ese servicio indique.
- Filtro de tiempo: los envíos hechos en menos de 3 segundos se descartan.

---

## 4. Google Analytics 4

1. Cree la propiedad en analytics.google.com y copie el ID de medición en `{{GA4_ID}}`.
2. Eventos que ya envía el sitio:
   - `generate_lead`: solicitud de cita enviada con éxito. Incluye tipo de proyecto y rango de presupuesto, sin datos personales.
   - `whatsapp_click`, `phone_click` y `email_click`. Incluyen `link_location`, que indica desde dónde se hizo clic: whatsapp-flotante, cita, footer, menu o barra-movil.
3. En GA4, vaya a **Administrar > Eventos** y marque `generate_lead`, `whatsapp_click` y `phone_click` como **eventos clave** (conversiones).

GA4 se carga después de que la página termina de cargar, así que no afecta la velocidad.

---

## 5. Aviso de privacidad

`aviso-de-privacidad.html` es un texto base que sigue la estructura de la LFPDPPP:

- Responsable.
- Datos que se recaban.
- Finalidades primarias y secundarias.
- Transferencias.
- Derechos ARCO.
- Cookies.
- Cambios al aviso.

El formulario abre una versión simplificada en un diálogo, con enlace al aviso integral. **Pida a un abogado que lo revise** antes de publicar, sobre todo los plazos ARCO y las finalidades.

---

## 6. Pasos para publicar

1. **Reemplace los marcadores** (sección 1) y valide el contenido (sección 2).
2. **Pruebe en local** con un servidor; no abra el archivo con doble clic.
   - `npx serve public` (o `cd public && python3 -m http.server 8000`).
   - Abra http://localhost:3000 (u 8000).
3. **Suba solo la carpeta `public/`** al hosting. Cualquiera de estas opciones funciona sin configuración extra:
   - **Netlify** o **Cloudflare Pages**: arrastre la carpeta `public` o conecte el repositorio con "publish directory" = `public`. Sirven `404.html` y HTTPS automáticamente.
   - **Vercel**: Output directory = `public`.
   - **Hosting con cPanel o Apache** (Hostinger, GoDaddy, etc.): suba el contenido de `public/` a `public_html/`, incluido el archivo oculto `.htaccess` (HTTPS, 404, caché y compresión).
4. **Conecte el dominio** y verifique que funcione con `https://`. Elija una sola versión (con o sin `www`) y redirija la otra.
5. **Revise en producción:**
   - https://pagespeed.web.dev, para Core Web Vitals.
   - https://search.google.com/test/rich-results y https://validator.schema.org, para los datos estructurados.
   - Compartir el enlace en WhatsApp, para revisar la vista previa con la imagen OG.
   - Una URL inexistente, para ver la página 404.
   - Un envío real del formulario.

## 7. Después de publicar (lo que más acelera aparecer en Monterrey)

1. **Google Search Console.** Agregue la propiedad, verifíquela con la etiqueta HTML (`{{GOOGLE_SITE_VERIFICATION}}`) y envíe `https://SU-DOMINIO/sitemap.xml`. Luego use "Inspección de URL" sobre la portada y pulse "Solicitar indexación".
2. **Google Business Profile.** Es el factor más importante para salir en el mapa y en "arquitectos cerca de mí".
   - Categoría principal: *Arquitecto*.
   - Secundarias: *Diseñador de interiores* y *Contratista de remodelaciones*.
   - Área de servicio: los 8 municipios del sitio.
   - Agregue horario, fotos reales de proyectos y el enlace al sitio.
   - Luego copie el enlace de la ficha en `{{GOOGLE_MAPS_URL}}`.
3. **Mismos datos en todas partes (NAP).** Nombre, dirección y teléfono deben escribirse exactamente igual en el sitio, en Google Business Profile, en Facebook, en Instagram y en directorios (Bing Places, Apple Business Connect, Sección Amarilla, Houzz).
4. **Reseñas.** Pida a clientes reales que dejen reseña en Google y respóndalas todas. No agregue calificaciones con estrellas al schema del propio sitio: Google no las muestra para reseñas publicadas por el mismo negocio.
5. **Contenido a mediano plazo.** Una página por proyecto real (por ejemplo `/proyectos/casa-encino-san-pedro.html`) y por servicio (por ejemplo `/remodelacion-de-casas-monterrey.html`) aporta más palabras clave locales que una sola página. Cada página nueva se agrega a `sitemap.xml`.

> **Expectativa realista:** Google suele indexar un sitio nuevo en días, pero posicionar búsquedas competidas como "arquitectos en Monterrey" toma semanas o meses. Lo que más pesa es Google Business Profile, las reseñas y la constancia de los datos. El sitio ya cumple la parte técnica.

> Nota: los datos estructurados `FAQPage` son válidos, pero desde 2023 Google solo muestra preguntas frecuentes como resultado enriquecido para sitios de gobierno y salud. Aun así ayudan a que Google entienda la página.
