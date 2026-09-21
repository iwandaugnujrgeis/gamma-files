/* ============================================================
   blog.js — Blog post renderer
   Reads blog.json and renders posts into a target element.

   USAGE:
   renderBlog(targetElementId, options)

   options:
     mode:      'full'    — renders all posts in full (blog.html)
                'teaser'  — renders the latest N posts as short
                            previews (homepage updates section)
     count:     number of posts to show in teaser mode (default 3)
     rootPath:  path prefix for links back to blog.html
                Use './' from root pages, '../' from /game/ etc.

   TO ADD A NEW POST:
   Edit blog.json in the site root. Add a new object at the TOP
   of the array (newest first). Fields:
     id:    unique slug (used as anchor: blog.html#slug)
     title: post title
     date:  YYYY-MM-DD
     body:  full post text. Use \n\n to separate paragraphs.
            Basic Markdown is NOT parsed — plain text only.
            To add links, use the bodyHtml field instead (raw HTML).
   ============================================================ */

(function () {

  /* Fetch blog.json relative to the site root, regardless of which
     page we're on. rootPath is passed in from the calling page. */
  async function loadPosts(rootPath) {
    const url = (rootPath || './') + 'blog.json';
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return await res.json();
    } catch (e) {
      console.warn('[blog] Could not load blog.json:', e.message);
      return null;
    }
  }

  function formatDate(iso) {
    try {
      const d = new Date(iso + 'T00:00:00');
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch (_) { return iso; }
  }

  /* Trim body text to roughly `words` words, appending ellipsis */
  function excerpt(text, words) {
    const parts = text.trim().split(/\s+/);
    if (parts.length <= words) return text.trim();
    return parts.slice(0, words).join(' ') + '…';
  }

  /* Turn plain \n\n-separated paragraphs into <p> tags */
  function bodyToHtml(text) {
    return text.trim().split(/\n\n+/).map(function (para) {
      return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
  }

  function renderFull(posts, rootPath) {
    return posts.map(function (post) {
      const html = post.bodyHtml || bodyToHtml(post.body || '');
      return [
        '<article class="blog-post" id="' + post.id + '">',
        '  <h2>' + post.title + '</h2>',
        '  <p class="post-date">' + formatDate(post.date) + '</p>',
        html,
        '</article>'
      ].join('\n');
    }).join('\n');
  }

  /* Teaser: show post title, date, and ~200-word excerpt */
  function renderTeaser(posts, count, rootPath) {
    const shown = posts.slice(0, count || 3);
    if (shown.length === 0) return '<p class="dark">No posts yet.</p>';
    const items = shown.map(function (post) {
      const body = post.bodyHtml
        ? post.bodyHtml.replace(/<[^>]+>/g, '')   // strip tags for plain excerpt
        : (post.body || '');
      const ex = excerpt(body, 50);
      const link = (rootPath || './') + 'blog.html#' + post.id;
      return [
        '<li>',
        '  <span class="post-date">' + formatDate(post.date) + '</span>',
        '  <span class="post-title"><a href="' + link + '">' + post.title + '</a></span>',
        '  <span class="post-excerpt">' + ex + '</span>',
        '</li>'
      ].join('\n');
    }).join('\n');
    return '<ul id="updates-list">' + items + '</ul>';
  }

  /* Public API */
  window.renderBlog = function (targetId, opts) {
    const el = document.getElementById(targetId);
    if (!el) return;
    const options = opts || {};
    const rootPath = options.rootPath || './';

    loadPosts(rootPath).then(function (posts) {
      if (!posts || posts.length === 0) {
        el.innerHTML = '<p class="dark">No posts yet.</p>';
        return;
      }
      if (options.mode === 'teaser') {
        el.innerHTML = renderTeaser(posts, options.count, rootPath);
      } else {
        el.innerHTML = renderFull(posts, rootPath);
      }
    });
  };

})();
