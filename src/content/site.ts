/**
 * CONTEÚDO FIXO DO SITE — edite aqui e rode `./lukwolfly.sh update`.
 * (Galeria, quadro, progresso e vagas são editados pelo painel /admin.)
 */
export const site = {
  name: "Lukwolfly",
  full: "Lukwolfly Atelier & Art",
  url: process.env.SITE_URL || "http://localhost:3000",
  description:
    "Ateliê furry brasileiro: fursuits sob medida, pelúcias de personagem, acessórios e artes digitais — headshot, fullbody, referência e badges.",
  instagram: { handle: "@lukwolfly_arts", url: "https://instagram.com/lukwolfly_arts" },
  /** troque pelo @ real quando tiver */
  telegram: { handle: "@lukwolfly", url: "https://t.me/lukwolfly" },
  city: "Brasil",
};

export const nav = [
  { href: "/fursuits", label: "Fursuits", n: "01" },
  { href: "/artes", label: "Artes", n: "02" },
  { href: "/pelucias", label: "Pelúcias", n: "03" },
  { href: "/acessorios", label: "Acessórios", n: "04" },
  { href: "/agenda", label: "Agenda", n: "05" },
] as const;

/* ─── artes digitais ─────────────────────────────────────── */

export const artPrices = [
  { id: "headshot", name: "Headshot", price: 50, blurb: "Cabeça e ombros, fundo simples.", image: "arte-headshot-cavalo" },
  { id: "halfbody", name: "Halfbody", price: 100, blurb: "Da cintura pra cima, com pose e expressão.", image: "arte-halfbody-hiena" },
  { id: "fullbody", name: "Fullbody", price: 160, blurb: "Corpo inteiro, pose livre.", image: null },
  { id: "referencia", name: "Referência", price: 250, blurb: "Ref sheet frente/costas + paleta de cores.", image: "arte-ref-m4jor" },
  { id: "badge-digital", name: "Badge digital", price: 80, blurb: "Arquivo pronto pra imprimir onde quiser.", image: "arte-badge-seth" },
  { id: "badge-fisica", name: "Badge física", price: 100, blurb: "Impressa e plastificada, com cordão.", image: "arte-badge-joy" },
] as const;

export const artExtras = [
  { label: "Personagem extra", price: 40 },
  { label: "Versão NSFW (18+)", price: 40 },
];

/* ─── fursuits ───────────────────────────────────────────── */

export const fursuitTypes = [
  { name: "Head", detail: "Cabeça com base em espuma, olhos follow-me e ventilação." },
  { name: "Mini partial", detail: "Head + patas das mãos + cauda." },
  { name: "Partial", detail: "Head + mãos + pés + cauda." },
  { name: "Fullsuit", detail: "Macacão completo, digitigrade ou plantigrade." },
];

/** Comparativo genérico — ajuste os textos à realidade do ateliê. */
export const furComparison = {
  rows: [
    { k: "Toque", nacional: "Mais firme, ótimo para áreas lisas e detalhes.", internacional: "Macio e sedoso, cai e balança com o movimento." },
    { k: "Comprimento", nacional: "Pelo curto a médio, poucas opções longas.", internacional: "Do curto ao shag longo, com efeito luxo." },
    { k: "Densidade", nacional: "Menor — a base pode aparecer ao esticar.", internacional: "Alta, cobre bem mesmo em áreas curvas." },
    { k: "Cores", nacional: "Paleta limitada ao que tem no mercado.", internacional: "Catálogo enorme, tons vibrantes e degradês." },
    { k: "Durabilidade", nacional: "Boa, mas embola mais com o uso.", internacional: "Excelente, mantém o aspecto por mais tempo." },
    { k: "Prazo", nacional: "Compra rápida, começa logo.", internacional: "Importação: soma semanas e taxas ao prazo." },
    { k: "Custo", nacional: "Mais acessível.", internacional: "Mais alto (câmbio + frete + impostos)." },
  ],
  note: "Dá pra misturar: pelo internacional onde aparece mais (cabeça, cauda) e nacional nas áreas de apoio. Valor sob consulta.",
};

/* ─── pelúcias ───────────────────────────────────────────── */

export const plush = {
  height: "~60 cm",
  regular: 600,
  promo: 300,
  promoRule: "se eu já tiver as cores em mão",
};

/* ─── processo de encomenda ─────────────────────────────── */

export const steps = [
  { t: "Você manda o pedido", d: "Nome, e-mail, Telegram e as referências do personagem." },
  { t: "Orçamento", d: "Respondo com valor, prazo e o que for preciso definir." },
  { t: "Sinal & fila", d: "Com o sinal pago, seu pedido entra na agenda pública." },
  { t: "Acompanhamento", d: "Cada etapa aparece na agenda, com fotos/rascunhos no Telegram." },
];
