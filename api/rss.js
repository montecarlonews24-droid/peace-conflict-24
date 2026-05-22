module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RSS Reader)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) throw new Error('HTTP ' + response.status);

    const xml = await response.text();

    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(xml)) !== null) {
      const item = match[1];

      const titleMatch = item.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i);
      const linkMatch = item.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i) ||
                        item.match(/<link[^>]*\/>/i);
      const dateMatch = item.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i) ||
                        item.match(/<dc:date[^>]*>([\s\S]*?)<\/dc:date>/i);

      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const link = linkMatch ? linkMatch[1].replace(/<[^>]+>/g, '').trim() : '';
      const date = dateMatch ? dateMatch[1].trim() : new Date().toISOString();

      if (title && title.length > 5) {
        items.push({ title, link, pubDate: date });
      }

      if (items.length >= 50) break;
    }

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    return res.status(200).json({ status: 'ok', items });

  } catch (err) {
    return res.status(500).json({ error: err.message, items: [] });
  }
}
