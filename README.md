# Responsive Resume — Eric Margay (PLUS UX)
Incluye hoja con sombra **siempre visible** (aun en móvil), grid responsivo, **modo oscuro tipografía blanca** con **links azul pastel**, mejora de legibilidad (chips, tarjetas, TOC) y **A4 print**.

## Archivos
- `index.html` — HTML completo con TOC y botón Imprimir.
- `style.css` — Visual refinado (sheet responsivo, pastel links, dark full-white, chips, cards).
- `script.js` — Toggle tema con localStorage y accesibilidad.
- (Opcional) `ResumeCV.pdf` — si lo agregas a la raíz, el link “Download PDF” funciona.

## Rama sugerida
```bash
git checkout -b responsive-plus-ux
git add index.html style.css script.js README.md
git commit -m "Responsive PLUS UX: sheet visible on mobile, dark pastel links, UX polish"
git push -u origin responsive-plus-ux
```
Abre PR a `main`. En **Settings → Pages** deja `main` /root (o como lo tengas).

## Checklist
- [ ] En móvil, ves SIEMPRE el borde/sombra de la “hoja”.
- [ ] Modo oscuro: texto blanco legible, links azul pastel.
- [ ] TOC visible en desktop y oculto en móvil.
- [ ] Chips de skills y tarjetas de awards mejoran la lectura.
- [ ] Print A4 sin sombras ni márgenes extra.
