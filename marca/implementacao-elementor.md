# Lara Costa — Guia de implementação no Elementor

Como transformar os protótipos de `site/` em um e-commerce real.
**Stack:** WordPress + WooCommerce + Elementor Pro + tema Hello Elementor.

> Leia junto com `guia-marca-lara-costa.md` (paleta, tipografia, CSS de apoio).

---

## 1. Preparação do ambiente

### 1.1 Instalação

| Passo | O que fazer |
|---|---|
| 1 | WordPress limpo, PHP 8.1+, MySQL 8 |
| 2 | Tema **Hello Elementor** (não instale tema de loja pronto — ele sobrescreve o layout) |
| 3 | **WooCommerce** — pular o assistente de configuração, fazer manual |
| 4 | **Elementor** (grátis) + **Elementor Pro** (obrigatório para Theme Builder) |
| 5 | Em *Elementor → Settings → Features*, ativar **Container Flexbox** e **Nested Elements** |

### 1.2 O que o Elementor Pro resolve (e o grátis não)

- Header, footer e **templates de produto/arquivo** pelo Theme Builder
- **WooCommerce Builder** — layout de produto, arquivo e carrinho
- Popup (mini-sacola, aviso de frete grátis)
- Formulários (newsletter, contato)

---

## 2. Global Colors & Fonts

Em **Elementor → Site Settings**. Só faça isso **antes** de montar qualquer página — depois vira retrabalho.

### Cores (nome → hex)

```
Primária           #53381D    Marrom Cacau
Secundária         #6F7360    Oliva Fachada
Texto              #2B2620    Carvão
Acento             #CDA767    Dourado Areia
Fundo              #F7F3EC    Creme Papel
Superfície         #FFFDFA    Branco Quente
Borda              #E8D9BC    Areia Clara
Alerta             #A6503C    Terracota
```

### Fontes

```
Títulos (H1–H4)    Cormorant Garamond    500
Corpo / UI         Jost                  400
Botões             Jost                  500
```

**Escala tipográfica** (Site Settings → Typography): H1 64/40, H2 40/30, H3 24/21, corpo 17/16, botão 14.

---

## 3. Estrutura de páginas no WordPress

| Protótipo | No WordPress |
|---|---|
| `index.html` | Página inicial (`front-page.php` ou página definida em *Configurações → Leitura*) |
| `loja.html` | **Arquivo de produto** do WooCommerce (`/loja/`) — não criar página estática |
| `produto.html` | **Template de produto único** via Theme Builder |
| `sacola.html` | Página do carrinho (`/carrinho/`) — shortcode `[woocommerce_cart]` |
| `checkout.html` | Página de finalização (`/finalizar-compra/`) |
| `obrigado.html` | Página de agradecimento (`/obrigado/`) — *WooCommerce → Configurações → Avançado* |
| `a-loja.html` | Página institucional comum |

> ⚠️ **Não recrie a listagem como página estática.** Use o arquivo de produto do WooCommerce: ele já traz paginação, filtros e SEO corretos.

---

## 4. Header e Footer (Theme Builder)

### Header → Templates → Header → Add New

Estrutura em containers:

```
Container (fundo #FFFDFA, borda inferior 1px #E8D9BC, sticky, padding vertical 14px)
└─ Container interno (3 colunas: menu mobile | logo | ações)
   ├─ Coluna 1: ícone hambúrguer (só mobile)
   ├─ Coluna 2: Site Logo (versão marrom, altura máx. 48px)
   └─ Coluna 3: Nav Menu + ícones (busca, conta, sacola com contador)
```

- **Sticky:** em *Advanced → Motion Effects → Sticky: Top*
- Logo: `site/assets/img/logo-marrom.png` (fundo claro) / `logo-creme.png` (fundo escuro)
- Contador da sacola: widget **Menu Cart** do Elementor Pro

### Header mobile

No Elementor Pro, o **Nav Menu** já tem o toggle mobile. Configure:
- *Layout → Hamburger* e cor do ícone `#2B2620`
- *Content → Menu* com os mesmos itens
- Painel com fundo `#FFFDFA` e itens em Jost 12px / `letter-spacing: .16em`

### Footer

Container fundo `#53381D`, 4 colunas + barra inferior com borda `rgba(232,217,188,.22)`.
Logo creme, títulos das colunas em `#CDA767` 11px `letter-spacing: .2em`.

---

## 5. Produto único (WooCommerce Builder)

**Templates → Product → Add New**

```
Container (2 colunas 1.05fr / 1fr, gap 68px, padding 44px 0)
├─ Coluna esquerda: widget "Product Images" (sticky)
└─ Coluna direita:
   ├─ Breadcrumbs
   ├─ Product Title (H1)
   ├─ Rating
   ├─ Product Price
   ├─ Short Description
   ├─ Add to Cart (com variações)
   ├─ Stock status
   └─ Abas/acordeão: descrição, composição, medidas, trocas
```

### Pontos de atenção

| Item | Como fazer |
|---|---|
| **Swatches de cor** | Plugin *Variation Swatches for WooCommerce* — o WooCommerce puro mostra `select` feio |
| **Tabela de medidas** | Aba personalizada do produto (plugin *Custom Product Tabs*) ou bloco HTML no template |
| **Guia de medidas** | Widget *Toggle/Accordion* com o HTML da tabela |
| **Frete por CEP** | Plugin *Correios/Frenet* — o cálculo do protótipo era simulado |
| **Cross-sell** | Widget *Products* com source "Cross-sells" ou *Related Products* |

---

## 6. Portar o CSS do protótipo

O arquivo `site/assets/css/estilo.css` tem ~990 linhas com os componentes. **Não cole tudo** — isso conflita com o Elementor. Migre por partes:

### 6.1 O que reaproveitar direto

- Tokens em `:root` (cores e fontes)
- Botões (`.btn`, `.btn--ghost`) — melhore o seletor para o Elementor
- Preço, selo de oferta, swatches
- Tabela de medidas

### 6.2 O que descartar

- Reset global (`*, body`, etc.) — o Elementor já cuida
- Estilos de header/footer — refeitos no Theme Builder
- `.revela` (IntersectionObserver) — usar *Motion Effects → Entrance Animation* do Elementor

### 6.3 CSS de produção (exemplo)

```css
/* Aparência → Personalizar → CSS adicional */
:root{
  --lc-marrom:#53381D; --lc-oliva:#6F7360; --lc-dourado:#CDA767;
  --lc-creme:#F7F3EC;  --lc-carvao:#2B2620; --lc-areia:#E8D9BC;
  --lc-terracota:#A6503C;
}

/* Botões do Elementor */
.elementor-button{
  border-radius:2px !important;
  font-family:"Jost",sans-serif !important;
  font-weight:500 !important;
  letter-spacing:.12em;
  text-transform:uppercase;
}
.elementor-button:hover{ background-color:var(--lc-marrom) !important; }

/* Preço em destaque */
.woocommerce-Price-amount{ color:var(--lc-marrom); font-weight:500; }

/* Selo de oferta — único lugar com terracota */
.onsale{
  background:var(--lc-terracota) !important;
  color:#fff !important;
  border-radius:0 !important;
  letter-spacing:.08em;
}

/* Foto de produto com moldura discreta */
.woocommerce ul.products li.product img{
  border:1px solid var(--lc-areia);
  border-radius:2px;
}
```

---

## 7. Regras de negócio a configurar

| Regra | Onde |
|---|---|
| Frete grátis acima de R$ 299 | *WooCommerce → Configurações → Envio* → método "Frete grátis" com valor mínimo |
| Pix com 5% de desconto | Plugin *Pix para WooCommerce* (ex.: Mercado Pago, PagSeguro) ou *Discount Rules* |
| Até 6x sem juros | Configuração do gateway de pagamento (Mercado Pago/PagSeguro) |
| Retirada na loja | *Envio → Local pickup* com endereço de Cerquilho |
| Cupons | *Marketing → Cupons* (`BEMVINDA10` como percentual, `FRETEGRATIS` como frete grátis) |
| Parcelamento exibido | *WooCommerce → Configurações → Geral* + plugin de parcelas |

---

## 8. Plugins por prioridade

**Essenciais**
1. WooCommerce
2. Elementor Pro
3. Variation Swatches for WooCommerce
4. Gateway de pagamento com Pix (Mercado Pago / PagSeguro)
5. Cálculo de frete (Correios, Frenet ou Melhor Envio)

**Importantes**
6. Rank Math (SEO + schema de Product)
7. WP Rocket + Imagify (performance — foto de moda pesa)
8. CheckoutWC (checkout em uma etapa)
9. UpdraftPlus (backup)
10. LGPD Compliance (obrigatório no Brasil)

---

## 9. Checklist de lançamento

- [ ] Logo em **SVG** (o PNG perde nitidez em telas retina)
- [ ] Favicon a partir do monograma "LC"
- [ ] Global Colors/Fonts configurados **antes** de montar páginas
- [ ] Header e Footer no Theme Builder (não em cada página)
- [ ] Template de produto único criado
- [ ] Página de carrinho e checkout usando shortcodes nativos
- [ ] Página de agradecimento configurada no WooCommerce
- [ ] Frete grátis, Pix e cupons testados com pedido real de R$ 1
- [ ] **Teste mobile em aparelho real**, não só no DevTools
- [ ] Compressão WebP + lazy load nas imagens
- [ ] Política de privacidade e banner de cookies
- [ ] Google Analytics / Meta Pixel instalados
- [ ] E-mail transacional (pedido, rastreio) com a identidade da marca
- [ ] Backup automático ativo

---

## 10. Ordem de execução sugerida

1. Ambiente + plugins base
2. Global Colors/Fonts
3. Header e Footer no Theme Builder
4. Página **A loja** (mais simples, valida a identidade)
5. Template de produto único
6. Arquivo de produto + filtros
7. Carrinho e checkout (shortcodes + CheckoutWC)
8. Home montada por último, com o resto já pronto
9. Cadastro dos produtos reais com fotos padronizadas
10. Testes de compra ponta a ponta

---

*Protótipos em `site/`: home, loja, produto, sacola, checkout, confirmação e a loja.*
*Testes automatizados em `site/tests/` — 97 verificações do comportamento esperado.*
