/* ============================================================
   LARA COSTA — página da sacola
   ============================================================ */
(function () {
  'use strict';

  const S = window.LC_Sacola;
  if (!S) return;

  const $ = (s) => document.querySelector(s);
  const brl = S.brl;

  const lista = $('#lista-itens');
  const cheia = $('#sacola-cheia');
  const vazia = $('#sacola-vazia');
  if (!lista) return;

  let cupomAtual = null;

  /* ---------- Render ---------- */
  function render() {
    const t = S.totais({ cupom: cupomAtual });
    const itens = t.itens;

    cheia.hidden = t.vazio;
    vazia.hidden = !t.vazio;

    /* --- linhas de item --- */
    lista.innerHTML = '';
    itens.forEach((it) => {
      const el = document.createElement('article');
      el.className = 'item';
      el.dataset.chave = it.chave;
      el.innerHTML = `
        <a href="${it.url}" class="item__foto" tabindex="-1" aria-hidden="true">
          <img src="${it.img}" alt="" width="896" height="1200" loading="lazy">
        </a>
        <div>
          <span class="item__cat">${it.cat}</span>
          <a href="${it.url}" class="item__nome">${it.nome}</a>
          <div class="item__variantes">
            <b>Cor:</b> ${it.cor} &nbsp;·&nbsp; <b>Tam:</b> ${it.tam}
          </div>
          <div class="item__controles">
            <div class="qtd">
              <button type="button" data-acao="menos" aria-label="Diminuir quantidade de ${it.nome}">−</button>
              <input type="number" value="${it.qtd}" min="1" max="9" data-acao="qtd"
                     aria-label="Quantidade de ${it.nome}">
              <button type="button" data-acao="mais" aria-label="Aumentar quantidade de ${it.nome}">+</button>
            </div>
            <div class="item__acoes">
              <button type="button" data-acao="remover">Remover</button>
            </div>
          </div>
        </div>
        <div class="item__preco">
          ${brl(it.preco * it.qtd)}
          ${it.precoDe ? `<small>${brl(it.precoDe * it.qtd)}</small>` : ''}
        </div>
      `;
      lista.appendChild(el);
    });

    /* --- progresso do frete grátis --- */
    const msg = $('#msg-frete');
    const barra = $('#barra-frete');
    if (t.freteGratis) {
      msg.innerHTML = '<b>Frete grátis liberado!</b> Aproveite — o frete é por nossa conta.';
      barra.style.width = '100%';
      barra.classList.add('completa');
    } else {
      msg.innerHTML = `Faltam <b>${brl(t.faltamParaFreteGratis)}</b> para você ganhar <b>frete grátis</b>.`;
      const pct = Math.min(100, (t.subtotal / S.regras.freteGratisAcima) * 100);
      barra.style.width = pct + '%';
      barra.classList.remove('completa');
    }

    /* --- resumo --- */
    $('#r-subtotal').textContent = brl(t.subtotal);

    const linhaEco = $('#linha-economia');
    linhaEco.hidden = t.economia <= 0;
    if (t.economia > 0) $('#r-economia').textContent = '− ' + brl(t.economia);

    const linhaCupom = $('#linha-cupom');
    linhaCupom.hidden = !t.cupomValido;
    if (t.cupomValido) {
      $('#r-cupom-rotulo').textContent = 'Cupom ' + cupomAtual.toUpperCase();
      $('#r-cupom').textContent = '− ' + brl(t.descontoCupom);
    }

    const ddFrete = $('#r-frete');
    if (t.freteGratis) {
      ddFrete.textContent = 'Grátis';
      ddFrete.className = 'gratis';
    } else {
      ddFrete.textContent = brl(t.frete);
      ddFrete.className = '';
    }

    $('#r-total').textContent = brl(t.total);
    $('#r-pix').textContent = brl(t.totalPix);
    $('#r-parcela').textContent =
      `ou ${t.parcelasMax}x de ${brl(t.parcela)} sem juros no cartão`;

    /* --- cupom: refletir estado --- */
    const msgCupom = $('#cupom-msg');
    if (cupomAtual && t.cupomValido) {
      msgCupom.className = 'cupom__msg ok';
      msgCupom.textContent = `Cupom aplicado: ${t.cupomRotulo}.`;
    } else if (cupomAtual && !t.cupomValido) {
      msgCupom.className = 'cupom__msg erro';
      msgCupom.textContent = 'Cupom inválido ou expirado.';
    }
  }

  /* ---------- Eventos da lista ---------- */
  lista.addEventListener('click', (e) => {
    const botao = e.target.closest('button[data-acao]');
    if (!botao) return;
    const linha = botao.closest('.item');
    const chave = linha.dataset.chave;
    const acao = botao.dataset.acao;

    if (acao === 'mais') S.alterarQtd(chave, 1);
    if (acao === 'menos') S.alterarQtd(chave, -1);
    if (acao === 'remover') {
      S.remover(chave);
      if (window.LC_toast) window.LC_toast('Item removido da sacola');
      else if (window.LC_Toast) window.LC_Toast('Item removido da sacola');
    }
    render();
  });

  lista.addEventListener('change', (e) => {
    const campo = e.target.closest('input[data-acao="qtd"]');
    if (!campo) return;
    const chave = campo.closest('.item').dataset.chave;
    S.definirQtd(chave, campo.value);
    render();
  });

  /* ---------- Cupom ---------- */
  const btnCupom = $('#aplicar-cupom');
  const campoCupom = $('#cupom');
  const msgCupom = $('#cupom-msg');

  function aplicarCupom() {
    const codigo = (campoCupom.value || '').trim().toUpperCase();
    if (!codigo) {
      msgCupom.className = 'cupom__msg erro';
      msgCupom.textContent = 'Digite um código de cupom.';
      return;
    }
    if (S.regras.cupons[codigo]) {
      cupomAtual = codigo;
      render();
    } else {
      cupomAtual = null;
      render();
      msgCupom.className = 'cupom__msg erro';
      msgCupom.textContent = 'Cupom não encontrado. Tente BEMVINDA10.';
    }
  }

  btnCupom && btnCupom.addEventListener('click', aplicarCupom);
  campoCupom &&
    campoCupom.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        aplicarCupom();
      }
    });

  /* ---------- Cupom vindo de outra página (?cupom=) ---------- */
  const params = new URLSearchParams(location.search);
  const cupomUrl = params.get('cupom');
  if (cupomUrl && S.regras.cupons[cupomUrl.toUpperCase()]) {
    cupomAtual = cupomUrl.toUpperCase();
    if (campoCupom) campoCupom.value = cupomAtual;
  }

  render();

  // Expõe para depuração/uso do checkout
  window.LC_cupomAtual = () => cupomAtual;
})();
