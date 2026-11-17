const { JSDOM } = require('jsdom');
const fs = require('fs');
let ok=0, fail=0;
const t=(n,c,e='')=>{ if(c){ok++;console.log('  ✅',n);} else {fail++;console.log('  ❌',n,e);} };

// ---- storage compartilhado entre "páginas" ----
const store = {};
const localStorageMock = {
  getItem:k=>k in store ? store[k] : null,
  setItem:(k,v)=>{store[k]=String(v);},
  removeItem:k=>{delete store[k];},
  clear:()=>{Object.keys(store).forEach(k=>delete store[k]);}
};

function abrir(pagina, url='http://localhost/') {
  const dom = new JSDOM(fs.readFileSync(pagina,'utf8'), {
    url, runScripts:'outside-only', pretendToBeVisual:true
  });
  const w = dom.window;
  Object.defineProperty(w, 'localStorage', { value: localStorageMock, configurable:true });
  w.HTMLElement.prototype.scrollIntoView = ()=>{};
  return w;
}
function carregarScripts(w, arquivos) {
  arquivos.forEach(f => w.eval(fs.readFileSync(f,'utf8')));
}

(async () => {
  console.log('\n=== 1. Sacola: lógica de estado ===');
  let w = abrir('sacola.html');
  carregarScripts(w, ['assets/js/catalogo.js','assets/js/carrinho.js']);
  const S = w.LC_Sacola;

  t('sacola começa vazia', S.itens().length===0);
  t('8 produtos no catálogo', Object.keys(w.LC_CATALOGO).length===8);

  S.adicionar('vestido-midi-linho', {cor:'Caramelo', tam:'M', qtd:1});
  t('adicionar 1 item', S.itens().length===1 && S.quantidade()===1);

  S.adicionar('vestido-midi-linho', {cor:'Caramelo', tam:'M', qtd:2});
  t('mesma combinação soma quantidade (1+2=3)',
    S.itens().length===1 && S.quantidade()===3, S.quantidade());

  S.adicionar('vestido-midi-linho', {cor:'Oliva', tam:'M', qtd:1});
  t('cor diferente cria linha separada', S.itens().length===2);

  S.adicionar('bolsa-couro-caramelo', {cor:'Chocolate', tam:'Único', qtd:1});
  t('3 linhas na sacola', S.itens().length===3);

  // persistência
  const bruto = localStorageMock.getItem('lc_sacola_v1');
  t('estado persistido no localStorage', !!bruto && JSON.parse(bruto).length===3);

  console.log('\n=== 2. Sacola: totais e regras ===');
  S.limpar();
  S.adicionar('brincos-dourados', {qtd:1}); // 129
  let T = S.totais({frete:24.9});
  t('subtotal 129', Math.abs(T.subtotal-129)<0.01, T.subtotal);
  t('abaixo de 299 cobra frete', T.frete===24.9 && !T.freteGratis);
  t('faltam 170 para frete grátis', Math.abs(T.faltamParaFreteGratis-170)<0.01, T.faltamParaFreteGratis);
  t('total = subtotal + frete', Math.abs(T.total-(129+24.9))<0.01, T.total);

  S.adicionar('bolsa-couro-caramelo', {qtd:1}); // 549 -> 678
  T = S.totais({frete:24.9});
  t('acima de 299: frete grátis', T.freteGratis && T.frete===0, T.frete);
  t('total vira subtotal', Math.abs(T.total-T.subtotal)<0.01);

  // retirada na loja
  T = S.totais({frete:24.9, retirada:true});
  t('retirada na loja dispensa frete', T.frete===0);

  console.log('\n=== 3. Cupons ===');
  S.limpar(); S.adicionar('bolsa-couro-caramelo',{qtd:1}); // 549
  T = S.totais({cupom:'BEMVINDA10'});
  t('cupom BEMVINDA10 dá 10%', Math.abs(T.descontoCupom-54.9)<0.01, T.descontoCupom);
  t('cupom válido marcado', T.cupomValido===true);
  T = S.totais({cupom:'NAOEXISTE'});
  t('cupom inválido não desconta', T.descontoCupom===0 && T.cupomValido===false);
  T = S.totais({cupom:'FRETEGRATIS', frete:24.9});
  t('cupom FRETEGRATIS zera o frete', T.frete===0);

  console.log('\n=== 4. Pix 5% ===');
  S.limpar(); S.adicionar('bolsa-couro-caramelo',{qtd:1});
  T = S.totais({pix:true});
  t('desconto Pix é 5% do subtotal', Math.abs(T.descontoPix-27.45)<0.01, T.descontoPix);
  t('totalPix = total - desconto', Math.abs(T.totalPix-(549-27.45))<0.01, T.totalPix);
  t('parcela em 6x', Math.abs(T.parcela-549/6)<0.01);

  console.log('\n=== 5. Página da sacola: render ===');
  S.limpar();
  S.adicionar('vestido-midi-linho', {cor:'Caramelo', tam:'M', qtd:2});
  S.adicionar('brincos-dourados', {qtd:1});
  w = abrir('sacola.html');
  carregarScripts(w, ['assets/js/catalogo.js','assets/js/carrinho.js','assets/js/pagina-sacola.js']);
  let d = w.document;
  t('2 linhas renderizadas', d.querySelectorAll('.item').length===2, d.querySelectorAll('.item').length);
  // 272,30 x2 = 544,60 + 129,00 = 673,60
  t('subtotal exibido corretamente', d.querySelector('#r-subtotal').textContent.includes('673,60'), d.querySelector('#r-subtotal').textContent);
  t('mensagem de frete grátis', d.querySelector('#msg-frete').textContent.includes('Frete grátis liberado'));
  t('barra de progresso em 100%', d.querySelector('#barra-frete').style.width==='100%');
  t('badge do header mostra 3', d.querySelector('.badge').textContent==='3', d.querySelector('.badge').textContent);
  t('falta nada para frete grátis', d.querySelector('#r-frete').textContent==='Grátis');

  // remover item
  const btnRemover = d.querySelector('.item [data-acao="remover"]');
  btnRemover.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('remover item deixa 1 linha', d.querySelectorAll('.item').length===1);

  // alterar quantidade
  const mais = d.querySelector('.item [data-acao="mais"]');
  mais.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('botão + aumenta quantidade', S.itens()[0].qtd===2, S.itens()[0].qtd);
  const menos = d.querySelector('.item [data-acao="menos"]');
  menos.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  menos.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('quantidade não desce de 1', S.itens()[0].qtd===1);

  // cupom pela interface
  d.querySelector('#cupom').value='bemvinda10';
  d.querySelector('#aplicar-cupom').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('cupom aplicado pela UI', !d.querySelector('#linha-cupom').hidden);
  d.querySelector('#cupom').value='XXX';
  d.querySelector('#aplicar-cupom').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('cupom inválido mostra erro', d.querySelector('#cupom-msg').className.includes('erro'));

  // esvaziar
  S.limpar();
  w = abrir('sacola.html');
  carregarScripts(w, ['assets/js/catalogo.js','assets/js/carrinho.js','assets/js/pagina-sacola.js']);
  d = w.document;
  t('sacola vazia mostra estado vazio', !d.querySelector('#sacola-vazia').hidden);
  t('estado cheio fica oculto', d.querySelector('#sacola-cheia').hidden);

  console.log(`\n${ok} passaram · ${fail} falharam`);
  process.exit(fail?1:0);
})();
