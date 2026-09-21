/* ============================================================
   nav.js — Shared header + footer injector
   Call initNav(activePage) from each page.
   activePage values: 'home', 'game', 'credits', 'community',
                      'store', 'blog', 'help'
   ============================================================ */

(function () {

  function rootPath() {
    const p = location.pathname;
    if (p.includes('/game/'))  return '../';
    if (p.includes('/help/'))  return '../';
    return './';
  }

  /* Nav order as requested:
     Home | Game | Blog | Community | Store | Credits | Help
     Game has no dropdown — clicking takes you straight to game/index.html.
     The sub-pages (page 1 / page 2) are navigated from the game page's own sidebar. */
  const NAV_ITEMS = [
    { id: 'home',      label: 'Home',      href: 'index.html',      children: [] },
    { id: 'game',      label: 'Game',      href: 'game/index.html', children: [] },
    { id: 'blog',      label: 'Blog',      href: 'blog.html',       children: [] },
    { id: 'community', label: 'Community', href: 'community.html',  children: [] },
    { id: 'store',     label: 'Store',     href: 'store.html',      children: [] },
    { id: 'credits',   label: 'Credits',   href: 'credits.html',    children: [] },
    { id: 'help',      label: 'Help',      href: 'help.html',       children: [] },
  ];

  function buildHeader(active) {
    const r = rootPath();
    const menuItems = NAV_ITEMS.map(function (item) {
      const isActive = item.id === active ? ' class="active"' : '';
      return '<li' + isActive + '><a href="' + r + item.href + '">' + item.label + '</a></li>';
    }).join('');

    return [
      '<header>',
      '  <div id="header-container">',
      '    <a id="logo" href="' + r + 'index.html">Gamma Files: The Lost Update</a>',
      '    <ul id="menu">' + menuItems + '</ul>',
      '    <div id="userbox">',
      '      <a href="https://modrinth.com/modpack/gamma-files-lite" target="_blank" rel="noopener">Download</a>',
      '    </div>',
      '  </div>',
      '</header>'
    ].join('\n');
  }

  function buildFooter(r) {
    return [
      '<footer>',
      '  <p>',
      '    Gamma Files: The Lost Update — an independent Minecraft modpack fan project.',
      '    &ldquo;Minecraft&rdquo; is a trademark of Mojang AB / Microsoft.',
      '    &mdash; <a href="' + r + 'credits.html">Credits</a>',
      '  </p>',
      '</footer>'
    ].join('\n');
  }

  window.initNav = function (activePage) {
    const r = rootPath();

    const wrap = document.getElementById('wrap');
    if (wrap) {
      wrap.insertAdjacentHTML('beforebegin', buildHeader(activePage));
    } else {
      document.body.insertAdjacentHTML('afterbegin', buildHeader(activePage));
    }

    const target = document.getElementById('wrap') || document.body;
    target.insertAdjacentHTML('afterend', buildFooter(r));
  };

})();
