/* ============================================================
   LARA COSTA — sacola (estado + persistência)
   Usa localStorage para sobreviver à navegação entre páginas.
   Degrada para memória se o navegador bloquear o storage.
   ============================================================ */
(function () {
  'use strict';

  const CHAVE = 'lc_sacola_v1';
  const CATALOGO = window.LC_CATALOGO || {};

  /* ---------- Regras de negócio ---------- */
  const REGRAS = {
    freteGratisAcima: 299,   // a partir daqui o frete é grátis
    fretePadrao: 24.9,
    descontoPix: 0.05,       // 5% no Pix
    parcelasMax: 6,
    cupons: {                // cupons de demonstração
      BEMVINDA10: { tipo: 'pct', valor: 0.1, rotulo: '10% de boas-vindas' },
      FRETEGRATIS: { tipo: 'frete', valor: 0, rotulo: 'Frete grátis' },
    },
  };

  /* ---------- Storage seguro ---------- */
  let memoria = null;
  function ler() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      return bruto ? JSON.parse(bruto) : [];
    } catch (e) {
      return memoria || [];
    }
  }
  function gravar(itens) {
    memoria = itens;
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch (e) {
      /* modo memória */
    }
  }

  /* ---------- API ---------- */
  const Sacola = {
    regras: REGRAS,
    catalogo: CATALOGO,

    itens() {
      return ler();
    },

    quantidade() {
      return ler().reduce((s, i) => s + i.qtd, 0);
    },

    /** Adiciona um item. Mesma combinação (id+cor+tam) soma quantidade. */
    adicionar(id, opcoes) {
      const o = opcoes || {};
      const prod = CATALOGO[id];
      if (!prod) return { ok: false, erro: 'Produto não encontrado' };

      const cor = o.cor || prod.cores[0];
      const tam = o.tam || prod.tamanhos[0];
      const qtd = Math.max(1, parseInt(o.qtd, 10) || 1);

      const itens = ler();
      const chave = [id, cor, tam].join('|');
      const existente = itens.find((i) => i.chave === chave);

      if (existente) {
        existente.qtd = Math.min(9, existente.qtd + qtd);
      } else {
        itens.push({
          chave,
          id,
          cor,
          tam,
          qtd: Math.min(9, qtd),
          nome: prod.nome,
          cat: prod.cat,
          preco: prod.preco,
          precoDe: prod.precoDe || null,
          img: prod.img,
          url: prod.url,
        });
      }

      gravar(itens);
      Sacola.atualizarBadge();
      return { ok: true, item: existente || itens[itens.length - 1] };
    },

    alterarQtd(chave, delta) {
      const itens = ler();
      const item = itens.find((i) => i.chave === chave);
      if (!item) return;
      item.qtd = Math.max(1, Math.min(9, item.qtd + delta));
      gravar(itens);
      Sacola.atualizarBadge();
    },

    definirQtd(chave, valor) {
      const itens = ler();
      const item = itens.find((i) => i.chave === chave);
      if (!item) return;
      item.qtd = Math.max(1, Math.min(9, parseInt(valor, 10) || 1));
      gravar(itens);
      Sacola.atualizarBadge();
    },

    remover(chave) {
      gravar(ler().filter((i) => i.chave !== chave));
      Sacola.atualizarBadge();
    },

    limpar() {
      gravar([]);
      Sacola.atualizarBadge();
    },

    /** Aplica cupom + frete + Pix. Retorna todos os totais. */
    totais(opcoes) {
      const o = opcoes || {};
      const itens = ler();
      const subtotal = itens.reduce((s, i) => s + i.preco * i.qtd, 0);
      const qtdTotal = itens.reduce((s, i) => s + i.qtd, 0);

      const economia = itens.reduce(
        (s, i) => s + (i.precoDe ? (i.precoDe - i.preco) * i.qtd : 0),
        0
      );

      // Cupom
      const cupom = o.cupom ? REGRAS.cupons[String(o.cupom).toUpperCase()] : null;
      let descontoCupom = 0;
      let freteGratisPorCupom = false;
      if (cupom) {
        if (cupom.tipo === 'pct') descontoCupom = subtotal * cupom.valor;
        if (cupom.tipo === 'frete') freteGratisPorCupom = true;
      }

      // Frete
      const baseFrete = o.frete != null ? o.frete : REGRAS.fretePadrao;
      const freteGratis =
        freteGratisPorCupom ||
        subtotal >= REGRAS.freteGratisAcima ||
        (o.retirada === true);

      let frete = itens.length === 0 ? 0 : freteGratis ? 0 : baseFrete;

      // Total antes do Pix
      const total = Math.max(0, subtotal - descontoCupom) + frete;

      // Pix
      const descontoPix = o.pix ? (total - frete) * REGRAS.descontoPix : 0;
      const totalPix = total - descontoPix;

      const parcela = total / REGRAS.parcelasMax;

      return {
        itens,
        qtdTotal,
        subtotal,
        economia,
        cupomValido: !!cupom,
        cupomRotulo: cupom ? cupom.rotulo : null,
        descontoCupom,
        frete,
        freteGratis,
        faltamParaFreteGratis: Math.max(0, REGRAS.freteGratisAcima - subtotal),
        total,
        descontoPix,
        totalPix,
        parcela,
        parcelasMax: REGRAS.parcelasMax,
        vazio: itens.length === 0,
      };
    },

    /* ---------- UI: badge do header ---------- */
    atualizarBadge() {
      const q = Sacola.quantidade();
      document.querySelectorAll('.badge').forEach((b) => {
        b.textContent = String(q);
        b.hidden = q === 0;
      });
    },
  };

  /* ---------- Helper de preço ---------- */
  Sacola.brl = (n) =>
    n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  window.LC_Sacola = Sacola;

  // Badge sempre coerente ao carregar a página
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Sacola.atualizarBadge());
  } else {
    Sacola.atualizarBadge();
  }
})();
