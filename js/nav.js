/* ============================================================
   nav.js — Shared header + footer injector
   Call initNav(activePage) from each page.
   activePage values: 'home', 'game', 'credits', 'community', 'store', 'help'
   ============================================================ */

(function () {
  // Detect root path relative to current page depth
  function rootPath() {
    const depth = location.pathname.replace(/\/[^/]*$/, '').split('/').length;
    const isSubDir = location.pathname.includes('/game/') ||
                     location.pathname.includes('/credits');
    return isSubDir ? '../' : './';
  }

  const NAV_ITEMS = [
    { id: 'home',      label: 'Home',       href: 'index.html',           children: [] },
    { id: 'game',      label: 'Game',       href: 'game/index.html',      children: [
        { label: 'What is Gamma Files?', href: 'game/index.html' },
        { label: 'How to Play',          href: 'game/howtoplay.html' },
      ]
    },
    { id: 'credits',   label: 'Credits',    href: 'credits.html',         children: [] },
    { id: 'community', label: 'Community',  href: 'community.html',       children: [] },
    { id: 'store',     label: 'Store',      href: 'store.html',           children: [] },
    { id: 'help',      label: 'Help',       href: 'help.html',            children: [] },
  ];

  function buildHeader(active) {
    const r = rootPath();
    const menuItems = NAV_ITEMS.map(item => {
      const isActive = item.id === active ? ' class="active"' : '';
      let sub = '';
      if (item.children.length) {
        sub = '<ul>' + item.children.map(c =>
          `<li><a href="${r}${c.href}">${c.label}</a></li>`
        ).join('') + '</ul>';
      }
      return `<li${isActive}><a href="${r}${item.href}">${item.label}</a>${sub}</li>`;
    }).join('');

    return `
<header>
  <div id="header-container">
    <a id="logo" href="${r}index.html">Gamma Files: The Lost Update</a>
    <ul id="menu">${menuItems}</ul>
    <div id="userbox">
      <a href="https://modrinth.com/modpack/gamma-files-lite" target="_blank" rel="noopener">Download on Modrinth</a>
    </div>
  </div>
</header>`;
  }

  function buildFooter() {
    return `
<footer>
  <p class="dark small">
    Gamma Files: The Lost Update — a Minecraft modpack fan project.
    "Minecraft" is a trademark of Mojang AB / Microsoft.
    <a href="credits.html">Credits</a>
  </p>
</footer>`;
  }

  window.initNav = function (activePage) {
    // Insert header before #wrap or at top of body
    const wrap = document.getElementById('wrap');
    if (wrap) {
      wrap.insertAdjacentHTML('beforebegin', buildHeader(activePage));
    } else {
      document.body.insertAdjacentHTML('afterbegin', buildHeader(activePage));
    }

    // Insert footer inside #wrap at the end, or at end of body
    const target = document.getElementById('wrap') || document.body;
    target.insertAdjacentHTML('beforeend', buildFooter());
  };
})();
