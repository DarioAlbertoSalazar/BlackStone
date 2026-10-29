#!/usr/bin/env node
/* Blackstone — reemplaza todos los marcadores {{...}} del sitio con los valores
   de herramientas/marcadores.json. Uso (desde la carpeta blackstone-sitio):
     node herramientas/reemplazar-marcadores.mjs           → aplica los cambios
     node herramientas/reemplazar-marcadores.mjs --prueba  → solo muestra qué cambiaría
   Requiere Node 18 o superior. No modifica nada fuera de /public. */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', 'public');
const dry = process.argv.includes('--prueba');
const vals = JSON.parse(readFileSync(join(here, 'marcadores.json'), 'utf8'));
delete vals._instrucciones;

const REDES = ['INSTAGRAM_URL', 'LINKEDIN_URL', 'PINTEREST_URL', 'BEHANCE_URL'];
const OPCIONALES = new Set([...REDES, 'GA4_ID', 'GOOGLE_SITE_VERIFICATION']);
const reglas = {
  DOMINIO: [/^(?!https?:\/\/)[a-z0-9.-]+\.[a-z]{2,}$/i, 'sin https:// ni "/" final, ej. blackstone.mx'],
  TELEFONO: [/^\+52\d{10}$/, 'formato +52 y 10 dígitos, sin espacios, ej. +528112345678'],
  WHATSAPP: [/^52\d{10}$/, 'solo dígitos con 52 al inicio, ej. 528112345678'],
  CORREO: [/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, 'correo válido'],
  CODIGO_POSTAL: [/^\d{5}$/, '5 dígitos'],
  GA4_ID: [/^G-[A-Z0-9]+$/, 'ej. G-ABC123XYZ9'],
  FORM_ENDPOINT: [/^https:\/\//, 'URL https://, ej. https://formspree.io/f/abcdwxyz'],
  GOOGLE_MAPS_URL: [/^https:\/\//, 'URL https:// de su ficha de Google Maps'],
};
for (const k of REDES) reglas[k] = [/^https:\/\//, 'URL https:// del perfil'];

let errores = 0;
for (const [k, v] of Object.entries(vals)) {
  const val = String(v ?? '').trim();
  if (!val) { if (!OPCIONALES.has(k)) { console.warn(`⚠  ${k} vacío: el marcador se queda en el sitio.`); } continue; }
  const r = reglas[k];
  if (r && !r[0].test(val)) { console.error(`✗  ${k} = "${val}" → ${r[1]}`); errores++; }
  if (/["<>]/.test(val)) { console.error(`✗  ${k} contiene comillas o < >, que rompen el HTML/JSON.`); errores++; }
}
if (errores) { console.error(`\n${errores} valor(es) con formato incorrecto. Corríjalos en marcadores.json.`); process.exit(1); }

const EXT = new Set(['.html', '.js', '.xml', '.txt', '.webmanifest']);
const archivos = [];
(function walk(d) { for (const f of readdirSync(d)) { const p = join(d, f); statSync(p).isDirectory() ? walk(p) : EXT.has(extname(p)) && archivos.push(p); } })(root);

const set = Object.fromEntries(Object.entries(vals).map(([k, v]) => [k, String(v ?? '').trim()]));
const redesVacias = REDES.filter(k => !set[k]);

for (const f of archivos) {
  let s = readFileSync(f, 'utf8'); const orig = s;
  /* redes sin usar: quitar su <li> del pie de página */
  for (const k of redesVacias) s = s.replace(new RegExp(`<li><a[^>]*href="\\{\\{${k}\\}\\}"[^>]*>[^<]*</a></li>`, 'g'), '');
  /* redes sin usar: quitar de sameAs del JSON-LD */
  s = s.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/g, (m, a, json, z) => {
    const data = JSON.parse(json);
    for (const n of data['@graph'] || []) if (Array.isArray(n.sameAs)) n.sameAs = n.sameAs.filter(u => !redesVacias.some(k => u === `{{${k}}}`));
    return a + '\n' + JSON.stringify(data, null, 1) + '\n' + z;
  });
  for (const [k, v] of Object.entries(set)) if (v) s = s.split(`{{${k}}}`).join(v);
  /* verificación: el JSON-LD debe seguir siendo válido */
  for (const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(m[1]); } catch (e) { console.error(`✗  JSON-LD inválido en ${relative(root, f)}: ${e.message}`); process.exit(1); }
  }
  if (s !== orig) { console.log(`${dry ? '[prueba] ' : ''}✓  ${relative(root, f)}`); if (!dry) writeFileSync(f, s); }
}
const quedan = new Set();
for (const f of archivos) for (const m of readFileSync(f, 'utf8').matchAll(/\{\{([A-Z0-9_]+)\}\}/g)) if (m[1] !== 'MARCADOR') quedan.add(m[1]);
console.log(dry ? '\nModo prueba: no se escribió nada.' : (quedan.size ? `\nMarcadores pendientes: ${[...quedan].join(', ')}` : '\nListo: no quedan marcadores en el sitio.'));
