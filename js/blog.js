(function () {

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

  function stripTags(html) {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function trimWords(text, limit) {
    const parts = text.trim().split(/\s+/);
    if (parts.length <= limit) return { text: text.trim(), truncated: false };
    return { text: parts.slice(0, limit).join(' ') + '\u2026', truncated: true };
  }

  function bodyToHtml(text) {
    return text.trim().split(/\n\n+/).map(function (para) {
      return '<p>' + para.replace(/\n/g, '<br>') + '</p>';
    }).join('\n');
  }

  function renderFull(posts) {
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

  function renderTeaser(posts, count, rootPath, wordLimit) {
    const shown = posts.slice(0, count || 3);
    const limit = wordLimit || 30;

    if (shown.length === 0) return '<p class="dark">No posts yet.</p>';

    const items = shown.map(function (post) {
      const link = (rootPath || './') + 'blog.html#' + post.id;

      const rawText = post.bodyHtml
        ? stripTags(post.bodyHtml)
        : (post.body || '').replace(/\n/g, ' ');

      const trimmed = trimWords(rawText, limit);
      const excerptHtml = trimmed.text +
        (trimmed.truncated
          ? ' <a href="' + link + '">Continue reading&hellip;</a>'
          : '');

      return [
        '<li>',
        '  <span class="post-date">' + formatDate(post.date) + '</span>',
        '  <span class="post-title"><a href="' + link + '">' + post.title + '</a></span>',
        '  <span class="post-excerpt">' + excerptHtml + '</span>',
        '</li>'
      ].join('\n');
    }).join('\n');

    return '<ul id="updates-list">' + items + '</ul>';
  }

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
        el.innerHTML = renderTeaser(posts, options.count, rootPath, options.wordLimit);
      } else {
        el.innerHTML = renderFull(posts, rootPath);
      }
    });
  };

})();
