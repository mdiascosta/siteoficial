const { JSDOM } = require('jsdom');
const fs = require('fs');
let ok=0, fail=0;
const t=(n,c,e='')=>{ if(c){ok++;console.log('  ✅',n);} else {fail++;console.log('  ❌',n,e);} };

const store = {};
const localStorageMock = {
  getItem:k=>k in store?store[k]:null,
  setItem:(k,v)=>{store[k]=String(v);},
  removeItem:k=>{delete store[k];}, clear:()=>{Object.keys(store).forEach(k=>delete store[k]);}
};
const sessionStore = {};
const sessionMock = {
  getItem:k=>k in sessionStore?sessionStore[k]:null,
  setItem:(k,v)=>{sessionStore[k]=String(v);}, removeItem:k=>{delete sessionStore[k];}
};

function abrir(pagina, url='http://localhost/checkout.html') {
  const dom = new JSDOM(fs.readFileSync(pagina,'utf8'), {url, runScripts:'outside-only', pretendToBeVisual:true});
  const w = dom.window;
  Object.defineProperty(w,'localStorage',{value:localStorageMock,configurable:true});
  Object.defineProperty(w,'sessionStorage',{value:sessionMock,configurable:true});
  w.HTMLElement.prototype.scrollIntoView=()=>{};
  w.HTMLInputElement.prototype.focus=function(){};
  return w;
}


// Semeia a sacola para o checkout não cair no estado vazio
function semear() {
  Object.keys(store).forEach(k=>delete store[k]);
  store['lc_sacola_v1'] = JSON.stringify([{
    chave:'bolsa-couro-caramelo|Chocolate|Único', id:'bolsa-couro-caramelo',
    cor:'Chocolate', tam:'Único', qtd:1, nome:'Bolsa Couro Caramelo',
    cat:'Bolsas', preco:549, precoDe:null,
    img:'assets/img/prod-bolsa.jpg', url:'produto.html'
  }]);
}

console.log('\n=== Validação de CPF ===');
{ semear(); }
{
  const w = abrir('checkout.html');
  w.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  w.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  w.eval(fs.readFileSync('assets/js/pagina-checkout.js','utf8'));
  const d = w.document;

  // CPF válido conhecido: 111.444.777-35
  const setar = (id,v) => { const el=d.getElementById(id); el.value=v; el.dispatchEvent(new w.Event('input',{bubbles:true})); el.dispatchEvent(new w.Event('blur')); };
  const invalido = id => d.getElementById(id).closest('.campo').classList.contains('invalido');

  setar('cpf','111.444.777-35');
  t('CPF válido 111.444.777-35 é aceito', !invalido('cpf'));

  setar('cpf','111.444.777-36');
  t('CPF com dígito errado é rejeitado', invalido('cpf'));

  setar('cpf','111.111.111-11');
  t('CPF com dígitos repetidos é rejeitado', invalido('cpf'));

  setar('cpf','123');
  t('CPF incompleto é rejeitado', invalido('cpf'));

  console.log('\n=== Máscaras ===');
  setar('cpf','11144477735');
  t('máscara de CPF formata', d.getElementById('cpf').value==='111.444.777-35', d.getElementById('cpf').value);

  setar('telefone','15999887766');
  t('máscara de telefone celular', d.getElementById('telefone').value==='(15) 99988-7766', d.getElementById('telefone').value);

  setar('telefone','1533334444');
  t('máscara de telefone fixo', d.getElementById('telefone').value==='(15) 3333-4444', d.getElementById('telefone').value);

  setar('cep','18520000');
  t('máscara de CEP', d.getElementById('cep').value==='18520-000', d.getElementById('cep').value);

  console.log('\n=== Validação de e-mail e nome ===');
  setar('email','teste@exemplo.com');
  t('e-mail válido aceito', !invalido('email'));
  setar('email','teste@@exemplo');
  t('e-mail inválido rejeitado', invalido('email'));
  setar('nome','Maria');
  t('nome sem sobrenome rejeitado', invalido('nome'));
  setar('nome','Maria Silva Santos');
  t('nome completo aceito', !invalido('nome'));
}

console.log('\n=== Cartão de crédito (Luhn) ===');
{
  semear();
  const w = abrir('checkout.html');
  w.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  w.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  w.eval(fs.readFileSync('assets/js/pagina-checkout.js','utf8'));
  const d = w.document;
  const setar=(id,v)=>{const el=d.getElementById(id);el.value=v;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
  const invalido=id=>d.getElementById(id).closest('.campo').classList.contains('invalido');

  // 4111 1111 1111 1111 é o cartão de teste clássico (passa Luhn)
  setar('cartao-num','4111111111111111');
  t('máscara de cartão agrupa em 4', d.getElementById('cartao-num').value==='4111 1111 1111 1111', d.getElementById('cartao-num').value);

  // validade
  setar('cartao-val','1230');
  t('máscara de validade MM/AA', d.getElementById('cartao-val').value==='12/30', d.getElementById('cartao-val').value);

  // submissão sem dados -> deve barrar
  let bloqueou = false;
  d.getElementById('form-checkout').addEventListener('submit', ()=>{}); 
  d.getElementById('form-checkout').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  t('submit com campos vazios marca erros',
    d.getElementById('nome').closest('.campo').classList.contains('invalido'));
}

console.log('\n=== Fluxo completo de compra ===');
{
  // 1. adiciona itens numa "sessão" (produto -> sacola)
  Object.keys(store).forEach(k=>delete store[k]);   // isolamento entre blocos
  let w = abrir('produto.html','http://localhost/produto.html');
  w.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  w.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  w.eval(fs.readFileSync('assets/js/loja.js','utf8'));
  let d = w.document;
  const S = w.LC_Sacola;

  // seleciona tamanho e adiciona
  d.querySelectorAll('.tam')[1].dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  d.querySelector('#qtd').value='2';
  d.querySelector('#comprar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('produto: adicionado à sacola pelo botão', S.quantidade()===2, S.quantidade());
  t('produto: mini-sacola de confirmação aparece', !!d.querySelector('#mini-sacola.vis'));

  // tentar comprar sem tamanho
  S.limpar();
  w = abrir('produto.html','http://localhost/produto.html');
  w.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  w.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  w.eval(fs.readFileSync('assets/js/loja.js','utf8'));
  d = w.document;
  d.querySelector('#comprar').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  t('produto: bloqueia compra sem tamanho', w.LC_Sacola.quantidade()===0);

  // 2. checkout com sacola cheia
  w.LC_Sacola.limpar();
  w.LC_Sacola.adicionar('bolsa-couro-caramelo',{qtd:1}); // 549 -> frete grátis
  const w2 = abrir('checkout.html');
  w2.eval(fs.readFileSync('assets/js/catalogo.js','utf8'));
  w2.eval(fs.readFileSync('assets/js/carrinho.js','utf8'));
  w2.eval(fs.readFileSync('assets/js/pagina-checkout.js','utf8'));
  const d2 = w2.document;

  t('checkout: resumo lista o item', d2.querySelectorAll('.mini').length===1);
  t('checkout: frete grátis acima de 299', d2.querySelector('#c-frete').textContent==='Grátis');
  // Pix vem selecionado por padrão, então o total já sai com os 5% de desconto
  const valorNaTela = () => parseFloat(
    d2.querySelector('#c-total').textContent.replace(/[^\d,]/g,'').replace(',','.')
  );
  t('checkout: Pix aplica 5% por padrão (549 -> 521,55)',
    Math.abs(valorNaTela() - 521.55) < 0.01, d2.querySelector('#c-total').textContent);
  t('checkout: linha de desconto Pix visível', !d2.querySelector('#c-linha-pix').hidden);
  t('checkout: desconto Pix é de 27,45',
    d2.querySelector('#c-pix-desc').textContent.includes('27,45'),
    d2.querySelector('#c-pix-desc').textContent);

  // trocar para cartão -> desconto some
  const cartao = d2.querySelector('input[name="pagamento"][value="cartao"]');
  cartao.checked = true;
  cartao.dispatchEvent(new w2.Event('change',{bubbles:true}));
  t('checkout: cartão remove o desconto Pix (volta a 549)',
    Math.abs(valorNaTela() - 549) < 0.01, d2.querySelector('#c-total').textContent);
  t('checkout: campos do cartão aparecem', !d2.querySelector('#detalhe-cartao').hidden);
  t('checkout: parcelamento tem 6 opções', d2.querySelector('#parcelas').options.length===6,
     d2.querySelector('#parcelas').options.length);

  // trocar para retirada
  const ret = d2.querySelector('input[name="entrega"][value="retirada"]');
  ret.checked = true;
  ret.dispatchEvent(new w2.Event('change',{bubbles:true}));
  t('checkout: retirada mantém frete zero', d2.querySelector('#c-frete').textContent.includes('Retirada'));

  console.log('\n=== Submissão válida gera pedido ===');
  const preencher=(id,v)=>{const el=d2.getElementById(id);el.value=v;el.dispatchEvent(new w2.Event('input',{bubbles:true}));};
  preencher('nome','Maria Silva Santos');
  preencher('email','maria@exemplo.com');
  preencher('telefone','15999887766');
  preencher('cpf','11144477735');
  preencher('cep','18520000');
  preencher('cidade','Cerquilho');
  preencher('endereco','Rua das Acácias, 240');

  // volta para pix
  const pixRadio = d2.querySelector('input[name="pagamento"][value="pix"]');
  pixRadio.checked = true;
  pixRadio.dispatchEvent(new w2.Event('change',{bubbles:true}));

  d2.getElementById('form-checkout').dispatchEvent(new w2.Event('submit',{bubbles:true,cancelable:true}));
  const pedido = JSON.parse(sessionMock.getItem('lc_pedido')||'null');
  t('pedido salvo na sessão', !!pedido);
  t('pedido tem número LC-', pedido && /^LC-\d{6}$/.test(pedido.numero), pedido&&pedido.numero);
  t('pedido registra pagamento pix', pedido && pedido.pagamento==='pix');
  t('pedido tem o total com desconto Pix', pedido && Math.abs(pedido.total-521.55)<0.01, pedido&&pedido.total);
  t('sacola é esvaziada após o pedido', w2.LC_Sacola.quantidade()===0, w2.LC_Sacola.quantidade());
}

console.log(`\n${ok} passaram · ${fail} falharam`);
process.exit(fail?1:0);
