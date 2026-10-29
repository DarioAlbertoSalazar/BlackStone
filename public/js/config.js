/* ══════════════════════════════════════════════════════════════════════════
   BLACKSTONE — CONFIGURACIÓN DEL SITIO
   ──────────────────────────────────────────────────────────────────────────
   Reemplace cada marcador {{...}} por su valor real. Los mismos marcadores
   aparecen también en el HTML (para que Google los lea sin ejecutar JS):
   consulte PENDIENTES.md o use herramientas/reemplazar-marcadores.mjs para
   cambiarlos todos de una sola vez.
   Mientras un valor siga como {{MARCADOR}}, el sitio lo detecta y:
   · no carga Google Analytics,
   · simula el envío del formulario (aviso en la consola del navegador).
   ══════════════════════════════════════════════════════════════════════ */
window.BLACKSTONE = {
  /* Teléfono en formato internacional E.164, sin espacios. Ej.: +528112345678 */
  telefono: '{{TELEFONO}}',
  /* Teléfono como se muestra en pantalla. Ej.: +52 81 1234 5678 */
  telefonoVisible: '{{TELEFONO_VISIBLE}}',
  /* WhatsApp: solo dígitos, con 52 al inicio. Ej.: 528112345678 */
  whatsapp: '{{WHATSAPP}}',
  correo: '{{CORREO}}',
  /* Dominio sin https:// ni diagonal final. Ej.: blackstone.mx */
  dominio: 'blackstonearquitectos.com',
  direccion: '{{DIRECCION}}',
  codigoPostal: '{{CODIGO_POSTAL}}',
  /* ID de medición de Google Analytics 4. Ej.: G-XXXXXXXXXX */
  ga4Id: '{{GA4_ID}}',
  /* URL del servicio de formularios. Ej. Formspree: https://formspree.io/f/abcdwxyz */
  formEndpoint: '{{FORM_ENDPOINT}}'
};
