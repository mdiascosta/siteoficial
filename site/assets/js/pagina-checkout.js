/* ============================================================
   LARA COSTA — checkout
   Validação de CPF/CEP/cartão + totais reativos + confirmação
   ============================================================ */
(function () {
  'use strict';

  const S = window.LC_Sacola;
  const form = document.getElementById('form-checkout');
  if (!S || !form) return;

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const brl = S.brl;

  /* ============================================================
     VALIDADORES
     ============================================================ */
  const val = {
    nome(v) {
      return (v || '').trim().length >= 5 && (v || '').trim().includes(' ');
    },
    email(v) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((v || '').trim());
    },
    telefone(v) {
      const d = (v || '').replace(/\D/g, '');
      return d.length >= 10 && d.length <= 11;
    },
    /** CPF com dígitos verificadores */
    cpf(v) {
      const c = (v || '').replace(/\D/g, '');
      if (c.length !== 11) return false;
      if (/^(\d)\1{10}$/.test(c)) return false;
      let soma = 0;
      for (let i = 0; i < 9; i++) soma += parseInt(c[i], 10) * (10 - i);
      let dv1 = (soma * 10) % 11;
      if (dv1 === 10) dv1 = 0;
      if (dv1 !== parseInt(c[9], 10)) return false;
      soma = 0;
      for (let i = 0; i < 10; i++) soma += parseInt(c[i], 10) * (11 - i);
      let dv2 = (soma * 10) % 11;
      if (dv2 === 10) dv2 = 0;
      return dv2 === parseInt(c[10], 10);
    },
    cep(v) {
      return (v || '').replace(/\D/g, '').length === 8;
    },
    cidade(v) {
      return (v || '').trim().length >= 2;
    },
    endereco(v) {
      return (v || '').trim().length >= 5;
    },
    uf(v) {
      return !!(v || '').trim();
    },
    /** Luhn */
    cartao(v) {
      const n = (v || '').replace(/\D/g, '');
      if (n.length < 13 || n.length > 16) return false;
      let soma = 0, alt = false;
      for (let i = n.length - 1; i >= 0; i--) {
        let d = parseInt(n[i], 10);
        if (alt) {
          d *= 2;
          if (d > 9) d -= 9;
        }
        soma += d;
        alt = !alt;
      }
      return soma % 10 === 0;
    },
    validade(v) {
      const m = /^(\d{2})\/(\d{2})$/.exec((v || '').trim());
      if (!m) return false;
      const mes = parseInt(m[1], 10);
      const ano = 2000 + parseInt(m[2], 10);
      if (mes < 1 || mes > 12) return false;
      const hoje = new Date();
      const exp = new Date(ano, mes, 0, 23, 59, 59);
      return exp >= hoje;
    },
    cvv(v) {
      return /^\d{3,4}$/.test((v || '').trim());
    },
  };

  /* ============================================================
     MÁSCARAS
     ============================================================ */
  const mascaras = {
    telefone(v) {
      let d = v.replace(/\D/g, '').slice(0, 11);
      if (d.length > 6) return `(${d.slice(0,2)}) ${d.slice(2, d.length > 10 ? 7 : 6)}-${d.slice(d.length > 10 ? 7 : 6)}`;
      if (d.length > 2) return `(${d.slice(0,2)}) ${d.slice(2)}`;
      if (d.length > 0) return `(${d}`;
      return '';
    },
    cpf(v) {
      const d = v.replace(/\D/g, '').slice(0, 11);
      if (d.length > 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
      if (d.length > 6) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
      if (d.length > 3) return `${d.slice(0,3)}.${d.slice(3)}`;
      return d;
    },
    cep(v) {
      const d = v.replace(/\D/g, '').slice(0, 8);
      return d.length > 5 ? `${d.slice(0,5)}-${d.slice(5)}` : d;
    },
    cartao(v) {
      const d = v.replace(/\D/g, '').slice(0, 16);
      return d.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    },
    validade(v) {
      const d = v.replace(/\D/g, '').slice(0, 4);
      return d.length > 2 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
    },
  };

  const mapaMascara = {
    telefone: mascaras.telefone,
    cpf: mascaras.cpf,
    cep: mascaras.cep,
    'cartao-num': mascaras.cartao,
    'cartao-val': mascaras.validade,
  };

  Object.keys(mapaMascara).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', () => {
      const pos = el.selectionStart;
      const antes = el.value.length;
      el.value = mapaMascara[id](el.value);
      // mantém o cursor previsível
      if (el.selectionStart === antes && pos !== null) {
        el.setSelectionRange(el.value.length, el.value.length);
      }
    });
  });

  /* ============================================================
     ESTADO DO FORMULÁRIO
     ============================================================ */
  const params = new URLSearchParams(location.search);
  let cupom = params.get('cupom') || null;
  if (cupom && !S.regras.cupons[cupom.toUpperCase()]) cupom = null;
  if (cupom) cupom = cupom.toUpperCase();

  const entregaValor = () => {
    const sel = form.querySelector('input[name="entrega"]:checked');
    return sel ? sel.value : 'sedex';
  };
  const pagamentoValor = () => {
    const sel = form.querySelector('input[name="pagamento"]:checked');
    return sel ? sel.value : 'pix';
  };

  /* ============================================================
     RENDER DO RESUMO
     ============================================================ */
  function totaisAtuais() {
    const modo = entregaValor();
    const retirada = modo === 'retirada';
    const freteBase = modo === 'pac' || retirada ? 0 : S.regras.fretePadrao;
    return S.totais({ cupom: cupom, frete: freteBase, retirada: retirada, pix: false });
  }

  function render() {
    const t = totaisAtuais();
    const pix = pagamentoValor() === 'pix';

    // itens
    const box = $('#resumo-itens');
    box.innerHTML = '';
    t.itens.forEach((it) => {
      const el = document.createElement('div');
      el.className = 'mini';
      el.innerHTML = `
        <img src="${it.img}" alt="" width="52" height="69" loading="lazy">
        <div>
          <b>${it.nome}</b>
          <span>${it.cor} · ${it.tam} · ${it.qtd}x</span>
        </div>
        <em>${brl(it.preco * it.qtd)}</em>
      `;
      box.appendChild(el);
    });

    $('#c-subtotal').textContent = brl(t.subtotal);

    const lc = $('#c-linha-cupom');
    lc.hidden = !t.cupomValido;
    if (t.cupomValido) $('#c-cupom').textContent = '− ' + brl(t.descontoCupom);

    const ddFrete = $('#c-frete');
    const modo = entregaValor();
    if (t.freteGratis) {
      ddFrete.textContent = modo === 'retirada' ? 'Retirada na loja' : 'Grátis';
      ddFrete.className = 'gratis';
    } else {
      ddFrete.textContent = brl(t.frete);
      ddFrete.className = '';
    }

    // Pix: recalcula com desconto
    let total = t.total;
    let descontoPix = 0;
    if (pix && !t.vazio) {
      descontoPix = (t.total - t.frete) * S.regras.descontoPix;
      total = t.total - descontoPix;
    }

    const lp = $('#c-linha-pix');
    lp.hidden = !pix || descontoPix <= 0;
    if (!lp.hidden) $('#c-pix-desc').textContent = '− ' + brl(descontoPix);

    $('#c-total').textContent = brl(total);

    const parcela = total / S.regras.parcelasMax;
    $('#c-parcela').textContent = pix
      ? `à vista no Pix · economize ${brl(descontoPix)}`
      : `ou ${S.regras.parcelasMax}x de ${brl(parcela)} sem juros`;

    // rótulos das opções
    const vSedex = $('#val-sedex');
    if (vSedex) {
      vSedex.textContent = t.subtotal >= S.regras.freteGratisAcima ? 'Grátis' : brl(S.regras.fretePadrao);
      vSedex.className = 'opcao__valor' + (t.subtotal >= S.regras.freteGratisAcima ? ' gratis' : '');
    }
    const vPix = $('#val-pix');
    if (vPix) vPix.textContent = '− ' + brl((t.total - t.frete) * S.regras.descontoPix);
    const vCartao = $('#val-cartao');
    if (vCartao) vCartao.textContent = brl(total);
    const vBoleto = $('#val-boleto');
    if (vBoleto) vBoleto.textContent = brl(t.total);

    // parcelamento
    const sel = $('#parcelas');
    if (sel) {
      const atual = sel.value;
      sel.innerHTML = '';
      for (let n = 1; n <= S.regras.parcelasMax; n++) {
        const opt = document.createElement('option');
        opt.value = String(n);
        opt.textContent = `${n}x de ${brl(total / n)} sem juros`;
        sel.appendChild(opt);
      }
      sel.value = atual && Number(atual) <= S.regras.parcelasMax ? atual : String(S.regras.parcelasMax);
    }

    // sacola vazia não deveria entrar aqui
    const grade = $('#checkout-grade');
    if (t.vazio && grade) {
      grade.innerHTML =
        '<div class="vazio" style="grid-column:1/-1">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>' +
        '<h2>Sua sacola está vazia</h2>' +
        '<p>Adicione peças à sacola para finalizar a compra.</p>' +
        '<a href="loja.html" class="btn">Ver a coleção</a></div>';
    }
  }

  /* ============================================================
     TROCA DE MÉTODO / PAGAMENTO
     ============================================================ */
  form.addEventListener('change', (e) => {
    if (e.target.name === 'entrega') {
      if (e.target.value === 'retirada') {
        const end = $('#endereco');
        if (end && !end.value) end.placeholder = 'Retirada na loja — não precisa preencher';
      }
      render();
    }
    if (e.target.name === 'pagamento') {
      const detalheCartao = $('#detalhe-cartao');
      const detalhePix = $('#detalhe-pix');
      const cartao = e.target.value === 'cartao';
      if (detalheCartao) detalheCartao.hidden = !cartao;
      if (detalhePix) detalhePix.hidden = e.target.value !== 'pix';
      render();
    }
  });

  /* ============================================================
     VALIDAÇÃO VISUAL
     ============================================================ */
  const regrasCampo = {
    nome: val.nome,
    email: val.email,
    telefone: val.telefone,
    cpf: val.cpf,
    cep: val.cep,
    cidade: val.cidade,
    endereco: val.endereco,
    uf: val.uf,
  };

  function marcar(id, ok) {
    const el = document.getElementById(id);
    if (!el) return ok;
    const campo = el.closest('.campo');
    if (campo) campo.classList.toggle('invalido', !ok);
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    return ok;
  }

  function validarCampo(id) {
    const el = document.getElementById(id);
    if (!el || !regrasCampo[id]) return true;
    return marcar(id, regrasCampo[id](el.value));
  }

  Object.keys(regrasCampo).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('blur', () => validarCampo(id));
    el.addEventListener('input', () => {
      const campo = el.closest('.campo');
      if (campo && campo.classList.contains('invalido')) validarCampo(id);
    });
  });

  function validarCartao() {
    if (pagamentoValor() !== 'cartao') return true;
    const regras = {
      'cartao-num': val.cartao,
      'cartao-nome': (v) => (v || '').trim().length >= 5,
      'cartao-val': val.validade,
      'cartao-cvv': val.cvv,
    };
    let ok = true;
    Object.keys(regras).forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      if (!marcar(id, regras[id](el.value))) ok = false;
    });
    return ok;
  }

  /* ============================================================
     ENVIO
     ============================================================ */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let primeiroErro = null;
    Object.keys(regrasCampo).forEach((id) => {
      const ok = validarCampo(id);
      if (!ok && !primeiroErro) primeiroErro = document.getElementById(id);
    });
    const cartaoOk = validarCartao();

    if (primeiroErro || !cartaoOk) {
      const msg = !cartaoOk && !primeiroErro ? 'Confira os dados do cartão.' : 'Confira os campos destacados.';
      if (window.LC_Toast) window.LC_Toast(msg);
      const alvo = primeiroErro || document.getElementById('cartao-num');
      if (alvo) {
        alvo.scrollIntoView({ block: 'center', behavior: 'smooth' });
        alvo.focus({ preventScroll: true });
      }
      return;
    }

    // Simula o pedido aprovado
    const t = totaisAtuais();
    const pix = pagamentoValor() === 'pix';
    const descontoPix = pix ? (t.total - t.frete) * S.regras.descontoPix : 0;
    const total = t.total - descontoPix;

    const pedido = {
      numero: 'LC-' + String(Math.floor(100000 + Math.random() * 900000)),
      nome: $('#nome').value.trim(),
      email: $('#email').value.trim(),
      cidade: $('#cidade').value.trim(),
      uf: $('#uf').value,
      entrega: entregaValor(),
      pagamento: pagamentoValor(),
      total: total,
      itens: t.qtdTotal,
    };

    try {
      sessionStorage.setItem('lc_pedido', JSON.stringify(pedido));
    } catch (err) {
      /* ignora */
    }

    S.limpar();
    location.href = 'obrigado.html';
  });

  render();
})();
