async function loadPostsIndex() {
  const res = await fetch('./posts/index.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load post index');
  return res.json();
}

function escapeHtml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sanitizeUrl(url) {
  const raw = String(url ?? '').trim();
  if (!raw) return null;

  // Allow safe relative links (e.g. /path, ./path, ../path)
  if (raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) {
    return raw;
  }

  try {
    const parsed = new URL(raw);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch {
    return null;
  }
}

function inlineMarkdown(text) {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, url) => {
      const safeHref = sanitizeUrl(url);
      const safeLabel = label;
      if (!safeHref) return safeLabel;
      const hrefAttr = escapeHtml(safeHref);
      return `<a href="${hrefAttr}" rel="noopener noreferrer nofollow">${safeLabel}</a>`;
    });
}

function markdownToHtml(md) {
  const cleaned = md.startsWith('---\n') ? md.replace(/^---\n[\s\S]*?\n---\n/, '') : md;
  const lines = cleaned.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inList = false;
  let inCode = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (line.startsWith('```')) {
      if (!inCode) {
        inCode = true;
        out.push('<pre><code>');
      } else {
        inCode = false;
        out.push('</code></pre>');
      }
      continue;
    }

    if (inCode) {
      out.push(`${escapeHtml(rawLine)}\n`);
      continue;
    }

    if (!line) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      continue;
    }

    if (line.startsWith('# ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h1>${inlineMarkdown(line.slice(2))}</h1>`);
      continue;
    }

    if (line.startsWith('## ')) {
      if (inList) {
        out.push('</ul>');
        inList = false;
      }
      out.push(`<h2>${inlineMarkdown(line.slice(3))}</h2>`);
      continue;
    }

    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineMarkdown(line.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      out.push('</ul>');
      inList = false;
    }

    out.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  if (inList) out.push('</ul>');
  return out.join('\n');
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function renderError(container, message) {
  clearNode(container);
  const p = document.createElement('p');
  p.textContent = message;
  container.appendChild(p);
}

async function renderPostList() {
  const container = document.getElementById('post-list');
  if (!container) return;

  try {
    const index = await loadPostsIndex();
    clearNode(container);

    const posts = (index.posts || [])
      .slice()
      .sort((a, b) => {
        const aTs = Date.parse(a.published_at || a.date);
        const bTs = Date.parse(b.published_at || b.date);
        if (bTs !== aTs) return bTs - aTs;
        return (a.file || '').localeCompare(b.file || '');
      });

    if (!posts.length) {
      renderError(container, 'No posts yet.');
      return;
    }

    for (const post of posts) {
      const link = document.createElement('a');
      link.className = 'post-link';
      link.href = `./post.html?slug=${encodeURIComponent(post.slug || '')}`;

      const title = document.createElement('strong');
      title.textContent = String(post.title || 'Untitled');

      const meta = document.createElement('p');
      const summary = String(post.summary || '').trim();
      meta.textContent = `${formatDate(post.published_at || post.date)}${summary ? ` • ${summary}` : ''}`;

      link.appendChild(title);
      link.appendChild(meta);
      container.appendChild(link);
    }
  } catch {
    renderError(container, 'Could not load posts.');
  }
}

async function renderSinglePost() {
  const container = document.getElementById('post-content');
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  if (!slug) {
    renderError(container, 'Missing post slug.');
    return;
  }

  try {
    const index = await loadPostsIndex();
    const post = (index.posts || []).find((p) => p.slug === slug);
    if (!post) {
      renderError(container, 'Post not found.');
      return;
    }

    const res = await fetch(`./posts/${post.file}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Could not load post');
    const markdown = await res.text();

    document.title = `${String(post.title || 'Post')} | Klaws Blog`;

    clearNode(container);

    const h1 = document.createElement('h1');
    h1.textContent = String(post.title || 'Untitled');

    const meta = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = formatDate(post.published_at || post.date);
    meta.appendChild(em);

    const article = document.createElement('article');
    article.innerHTML = markdownToHtml(markdown);

    container.appendChild(h1);
    container.appendChild(meta);
    container.appendChild(article);
  } catch {
    renderError(container, 'Could not render post.');
  }
}

renderPostList();
renderSinglePost();
