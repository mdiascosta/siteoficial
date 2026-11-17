# Lara Costa — Guia de Marca para E-commerce
### Paleta, tipografia e setup WordPress + WooCommerce + Elementor

> **Base de análise:** cores amostradas dos arquivos `logotipo-oficial.png` e `fachada-loja.png`.
> Todos os hexadecimais abaixo foram **extraídos por amostragem de pixels**, não escolhidos "a olho".

---

## 1. O que a marca já comunica

Três sinais claros nas imagens:

| Sinal | Leitura para o e-commerce |
|---|---|
| **Marrom-cacau** do logo | Luxo acessível, couro, madeira, atemporal. Não é "moda fast-fashion". |
| **Fachada oliva** com letreiro creme | Paleta terrosa, orgânica, "boutique de bairro" — acolhimento, não frieza de shopping. |
| **Logo em serifa alta + subtítulo em sans espaçada** | Contraste editorial clássico: elegância (serifa) + modernidade limpa (sans). |

**Posicionamento que a identidade visual pede:** boutique de moda feminina *curada*, com atendimento próximo. O site deve parecer uma **vitrine de loja física** — fotos grandes, respiro, pouca cor berrante, preço legível.

> ⚠️ Consistência: o logo em uso tem o preenchimento **marrom** (`#53381D`), mas o arquivo enviado é branco. Ao aplicar sobre fundos claros, use a **versão marrom**; a branca fica reservada para fundos escuros. Vale gerar os dois SVG definitivos antes de subir o site.

---

## 2. Paleta de cores

### 2.1 Cores de marca (as que já existem)

| Uso | Nome | HEX | RGB | Origem |
|---|---|---|---|---|
| **Primária** | Marrom Cacau | `#53381D` | 83, 56, 29 | Extraído do logotipo |
| **Secundária** | Oliva Fachada | `#6F7360` | 111, 115, 96 | Extraído da parede |
| **Acento** | Dourado Areia | `#CDA767` | 205, 167, 103 | Extraído das linhas do logo |

### 2.2 Neutros e apoio

| Uso | Nome | HEX | Função |
|---|---|---|---|
| Fundo principal | Creme Papel | `#F7F3EC` | Fundo de página (padrão do site) |
| Superfície | Branco Quente | `#FFFDFA` | Cards, header, modais |
| Texto principal | Carvão | `#2B2620` | Parágrafos e títulos (não use preto puro) |
| Texto secundário | Marrom Areia | `#7B6752` | Legendas, breadcrumbs, metadados |
| Bordas | Areia Clara | `#E8D9BC` | Divisórias, bordas de input |
| Oliva escuro | Oliva Profundo | `#4A4D40` | Footer, faixas de destaque |
| Alerta / promo | Terracota | `#A6503C` | Selo "-30%", frete grátis, urgência |
| Sucesso | Oliva Médio | `#5C6B4F` | "Adicionado ao carrinho", estoque ok |

### 2.3 Regra de proporção (60‑30‑10)

Para o site não ficar "marrom demais" nem parecer loja de artesanato:

```
60%  Creme #F7F3EC        fundo, respiro
30%  Marrom #53381D       textos fortes, header, footer, botões
10%  Dourado #CDA767      detalhes: linhas, ícones, hover, selos
     Oliva #6F7360        apoio pontual (categorias, badges neutros)
     Terracota #A6503C    usado com MUITA parcimônia — só desconto/urgência
```

### 2.4 Contrastes validados (WCAG 2.1)

| Combinação | Ratio | Status |
|---|---|---|
| Marrom `#53381D` sobre Creme `#F7F3EC` | 9.73 | ✅ **AAA** |
| Carvão `#2B2620` sobre Creme | 13.55 | ✅ **AAA** |
| Creme sobre Marrom (botão primário) | 9.73 | ✅ **AAA** |
| Areia `#E8D9BC` sobre Marrom | 7.73 | ✅ **AAA** |
| Marrom Areia `#7B6752` sobre Creme | 4.86 | ✅ AA |
| Terracota `#A6503C` sobre Creme | 4.95 | ✅ AA |
| Branco sobre Oliva `#6F7360` | 4.81 | ✅ AA |
| **Dourado `#CDA767` sobre Creme** | **2.04** | ❌ **Reprovado como texto** |

> 🚨 **Regra de ouro:** o dourado **nunca** é cor de texto sobre creme/branco. Use só em linhas, ícones grandes, bordas e ornamentos. Quando precisar de dourado legível, coloque-o **sobre o marrom** (4.78 = AA). Para "texto dourado" em títulos, escureça para `#8C6A32`.

---

## 3. Tipografia

### 3.1 Recomendação principal — dupla gratuita (Google Fonts)

| Papel | Fonte | Peso | Por quê |
|---|---|---|---|
| **Display / Títulos** | **Cormorant Garamond** | 500 · 600 | Alto contraste, eixos finos, serifa elegante. Casa com o logo e funciona no hero em tamanho grande. Alternativa: *Playfair Display*. |
| **Corpo / UI** | **Jost** | 300 · 400 · 500 | Geométrica com toque humanista, próxima do sans do "ROUPAS E ACESSÓRIOS". Excelente em botões e preços. Alternativa: *Montserrat* (mais neutra) ou *Inter* (melhor legibilidade em telas pequenas). |

**Por que não repetir a fonte do logo:** a serifa do logo é pesada/didone (estilo Trajan). Repetir no site cansa a leitura em blocos longos. Cormorant entrega o mesmo *clima* com mais leveza.

### 3.2 Emparelhamento alternativo (se quiser mais "moda contemporânea")

- Títulos: **Bodoni Moda** (didone forte) + Corpo: **Karla**
- Ou: Títulos: **Fraunces** (serifa com personalidade) + Corpo: **Work Sans**

### 3.3 Escala tipográfica (desktop → mobile)

| Elemento | Fonte | Desktop | Mobile | Peso | Entrelinha |
|---|---|---|---|---|---|
| H1 hero | Cormorant Garamond | 64px | 40px | 500 | 1.1 |
| H2 seção | Cormorant Garamond | 40px | 30px | 500 | 1.2 |
| H3 / nome do produto | Cormorant Garamond | 24px | 21px | 600 | 1.3 |
| Corpo | Jost | 17px | 16px | 400 | 1.7 |
| Botão | Jost | 14px | 14px | 500 | 1.0 · `letter-spacing: .12em` · MAIÚSCULAS |
| Preço | Jost | 19px | 17px | 500 | 1.0 |
| Eyebrow / categoria | Jost | 12px | 11px | 500 | `letter-spacing: .22em` · MAIÚSCULAS |
| Legenda / selo | Jost | 13px | 12px | 400 | 1.4 |

> O `letter-spacing` largo em maiúsculas é **herança direta do logo** ("ROUPAS E ACESSÓRIOS") — use como assinatura visual em eyebrows, botões e menus.

---

## 4. Aplicação no site (o que fica onde)

| Área | Fundo | Texto | Detalhes |
|---|---|---|---|
| Header | `#FFFDFA` com `border-bottom: 1px #E8D9BC` | Carvão | Logo marrom; menu em Jost 12px maiúsculas espaçadas |
| Hero | Foto full-width da loja/produto | `#F7F3EC` sobre overlay marrom 55% | H1 em Cormorant, CTA botão marrom |
| Faixa de benefícios | `#53381D` | `#E8D9BC` | Ícones em dourado |
| Grade de produtos | `#F7F3EC` | Carvão + preço em Marrom | Cards em `#FFFDFA`, hover eleva sombra suave |
| Selo de desconto | Terracota `#A6503C` | Branco | Só aqui a terracota aparece |
| Página de produto | `#FFFDFA` | Carvão | Preço marrom, "Comprar" marrom sólido |
| Footer | `#4A4D40` ou `#53381D` | `#E8D9BC` | Linha dourada fina no topo |

**Botões:**
- Primário: fundo `#53381D`, texto `#F7F3EC`, `border-radius: 2px` (cantos quase retos = mais sofisticado), hover `#6B4A28`
- Secundário (outline): borda 1px `#53381D`, texto `#53381D`, hover preenche marrom
- ❌ Evite `border-radius: 20px+` e sombras fortes — quebram o ar de boutique

**Fotografia:** fundo creme/areia, luz natural, sem saturação artificial. A fachada oliva + o letreiro creme são o cenário perfeito para editoriais ("look do dia" na porta da loja).

---

## 5. Stack WordPress: especificação técnica

### 5.1 Plugins essenciais

| Função | Plugin | Nota |
|---|---|---|
| Loja | **WooCommerce** | Base |
| Construtor | **Elementor Pro** | Pro é necessário para Theme Builder (header/footer/product templates) + WooCommerce Builder |
| Tema base | **Hello Elementor** | Levíssimo; o visual sai 100% no Elementor |
| Extra de produto | **Variation Swatches for WooCommerce** | Cor/tamanho em bolinhas — essencial em moda |
| Checkout | **CheckoutWC** ou o checkout em blocos nativo | Reduz abandono |
| Frete | **Correios / Frenet / Melhor Envio** | Cálculo por CEP |
| Pagamento | **Mercado Pago + PagSeguro** (Pix, cartão, boleto) | Pix é decisivo no Brasil |
| Performance | **WP Rocket** + **Imagify/ShortPixel** (WebP) | Imagem de moda é pesada |
| SEO | **Rank Math** | Schema de Product automático |
| LGPD | **LGPD Compliance** (ou cookie banner) | Obrigatório no BR |
| Backup | **UpdraftPlus** | Antes de qualquer mudança no Elementor |

### 5.2 Tokens para colar em *Elementor → Site Settings → Global Colors / Global Fonts*

Salve como **Globals** (não use hex solto em cada widget — isso salva horas depois):

```
Cor Primária       #53381D    Marrom Cacau
Cor Secundária     #6F7360    Oliva Fachada
Cor de Texto       #2B2620    Carvão
Cor de Acento      #CDA767    Dourado Areia
Fundo              #F7F3EC    Creme Papel
Fundo Alternativo  #FFFDFA    Branco Quente
Borda              #E8D9BC    Areia Clara
Alerta             #A6503C    Terracota
```

```
Fonte de Títulos   Cormorant Garamond  500
Fonte de Corpo     Jost                400
Fonte de Botões    Jost                500
```

### 5.3 CSS de apoio (Elementor → Custom CSS ou tema filho)

```css
:root{
  --lc-marrom:#53381D; --lc-oliva:#6F7360; --lc-dourado:#CDA767;
  --lc-creme:#F7F3EC;  --lc-branco:#FFFDFA; --lc-carvao:#2B2620;
  --lc-areia:#E8D9BC;  --lc-terracota:#A6503C;
}

/* Assinatura tipográfica herdada do logo */
.lc-eyebrow, .elementor-button, .woocommerce-loop-product__title{
  letter-spacing:.12em; text-transform:uppercase;
}

/* Botões de boutique */
.elementor-button, .single_add_to_cart_button{
  border-radius:2px !important;
  font-family:"Jost",sans-serif;
  font-weight:500;
  letter-spacing:.12em;
  text-transform:uppercase;
  transition:background .25s ease, color .25s ease;
}

/* Preço em destaque */
.woocommerce-Price-amount{ color:var(--lc-marrom); font-weight:500; }

/* Foto de produto com moldura discreta */
.woocommerce ul.products li.product img{
  border:1px solid var(--lc-areia); border-radius:2px;
}

/* Selo de oferta — único lugar com terracota */
.onsale{
  background:var(--lc-terracota) !important; color:#fff !important;
  border-radius:0 !important; letter-spacing:.08em;
}

/* Linha dourada ornamental (divisorias) */
.lc-divider{ height:1px; background:var(--lc-dourado); opacity:.6; }
```

### 5.4 Estrutura de páginas sugerida

1. **Home** — Hero editorial → Categorias (3 cards) → Novidades → Faixa de benefícios (marrom) → "Conheça a loja" (foto da fachada) → Instagram/Depoimentos
2. **Loja / Categoria** — filtros em sidebar discreta, 3 colunas desktop / 2 mobile
3. **Produto** — galeria grande à esquerda, compra à direita, swatches de cor/tamanho, guia de medidas, "Combina com"
4. **Sobre** — a fachada oliva como hero + história da marca (humaniza e converte)
5. **Contato / Onde estamos** — mapa + WhatsApp flutuante

---

## 6. Próximos passos

- [ ] Gerar `logo-marrom.svg` e `logo-branco.svg` vetoriais (o PNG perde nitidez no header)
- [ ] Definir favicon a partir do monograma "LC" da placa redonda
- [ ] Validar a dupla Cormorant + Jost no hero antes de montar todo o site
- [ ] Sessão de fotos com fundo creme/oliva para padronizar o catálogo
- [ ] Instalar WordPress + WooCommerce + Hello Elementor + Elementor Pro e configurar as Globals acima

---

*Arquivos de origem da análise:* `marca/assets/logotipo-oficial.png`, `marca/assets/fachada-loja.png`
