// Veyqo — catalogue audit API on Cloudflare Pages Functions (advanced mode _worker.js)
// GET /api/audit?domain=example.com  -> JSON report computed from the shop's public products.json

const UA = 'Mozilla/5.0 (compatible; VeyqoAudit/1.0; +https://veyqo.clawpyr.com/audit)';
const MAX_PAGES = 6;

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

function cleanDomain(raw) {
  let d = String(raw || '').trim().toLowerCase();
  d = d.replace(/^https?:\/\//, '').replace(/^www\./, '');
  d = d.split('/')[0].split('?')[0].split('#')[0];
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) return null;
  if (d.length > 120) return null;
  return d;
}

async function fetchPage(domain, page) {
  const url = `https://${domain}/products.json?limit=250&page=${page}`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 9000);
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA, accept: 'application/json' }, signal: ctrl.signal });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const text = await res.text();
    if (text.length > 4_000_000) return { error: 'too-large' };
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return { error: 'not-json' };
    }
    if (!data || !Array.isArray(data.products)) return { error: 'no-products' };
    return { products: data.products };
  } catch (e) {
    return { error: e.name === 'AbortError' ? 'timeout' : 'fetch-failed' };
  } finally {
    clearTimeout(t);
  }
}

function analyse(products) {
  const variants = products.flatMap((p) => p.variants || []);
  const unavailable = variants.filter((v) => v && v.available === false);
  const fullyOut = products.filter((p) => (p.variants || []).length && (p.variants || []).every((v) => v.available === false));
  const partStocked = products
    .filter((p) => (p.variants || []).some((v) => v.available === false) && (p.variants || []).some((v) => v.available !== false))
    .map((p) => ({
      title: p.title,
      handle: p.handle,
      variants: (p.variants || []).length,
      unavailable: (p.variants || []).filter((v) => v.available === false).length,
      price: (p.variants || [])[0]?.price || null,
    }))
    .sort((a, b) => b.unavailable - a.unavailable);
  const noSku = variants.filter((v) => !String(v?.sku || '').trim());
  const noImage = products.filter((p) => !(p.images || []).length);
  const prices = variants.map((v) => parseFloat(v?.price)).filter((n) => Number.isFinite(n) && n > 0).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor(prices.length / 2)] : null;
  const now = Date.now();
  const stale = products.filter((p) => {
    const t = Date.parse(p.updated_at || p.published_at || '');
    return Number.isFinite(t) && now - t > 365 * 864e5;
  });

  return {
    products: products.length,
    variants: variants.length,
    unavailable: unavailable.length,
    unavailablePct: variants.length ? +(100 * unavailable.length / variants.length).toFixed(1) : 0,
    fullyOut: fullyOut.length,
    partStocked: partStocked.length,
    partStockedTop: partStocked.slice(0, 5),
    fullyOutTop: fullyOut.slice(0, 5).map((p) => ({ title: p.title, handle: p.handle })),
    missingSku: noSku.length,
    missingSkuPct: variants.length ? +(100 * noSku.length / variants.length).toFixed(1) : 0,
    missingImage: noImage.length,
    staleYear: stale.length,
    priceMin: prices.length ? +prices[0].toFixed(2) : null,
    priceMedian: median,
    priceMax: prices.length ? +prices[prices.length - 1].toFixed(2) : null,
  };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/audit') {
      if (request.method !== 'GET') return json({ error: 'method' }, 405);
      const domain = cleanDomain(url.searchParams.get('domain'));
      if (!domain) return json({ error: 'bad-domain', hint: 'send a domain like example.com' }, 400);

      let all = [];
      let pages = 0;
      let truncated = false;
      for (let page = 1; page <= MAX_PAGES; page++) {
        const out = await fetchPage(domain, page);
        if (out.error) {
          if (page === 1) return json({ error: out.error, domain }, out.error === 'HTTP 404' ? 404 : 502);
          break;
        }
        pages++;
        all = all.concat(out.products);
        if (out.products.length < 250) break;
        if (page === MAX_PAGES) truncated = true;
      }
      if (!all.length) return json({ error: 'empty-feed', domain }, 422);

      return json({
        domain,
        measuredAt: new Date().toISOString(),
        pagesRead: pages,
        truncated,
        ...analyse(all),
        note:
          'Computed in real time from the shop\'s public products.json. Barcodes are not exposed by that endpoint, so nothing here claims anything about GTINs.',
      });
    }

    return env.ASSETS.fetch(request);
  },
};
