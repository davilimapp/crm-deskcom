import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * O ícone da aba — o logo redondo da marca desta instalação, servido como PNG
 * estático a partir de `public/logo-redonda.png`.
 *
 * ── Por que um arquivo estático, e não o gerador dinâmico de antes ──────────────
 *
 * Até esta onda, `app/icon.tsx` desenhava o símbolo do produto (ou a inicial da
 * marca) em runtime com `ImageResponse` do `@vercel/og`. A marca desta instalação
 * passou a ter um logo redono próprio (`public/logo-redonda.png`), e o ícone da
 * aba deve ser exatamente essa arte — não uma derivação de cor + inicial. O
 * gerador foi substituído por uma leitura direta do arquivo.
 *
 * ── `force-dynamic` continua ──────────────────────────────────────────────────
 *
 * Mesmo servindo bytes estáticos, o loader de metadata NÃO injeta
 * `force-static` sozinho (ver `next-metadata-route-loader.js`). Sem esta linha o
 * `next build` congelaria o conteúdo dentro da imagem pré-buildada — e num
 * produto white-label onde cada instalação tem o seu logo, o ícone de quem
 * buildou iria para a aba de todo revendedor. `force-dynamic` garante que a
 * leitura acontece em runtime, no `public/` da instalação que está rodando.
 *
 * ── O arquivo mora em `public/` ───────────────────────────────────────────────
 *
 * `Dockerfile` copia `public/` para a imagem final (medido: `public/` entra no
 * contêiner runner), então `readFileSync` resolve em dev e na VPS. O
 * `Cache-Control` abaixo mantém uma renderização por minuto por navegador em
 * vez de uma por navegação.
 */

export const dynamic = "force-dynamic";

/** 64 e não 32: a aba pede 16-32 CSS px, e em tela retina isso são 32-64 reais. */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Lido uma vez por requisição (force-dynamic); o `Cache-Control` guarda a saída. */
const ARQUIVO = join(process.cwd(), "public", "logo-redonda.png");

// 60s é deliberado, e o par com o TTL da marca: o operador que troca o arquivo vê
// a aba acompanhar dentro de um minuto. Um `immutable` de um ano tornaria a
// troca do logo uma promessa que o ícone não cumpre; `no-store` faria a leitura a
// cada navegação.
const CACHE = { "cache-control": "public, max-age=60, stale-while-revalidate=600" };

export default function Icon(): Response {
  const buf = readFileSync(ARQUIVO);
  return new Response(buf, { headers: { ...CACHE, "Content-Type": contentType } });
}
