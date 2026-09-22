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
  const MODRINTH_PROJECT_ID = 'gamma-files-lite';
  const CURSEFORGE_PROJECT_ID = '1079517';
  const CURSEFORGE_API_KEY = '$$2a$10$WKM6TppP238C16FE9npIpeIyJhgPZfGIqDvFj/m93eoIskbBAiFAS';

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

  /* ----------------------------------------------------------
     Discord member / online count
     Uses the public invite endpoint — no auth, no CORS issues.
     Returns { members, online } or null on failure.
     ---------------------------------------------------------- */
  const DISCORD_INVITE = 'xgf7VWUczW';

  async function fetchDiscord() {
    try {
      const res = await fetch(
        `https://discord.com/api/v9/invites/${DISCORD_INVITE}?with_counts=true`
      );
      if (!res.ok) throw new Error('Discord fetch failed');
      const data = await res.json();
      return {
        members: data.approximate_member_count ?? null,
        online:  data.approximate_presence_count ?? null
      };
    } catch (e) {
      console.warn('Discord fetch error:', e);
      return null;
    }
  }

  async function updateDiscord() {
    const elMembers = document.getElementById('discord-members');
    const elOnline  = document.getElementById('discord-online');
    if (!elMembers && !elOnline) return;

    const result = await fetchDiscord();

    if (result && result.members !== null) {
      elMembers.textContent = formatNumber(result.members);
      elMembers.classList.remove('loading');
    } else {
      elMembers.textContent = 'many';
      elMembers.classList.remove('loading');
    }

    if (result && result.online !== null) {
      elOnline.textContent = formatNumber(result.online);
      elOnline.classList.remove('loading');
    } else {
      elOnline.textContent = 'some';
      elOnline.classList.remove('loading');
    }
  }

  // Run immediately and then on interval
  document.addEventListener('DOMContentLoaded', function () {
    updateCounter();
    updateDiscord();
    setInterval(updateCounter, INTERVAL_MS);
    setInterval(updateDiscord, INTERVAL_MS);
  });
})();
