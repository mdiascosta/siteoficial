const { JSDOM } = require('jsdom');
const fs = require('fs');
let ok = 0, fail = 0;
const t = (nome, cond, extra='') => {
  if (cond) { ok++; console.log('  ✅', nome); }
  else { fail++; console.log('  ❌', nome, extra); }
};

async function carregar(arquivo) {
  try { window.localStorage.clear(); } catch(e) {}
  const dom = new JSDOM(fs.readFileSync(arquivo,'utf8'), { runScripts:'outside-only', pretendToBeVisual:true });
  const { window } = dom;
  window.HTMLElement.prototype.scrollIntoView = () => {};
  window.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  window.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  window.eval(fs.readFileSync('assets/js/loja.js','utf8'));
  return window;
}

(async () => {
  /* ---------- PRODUTO ---------- */
  console.log('\n=== produto.html ===');
  let w = await carregar('produto.html');
  let d = w.document;

  // galeria
  const minis = d.querySelectorAll('.galeria__minis button');
  const principal = d.querySelector('.galeria__principal img');
  t('4 miniaturas na galeria', minis.length === 4);
  minis[2].dispatchEvent(new w.MouseEvent('click', {bubbles:true}));
  t('clique na miniatura troca a foto principal',
    principal.src.includes('det-vestido-textura'), principal.src);
  t('miniatura clicada fica aria-selected=true', minis[2].getAttribute('aria-selected')==='true');
  t('as outras ficam false', minis[0].getAttribute('aria-selected')==='false');

  // tamanho
  const tams = d.querySelectorAll('.tam');
  tams[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('selecionar tamanho M atualiza o rótulo', d.querySelector('#tam-escolhido').textContent==='M');

  // cor
  const cores = d.querySelectorAll('.cor-pdp');
  cores[2].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('selecionar cor Oliva atualiza o rótulo', d.querySelector('#cor-escolhida').textContent==='Oliva');

  // quantidade
  d.querySelector('#qtd-mais').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  d.querySelector('#qtd-mais').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('botão + aumenta quantidade para 3', d.querySelector('#qtd').value==='3', d.querySelector('#qtd').value);
  d.querySelector('#qtd-menos').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('botão − diminui para 2', d.querySelector('#qtd').value==='2');
  // não passa de 9 nem abaixo de 1
  for(let i=0;i<20;i++) d.querySelector('#qtd-mais').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('quantidade respeita o máximo 9', d.querySelector('#qtd').value==='9', d.querySelector('#qtd').value);

  // CEP
  const cep = d.querySelector('#cep');
  cep.value='18520000';
  cep.dispatchEvent(new w.Event('input',{bubbles:true}));
  t('máscara de CEP formata 18520-000', cep.value==='18520-000', cep.value);
  d.querySelector('#form-frete').dispatchEvent(new w.Event('submit',{bubbles:true, cancelable:true}));
  const res = d.querySelector('.frete__res');
  t('cálculo de frete mostra Sedex e PAC', res.textContent.includes('Sedex') && res.textContent.includes('PAC'));

  // CEP inválido
  cep.value='123'; cep.dispatchEvent(new w.Event('input',{bubbles:true}));
  d.querySelector('#form-frete').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('CEP inválido exibe aviso', res.textContent.includes('CEP inválido'));

  // adicionar à sacola (agora usa a sacola real, que exige tamanho)
  const badge = d.querySelector('.badge');
  const antes = parseInt(badge.textContent,10) || 0;
  // isola: zera a sacola e volta o rótulo de tamanho para "não escolhido"
  w.LC_Sacola.limpar();
  d.querySelector('#tam-escolhido').textContent = '—';
  d.querySelector('#comprar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('sem tamanho selecionado não adiciona nada', w.LC_Sacola.quantidade()===0, w.LC_Sacola.quantidade());

  d.querySelectorAll('.tam')[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  d.querySelector('#comprar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('adicionar à sacola incrementa o badge',
    parseInt(badge.textContent,10) > antes, badge.textContent);
  t('item entra na sacola com o tamanho escolhido',
    w.LC_Sacola.itens()[0] && w.LC_Sacola.itens()[0].tam==='M');

  /* ---------- LOJA ---------- */
  console.log('\n=== loja.html ===');
  w = await carregar('loja.html'); d = w.document;
  const cont = () => d.querySelector('.loja-barra__cont').textContent;
  const visiveis = () => Array.from(d.querySelectorAll('.produtos--loja .produto'))
                            .filter(p => p.style.display !== 'none');

  t('contagem inicial mostra 8 peças', cont().startsWith('8'), cont());
  t('8 produtos na lista', d.querySelectorAll('.produtos--loja .produto').length===8);

  // filtro por categoria
  const catBolsas = d.querySelector('.filtros input[value="bolsas"]');
  catBolsas.checked = true;
  catBolsas.dispatchEvent(new w.Event('change',{bubbles:true}));
  t('filtrar por Bolsas deixa 1 item', visiveis().length===1, visiveis().length);
  t('contagem atualiza para 1 peça', cont()==='1 peça', cont());

  // limpar
  d.querySelector('#limpar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('limpar filtros volta a 8', visiveis().length===8, visiveis().length);

  // filtro por cor
  const corOliva = d.querySelector('.filtros__cores button[data-cor="oliva"]');
  corOliva.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('filtro de cor oliva deixa 1 item', visiveis().length===1, visiveis().length);
  corOliva.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('clicar de novo desativa o filtro', visiveis().length===8);

  // ordenação
  const sel = d.querySelector('#ordenar');
  sel.value='menor'; sel.dispatchEvent(new w.Event('change',{bubbles:true}));
  const precos = Array.from(d.querySelectorAll('.produtos--loja .produto'))
                      .map(p=>parseFloat(p.dataset.preco));
  t('ordenação menor preço é crescente',
    precos.every((v,i)=> i===0 || precos[i-1] <= v), precos.join(','));
  sel.value='maior'; sel.dispatchEvent(new w.Event('change',{bubbles:true}));
  const desc = Array.from(d.querySelectorAll('.produtos--loja .produto')).map(p=>parseFloat(p.dataset.preco));
  t('ordenação maior preço é decrescente',
    desc.every((v,i)=> i===0 || desc[i-1] >= v), desc.join(','));

  // favoritar
  const fav = d.querySelector('.produto__fav');
  fav.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('favoritar marca aria-pressed', fav.getAttribute('aria-pressed')==='true');
  t('toast aparece ao favoritar', !!d.querySelector('.toast.vis'));

  /* ---------- HOME ---------- */
  console.log('\n=== index.html ===');
  w = await carregar('index.html'); d = w.document;
  const burger = d.querySelector('.burger');
  const gaveta = d.querySelector('#gaveta');
  burger.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('menu mobile abre ao clicar no burger', gaveta.hasAttribute('open'));
  t('burger fica aria-expanded=true', burger.getAttribute('aria-expanded')==='true');
  d.querySelector('.gaveta__fechar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('menu mobile fecha pelo X', !gaveta.hasAttribute('open'));
  t('aria-expanded volta a false', burger.getAttribute('aria-expanded')==='false');

  // newsletter
  const news = d.querySelector('#form-news');
  d.querySelector('#email').value='teste@exemplo.com';
  news.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('newsletter com e-mail válido mostra confirmação',
    d.querySelector('.toast') && d.querySelector('.toast').textContent.includes('Pronto'));

  console.log(`\n${ok} passaram · ${fail} falharam`);
  process.exit(fail ? 1 : 0);
})();
