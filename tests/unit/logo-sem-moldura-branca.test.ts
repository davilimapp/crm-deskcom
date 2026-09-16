/**
 * NENHUMA SUPERFÍCIE PINTA FUNDO BRANCO ATRÁS DO LOGO DE QUEM HOSPEDA.
 *
 * ═══ A HISTÓRIA ═══
 *
 * O PR #659 introduziu um chip `dark:bg-white` em volta do `<img>` do logo para
 * que arte escura não sumisse contra `--color-surface` escuro (`#1d1c17`). Era
 * uma troca declarada: pior caso "moldura branca de sobra" aceito para evitar
 * pior caso "logo invisível".
 *
 * O pior caso aceito virou o defeito real: arte clara desenhada PARA fundo
 * escuro — o logo da Zenfy — ganhava um retângulo branco em volta em toda
 * superfície do tema escuro. A decisão agora é o inverso da anterior: nenhuma
 * superfície pinta fundo atrás do logo, em tema nenhum; o contraste da arte
 * enviada é responsabilidade de quem a envia.
 *
 * As três superfícies que desenham o logo do operador precisam concordar —
 * consertar uma só devolveria a moldura nas outras duas:
 *
 *   1. a barra lateral do app          (`components/shell/Sidebar.tsx`)
 *   2. a tela de entrada               (`app/(public)/layout.tsx`)
 *   3. a PRÉVIA da tela de marca       (`components/branding/CampoDeLogo.tsx`)
 *
 * A terceira acompanha as outras duas por construção: se o app real não desenha
 * moldura, uma prévia que a desenhasse deixaria de ser prévia — o operador
 * aprovaria na tela de marca uma coisa e receberia outra no produto.
 *
 * ═══ ⚠️ ESTE TESTE É UMA CERCA, NÃO UMA PROVA ═══
 *
 * O modo de a moldura voltar em silêncio é o mesmo de sempre: reembrulhar o
 * `<img>` numa div `dark:bg-white` não gera conflito de merge, não muda tipo
 * nenhum, e nada na tela grita. A cerca lê a FONTE — com comentários removidos,
 * para que menção em prosa não passe por classe — e reprova qualquer `bg-white`
 * que volte a morar nesses arquivos. O que ela NÃO faz é medir pixel num
 * navegador — isso é Playwright com `getComputedStyle`, em
 * `tests/e2e/logo-moldura-no-tema-escuro.spec.ts`.
 *
 * As duas primeiras superfícies seguem o tema DO APP (`@custom-variant dark`
 * sobre `data-theme`, `app/globals.css`). A cerca não distingue `dark:bg-white`
 * de `bg-white` de propósito: um chip pintado só no claro seria o mesmo defeito
 * com o sinal trocado.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const RAIZ = join(__dirname, "..", "..");
const leia = (rel: string) => readFileSync(join(RAIZ, rel), "utf8");

/**
 * Tira comentário para que uma menção em prosa não satisfaça a cerca.
 *
 * Cobre comentários de linha também — a cerca anterior só tirava os de bloco,
 * mas a prosa que justifica esta decisão MENCIONA a classe removida, e sem
 * isso a própria documentação da remoção reprovaria a cerca. O `[^:]` antes
 * da barra evita amputar `https:` dentro de string.
 */
const semComentario = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");

describe("o logo do operador não ganha moldura branca", () => {
  it("a BARRA LATERAL não pinta fundo atrás do logo", () => {
    const fonte = semComentario(leia("components/shell/Sidebar.tsx"));

    expect(
      fonte,
      "voltou a haver `bg-white`/`dark:bg-white` na barra lateral — a moldura " +
        "que pinta um retângulo branco em volta do logo em algum tema",
    ).not.toMatch(/(^|[^a-z-])((dark:)?bg-white)([^a-z-]|$)/);
  });

  it("a TELA DE ENTRADA não pinta fundo atrás do logo", () => {
    // O login também respeita `data-theme` — o `ThemeProvider` embrulha a raiz
    // inteira (`app/layout.tsx`), a fachada inclusa.
    const fonte = semComentario(leia("app/(public)/layout.tsx"));

    expect(
      fonte,
      "voltou a haver `bg-white`/`dark:bg-white` na tela de entrada — a moldura " +
        "que pinta um retângulo branco em volta do logo em algum tema",
    ).not.toMatch(/(^|[^a-z-])((dark:)?bg-white)([^a-z-]|$)/);
  });

  it("a PRÉVIA da tela de marca não desenha moldura na caixa escura", () => {
    // Aqui a moldura antiga era incondicional (`bg-white` sem `dark:`) porque as
    // duas caixas convivem no MESMO tema real — ver o cabeçalho. A cerca vale
    // igual: a prévia tem de mostrar o logo exatamente como o app o desenha.
    const fonte = semComentario(leia("components/branding/CampoDeLogo.tsx"));

    expect(
      fonte,
      "voltou a haver `bg-white` na prévia do logo — ela deixaria de prever o " +
        "que o app desenha (o app não pinta fundo atrás do logo)",
    ).not.toMatch(/(^|[^a-z-])((dark:)?bg-white)([^a-z-]|$)/);
  });

  it("CONTROLE: as três superfícies continuam sendo as três que desenham o logo do operador", () => {
    // Se uma quarta tela passar a desenhar `<img src={logo}>`, esta cerca fica
    // com escopo velho sem avisar — que é exatamente o modo de falha que o
    // `barra-lateral-nao-perde-o-sticky` registra. O número aqui é MEDIDO, não
    // chutado: em 2026-09-11, na prévia do merge do PR #659, `logoUrl`/`logo`
    // chegava a um `<img>` em exatamente três arquivos.
    const SUPERFICIES = [
      "components/shell/Sidebar.tsx",
      "app/(public)/layout.tsx",
      "components/branding/CampoDeLogo.tsx",
    ];
    for (const arquivo of SUPERFICIES) {
      expect(semComentario(leia(arquivo)), `${arquivo} deixou de desenhar o logo`).toMatch(/<img\b/);
    }
  });
});
