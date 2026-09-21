/* ============================================================
   nav.js — Shared header + footer injector
   Call initNav(activePage) from each page.
   activePage values: 'home', 'game', 'credits', 'community',
                      'store', 'blog', 'help'
   ============================================================ */

(function () {

  function rootPath() {
    return location.pathname.includes('/game/') ? '../' : './';
  }

  const NAV_ITEMS = [
    { id: 'home',      label: 'Home',      href: 'index.html',      children: [] },
    { id: 'game',      label: 'Game',      href: 'game/index.html', children: [
        { label: 'What is Gamma Files?', href: 'game/index.html' },
        { label: 'How to Play',          href: 'game/howtoplay.html' },
      ]
    },
    { id: 'credits',   label: 'Credits',   href: 'credits.html',    children: [] },
    { id: 'community', label: 'Community', href: 'community.html',  children: [] },
    { id: 'store',     label: 'Store',     href: 'store.html',      children: [] },
    { id: 'blog',      label: 'Blog',      href: 'blog.html',       children: [] },
    { id: 'help',      label: 'Help',      href: 'help.html',       children: [] },
  ];

  function buildHeader(active) {
    const r = rootPath();
    const menuItems = NAV_ITEMS.map(function (item) {
      const isActive = item.id === active ? ' class="active"' : '';
      let sub = '';
      if (item.children.length) {
        sub = '<ul>' + item.children.map(function (c) {
          return '<li><a href="' + r + c.href + '">' + c.label + '</a></li>';
        }).join('') + '</ul>';
      }
      return '<li' + isActive + '><a href="' + r + item.href + '">' + item.label + '</a>' + sub + '</li>';
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
      '  <p class="dark small">',
      '    Gamma Files: The Lost Update — a Minecraft modpack fan project.',
      '    "Minecraft" is a trademark of Mojang AB / Microsoft.',
      '    <a href="' + r + 'credits.html">Credits</a>',
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
    target.insertAdjacentHTML('beforeend', buildFooter(r));

    /* Mobile tap-to-open for dropdown menus.
       On narrow windows the nav wraps, so hover stops working reliably.
       We add a click listener that toggles an 'open' class on the <li>. */
    document.addEventListener('click', function (e) {
      const li = e.target.closest('#menu > li');
      if (!li) {
        document.querySelectorAll('#menu > li.open').forEach(function (el) {
          el.classList.remove('open');
        });
        return;
      }
      const sub = li.querySelector('ul');
      if (!sub) return;
      e.preventDefault();
      const isOpen = li.classList.contains('open');
      document.querySelectorAll('#menu > li.open').forEach(function (el) {
        el.classList.remove('open');
      });
      if (!isOpen) li.classList.add('open');
    });
  };

})();
