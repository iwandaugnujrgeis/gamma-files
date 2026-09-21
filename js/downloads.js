/* ============================================================
   downloads.js — Live download counter
   Fetches total downloads from Modrinth and CurseForge APIs.
   Updates the element with id="download-count" every 10 minutes.

   NOTES:
   - Modrinth has an open public API — no key required.
   - CurseForge requires an API key (CFCore). The key below is a
     placeholder; replace it with a real key from
     https://console.curseforge.com/
     If no key is available, CurseForge count is omitted gracefully.
   ============================================================ */

(function () {
  const MODRINTH_PROJECT_ID = 'gamma-files-lite';           // slug or ID
  const CURSEFORGE_PROJECT_ID = '903988';                   // ASSUMPTION: numeric CurseForge project ID
                                                            // (find it in the CurseForge URL or API)
  const CURSEFORGE_API_KEY = '$2a$10$PLACEHOLDER_REPLACE_ME'; // ← Replace with real key

  const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  async function fetchModrinth() {
    try {
      const res = await fetch(`https://api.modrinth.com/v2/project/${MODRINTH_PROJECT_ID}`, {
        headers: { 'User-Agent': 'gamma-files-site/1.0 (contact via modrinth)' }
      });
      if (!res.ok) throw new Error('Modrinth fetch failed');
      const data = await res.json();
      return typeof data.downloads === 'number' ? data.downloads : 0;
    } catch (e) {
      console.warn('Modrinth fetch error:', e);
      return null;
    }
  }

  async function fetchCurseForge() {
    if (CURSEFORGE_API_KEY.includes('PLACEHOLDER')) return null; // Skip if no real key
    try {
      const res = await fetch(`https://api.curseforge.com/v1/mods/${CURSEFORGE_PROJECT_ID}`, {
        headers: {
          'x-api-key': CURSEFORGE_API_KEY,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('CurseForge fetch failed');
      const data = await res.json();
      return data?.data?.downloadCount ?? 0;
    } catch (e) {
      console.warn('CurseForge fetch error:', e);
      return null;
    }
  }

  function formatNumber(n) {
    if (n === null || n === undefined) return '???';
    return n.toLocaleString('en-US');
  }

  async function updateCounter() {
    const el = document.getElementById('download-count');
    if (!el) return;

    el.classList.add('loading');
    el.textContent = '…';

    const [mrCount, cfCount] = await Promise.all([fetchModrinth(), fetchCurseForge()]);

    let total = 0;
    let parts = [];

    if (mrCount !== null) {
      total += mrCount;
      parts.push(`${formatNumber(mrCount)} on Modrinth`);
    }
    if (cfCount !== null) {
      total += cfCount;
      parts.push(`${formatNumber(cfCount)} on CurseForge`);
    }

    el.classList.remove('loading');

    if (parts.length === 0) {
      el.textContent = '(download count unavailable)';
    } else if (parts.length === 1) {
      el.textContent = formatNumber(total);
    } else {
      // Both sources available — show combined total, tooltip with breakdown
      el.textContent = formatNumber(total);
      el.title = parts.join(' + ');
    }
  }

  // Run immediately and then on interval
  document.addEventListener('DOMContentLoaded', function () {
    updateCounter();
    setInterval(updateCounter, INTERVAL_MS);
  });
})();
