/* ============================================================
   downloads.js — Live download counter
   Fetches total downloads from Modrinth and CurseForge.
   Updates the element with id="download-count" every 10 minutes.

   SOURCES:
   - Modrinth: public API, no key required.
   - CurseForge: The official API requires a server-side key,
     which cannot be safely embedded in a static site.
     Instead we fetch the CurseForge project page HTML via
     allorigins.win (a free public CORS proxy) and parse the
     download count from it.  This is a best-effort scrape;
     if CurseForge changes their markup it may break, but it
     degrades gracefully (shows Modrinth count only).

   NOTE: CurseForge numeric project ID for gamma-files = 903988
   (verify at https://www.curseforge.com/minecraft/modpacks/gamma-files)
   ============================================================ */

(function () {
  const MODRINTH_SLUG    = 'gamma-files-lite';
  const CURSEFORGE_URL   = 'https://www.curseforge.com/minecraft/modpacks/gamma-files';
  const INTERVAL_MS      = 10 * 60 * 1000; // 10 minutes

  /* -- Modrinth (simple open API) ------------------------------------ */
  async function fetchModrinth() {
    try {
      const res = await fetch(
        `https://api.modrinth.com/v2/project/${MODRINTH_SLUG}`,
        { headers: { 'User-Agent': 'gamma-files-site/1.0' } }
      );
      if (!res.ok) throw new Error('Modrinth ' + res.status);
      const data = await res.json();
      return typeof data.downloads === 'number' ? data.downloads : null;
    } catch (e) {
      console.warn('[downloads] Modrinth error:', e.message);
      return null;
    }
  }

  /* -- CurseForge (HTML scrape via CORS proxy) ----------------------- */
  async function fetchCurseForge() {
    try {
      // allorigins returns the page HTML as JSON so we can parse it
      // client-side without a backend.
      const proxyUrl =
        'https://api.allorigins.win/get?url=' +
        encodeURIComponent(CURSEFORGE_URL);

      const res = await fetch(proxyUrl);
      if (!res.ok) throw new Error('Proxy ' + res.status);
      const json = await res.json();
      const html = json.contents;
      if (!html) throw new Error('Empty proxy response');

      // CurseForge renders a number like "1,234,567" in a stat block.
      // The most reliable selector pattern in their HTML is a pair of
      // adjacent elements: the label "Total Downloads" and the value.
      // We look for the download count that follows that label.
      // Pattern: ..."Total Downloads"...  >  "1,234,567"
      const match = html.match(
        /Total\s+Downloads[\s\S]{0,300}?([\d,]{3,})/i
      );
      if (!match) throw new Error('Download count not found in HTML');

      const count = parseInt(match[1].replace(/,/g, ''), 10);
      if (isNaN(count)) throw new Error('Parsed NaN');
      return count;
    } catch (e) {
      console.warn('[downloads] CurseForge scrape error:', e.message);
      return null;
    }
  }

  /* -- Formatting ---------------------------------------------------- */
  function fmt(n) {
    if (n === null || n === undefined) return null;
    return n.toLocaleString('en-US');
  }

  /* -- Main update --------------------------------------------------- */
  async function updateCounter() {
    const el = document.getElementById('download-count');
    if (!el) return;

    el.classList.add('loading');
    el.textContent = '…';

    const [mrCount, cfCount] = await Promise.all([
      fetchModrinth(),
      fetchCurseForge()
    ]);

    el.classList.remove('loading');

    const parts = [];
    let total = 0;

    if (mrCount !== null) { total += mrCount; parts.push(mrCount); }
    if (cfCount !== null) { total += cfCount; parts.push(cfCount); }

    if (parts.length === 0) {
      el.textContent = '(count unavailable)';
      el.title = '';
    } else {
      el.textContent = fmt(total);
      const breakdown = [
        mrCount !== null ? fmt(mrCount) + ' on Modrinth'  : null,
        cfCount !== null ? fmt(cfCount) + ' on CurseForge' : null,
      ].filter(Boolean).join(' + ');
      el.title = breakdown;
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    updateCounter();
    setInterval(updateCounter, INTERVAL_MS);
  });
})();
