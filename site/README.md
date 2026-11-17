# Lara Costa — protótipo do e-commerce

Protótipo estático (HTML/CSS/JS puro, sem build) que serve como **referência visual e de
comportamento** antes da montagem em WordPress + WooCommerce + Elementor.

## Como abrir

```bash
cd site
python3 -m http.server 8000
# http://localhost:8000/index.html
```

## Páginas

| Arquivo | O que é |
|---|---|
| `index.html` | Home editorial |
| `loja.html` | Listagem com filtros e ordenação |
| `produto.html` | Página de produto (galeria, grade, frete, guia de medidas) |
| `sacola.html` | Sacola com cupom, frete grátis progressivo e totais |
| `checkout.html` | Checkout em 3 etapas com validação |
| `obrigado.html` | Confirmação do pedido |
| `a-loja.html` | Institucional: história, pilares, endereço e horário |

## Estrutura

```
assets/
  css/estilo.css          tokens de marca + todos os componentes
  js/catalogo.js          dados dos produtos (fonte única)
  js/carrinho.js          estado da sacola, totais, cupons, localStorage
  js/loja.js              header, menu mobile, galeria, filtros, toast
  js/pagina-sacola.js     render da sacola
  js/pagina-checkout.js   validação (CPF, cartão Luhn) e totais reativos
  img/                    imagens (placeholders gerados + logos)
```

## Regras de negócio implementadas

- Frete grátis a partir de **R$ 299**; abaixo disso, R$ 24,90
- **Retirada na loja** dispensa o frete
- **Pix** com 5% de desconto
- Até **6x sem juros**
- Cupons de demonstração: `BEMVINDA10` (10%) e `FRETEGRATIS`
- Quantidade por item limitada a 9

## Testes

As suítes rodam sobre o DOM real (jsdom), simulando cliques e digitação:

```bash
npm install jsdom --no-save
node tests/base.test.js       # menu, galeria, filtros, favoritar
node tests/carrinho.test.js   # estado, totais, cupons, persistência
node tests/checkout.test.js   # CPF, cartão (Luhn), máscaras, fluxo completo
```

## O que é simulado

- Pagamento, frete e cupons são **simulados no navegador** — não há backend
- As fotos são placeholders gerados; os dados ficam em `catalogo.js`
- O pedido final é gravado em `sessionStorage` (nenhum dado sai do dispositivo)

## Próximo passo: portar para WooCommerce

Os tokens de cor e tipografia estão em `:root` no topo de `estilo.css`. Em
`marca/guia-marca-lara-costa.md` há o mapeamento para *Elementor → Global Colors/Fonts*.
