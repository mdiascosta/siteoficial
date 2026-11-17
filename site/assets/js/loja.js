/* ============================================================
   LARA COSTA — interações do protótipo
   Sem dependências. Cada bloco só roda se o elemento existir.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Utilidades ---------- */
  const $  = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  function toast(msg) {
    let el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.innerHTML =
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 12 5 5L20 6"/></svg><span></span>';
    el.querySelector('span').textContent = msg;
    // Força o recálculo de layout para a transição de entrada disparar de forma confiável
    void el.offsetWidth;
    el.classList.add('vis');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('vis'), 2800);
  }
  window.LC_Toast = toast;

  /* ---------- Header: sombra ao rolar ---------- */
  const header = $('#header');
  if (header) {
    const aoRolar = () => header.classList.toggle('rolou', window.scrollY > 12);
    window.addEventListener('scroll', aoRolar, { passive: true });
    aoRolar();
  }

  /* ---------- Menu mobile ---------- */
  const burger = $('.burger');
  const gaveta = $('#gaveta');
  if (burger && gaveta) {
    const veu = $('.gaveta__veu', gaveta);
    const fechar = $('.gaveta__fechar', gaveta);

    const abrir = () => {
      gaveta.setAttribute('open', '');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      fechar && fechar.focus();
    };
    const fecharGaveta = () => {
      gaveta.removeAttribute('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      burger.focus();
    };

    burger.addEventListener('click', abrir);
    veu && veu.addEventListener('click', fecharGaveta);
    fechar && fechar.addEventListener('click', fecharGaveta);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && gaveta.hasAttribute('open')) fecharGaveta();
    });
  }

  /* ---------- Revelação ao rolar ---------- */
  const itens = $$('.revela');
  if (itens.length) {
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entradas) => {
          entradas.forEach((e, i) => {
            if (e.isIntersecting) {
              setTimeout(() => e.target.classList.add('vis'), Math.min(i, 5) * 70);
              obs.unobserve(e.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      itens.forEach((el) => obs.observe(el));
    } else {
      itens.forEach((el) => el.classList.add('vis'));
    }
  }

  /* ---------- Favoritar ---------- */
  $$('.produto__fav').forEach((btn) => {
    btn.addEventListener('click', () => {
      const ativo = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!ativo));
      btn.style.color = ativo ? '' : 'var(--lc-terracota)';
      toast(ativo ? 'Removido dos favoritos' : 'Salvo nos favoritos');
    });
  });

  /* ---------- Página de produto ---------- */
  const galeria = $('.galeria');
  if (galeria) {
    const principal = $('.galeria__principal img', galeria);
    const minis = $$('.galeria__minis button', galeria);

    minis.forEach((mini) => {
      mini.addEventListener('click', () => {
        const img = $('img', mini);
        if (!img || !principal) return;
        minis.forEach((m) => m.setAttribute('aria-selected', 'false'));
        mini.setAttribute('aria-selected', 'true');
        principal.src = img.src;
        principal.alt = img.alt;
      });
    });

    // Tamanhos
    $$('.tam').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.disabled) return;
        $$('.tam').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const rotulo = $('#tam-escolhido');
        if (rotulo) rotulo.textContent = btn.dataset.tam || btn.textContent.trim();
      });
    });

    // Cores
    $$('.cor-pdp').forEach((btn) => {
      btn.addEventListener('click', () => {
        $$('.cor-pdp').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        btn.setAttribute('aria-pressed', 'true');
        const rotulo = $('#cor-escolhida');
        if (rotulo) rotulo.textContent = btn.dataset.cor || '';
      });
    });

    // Quantidade
    const qtdInput = $('#qtd');
    if (qtdInput) {
      const mudar = (d) => {
        const v = Math.max(1, Math.min(9, (parseInt(qtdInput.value, 10) || 1) + d));
        qtdInput.value = v;
      };
      const menos = $('#qtd-menos');
      const mais = $('#qtd-mais');
      menos && menos.addEventListener('click', () => mudar(-1));
      mais && mais.addEventListener('click', () => mudar(1));
    }

    // Adicionar à sacola
    const comprar = $('#comprar');
    if (comprar) {
      comprar.addEventListener('click', () => {
        const tam = $('#tam-escolhido');
        const tamTxt = tam ? tam.textContent.trim() : '—';

        // Tamanho é obrigatório quando o produto tem grade
        if (tam && tamTxt === '—') {
          toast('Escolha um tamanho para continuar');
          const grupo = $('.tamanhos');
          grupo && grupo.scrollIntoView({ block: 'center', behavior: 'smooth' });
          return;
        }

        const q = qtdInput ? parseInt(qtdInput.value, 10) || 1 : 1;
        const corEl = $('#cor-escolhida');
        const cor = corEl ? corEl.textContent.trim() : null;
        const id = document.body.dataset.produto;

        if (window.LC_Sacola && id) {
          const r = window.LC_Sacola.adicionar(id, { cor: cor, tam: tamTxt, qtd: q });
          if (!r.ok) {
            toast(r.erro || 'Não foi possível adicionar');
            return;
          }
          window.LC_Sacola.atualizarBadge();
          toast(
            r.item
              ? `${r.item.nome} · ${r.item.tam} na sacola`
              : 'Adicionado à sacola'
          );
          abrirMiniSacola();
        } else {
          toast('Adicionado à sacola');
        }
      });
    }

    /* Mini-sacola: confirmação rápida com link direto para finalizar */
    function abrirMiniSacola() {
      let box = $('#mini-sacola');
      if (!box) {
        box = document.createElement('div');
        box.id = 'mini-sacola';
        box.className = 'mini-sacola';
        box.setAttribute('role', 'status');
        box.setAttribute('aria-live', 'polite');
        box.innerHTML =
          '<strong>Adicionado à sacola</strong>' +
          '<div class="mini-sacola__acoes">' +
          '<a href="sacola.html" class="btn" style="flex:1">Ver sacola</a>' +
          '<a href="loja.html" class="btn btn--ghost" style="flex:1">Continuar</a>' +
          '</div>';
        document.body.appendChild(box);
      }
      box.classList.add('vis');
      clearTimeout(box._t);
      box._t = setTimeout(() => box.classList.remove('vis'), 6000);
    }

    // Cálculo de frete (simulado)
    const formFrete = $('#form-frete');
    if (formFrete) {
      formFrete.addEventListener('submit', (e) => {
        e.preventDefault();
        const cep = ($('#cep') || {}).value || '';
        const res = $('.frete__res');
        const digitos = cep.replace(/\D/g, '');
        if (!res) return;
        if (digitos.length !== 8) {
          res.innerHTML = '<b>CEP inválido.</b> Use 8 dígitos, ex.: 18520-000.';
          return;
        }
        res.innerHTML =
          '<div><b>Sedex</b> · 3 a 5 dias úteis · R$ 24,90</div>' +
          '<div><b>PAC</b> · 7 a 10 dias úteis · <b>Grátis</b> acima de R$ 299</div>' +
          '<div style="margin-top:6px;opacity:.8">Retirada na loja em Cerquilho · sem custo</div>';
      });
    }

    // Máscara simples de CEP
    const cep = $('#cep');
    if (cep) {
      cep.addEventListener('input', () => {
        let v = cep.value.replace(/\D/g, '').slice(0, 8);
        if (v.length > 5) v = v.slice(0, 5) + '-' + v.slice(5);
        cep.value = v;
      });
    }
  }

  /* ---------- Listagem: filtros e ordenação ---------- */
  const lista = $('.produtos--loja');
  if (lista) {
    const cartaoDe = (el) => ({
      el,
      nome: (el.dataset.nome || '').toLowerCase(),
      preco: parseFloat(el.dataset.preco || '0'),
      novidade: el.dataset.novo === '1',
      cats: (el.dataset.cat || '').split(' ').filter(Boolean),
      cor: el.dataset.cor || '',
    });

    const aplicar = () => {
      let cartoes = $$('.produto', lista).map(cartaoDe);

      // Categorias marcadas
      const cats = $$('.filtros input[type="checkbox"]:checked').map((i) => i.value);
      // Cores
      const cores = $$('.filtros__cores button[aria-pressed="true"]').map((b) => b.dataset.cor);

      cartoes.forEach((c) => {
        const okCat = !cats.length || c.cats.some((k) => cats.includes(k));
        const okCor = !cores.length || cores.includes(c.cor);
        c.el.style.display = okCat && okCor ? '' : 'none';
      });

      // Ordenação
      const ordem = ($('#ordenar') || {}).value || 'padrao';
      const visiveis = cartoes.filter((c) => c.el.style.display !== 'none');
      const visiveisEls = visiveis.map((c) => c.el);

      if (ordem === 'menor') {
        visiveisEls.sort((a, b) => cartaoDe(a).preco - cartaoDe(b).preco);
      } else if (ordem === 'maior') {
        visiveisEls.sort((a, b) => cartaoDe(b).preco - cartaoDe(a).preco);
      } else if (ordem === 'novidades') {
        visiveisEls.sort((a, b) => cartaoDe(b).novidade - cartaoDe(a).novidade);
      } else {
        visiveisEls.sort((a, b) => cartoes.indexOf(cartaoDe(a)) - cartoes.indexOf(cartaoDe(b)));
      }
      visiveisEls.forEach((el) => lista.appendChild(el));

      const cont = $('.loja-barra__cont');
      if (cont) cont.textContent = `${visiveis.length} ${visiveis.length === 1 ? 'peça' : 'peças'}`;
    };

    $$('.filtros input[type="checkbox"]').forEach((i) => i.addEventListener('change', aplicar));
    $$('.filtros__cores button').forEach((b) => {
      b.addEventListener('click', () => {
        b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
        aplicar();
      });
    });
    const ordenar = $('#ordenar');
    ordenar && ordenar.addEventListener('change', aplicar);

    // Abrir filtros no mobile
    const btnFiltros = $('#abrir-filtros');
    const filtros = $('.filtros');
    btnFiltros &&
      filtros &&
      btnFiltros.addEventListener('click', () => {
        filtros.classList.toggle('aberto');
        btnFiltros.setAttribute(
          'aria-expanded',
          filtros.classList.contains('aberto') ? 'true' : 'false'
        );
      });

    // Limpar
    const limpar = $('#limpar');
    limpar &&
      limpar.addEventListener('click', () => {
        $$('.filtros input[type="checkbox"]').forEach((i) => (i.checked = false));
        $$('.filtros__cores button').forEach((b) => b.setAttribute('aria-pressed', 'false'));
        aplicar();
      });

    aplicar();
  }

  /* ---------- Newsletter ---------- */
  const news = $('#form-news');
  news &&
    news.addEventListener('submit', (e) => {
      e.preventDefault();
      const campo = $('#email', news);
      if (campo && campo.value.includes('@')) {
        toast('Pronto! Você vai receber as novidades antes.');
        news.reset();
      } else {
        toast('Confira o e-mail digitado');
      }
    });
})();
