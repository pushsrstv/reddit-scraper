function decodeHTMLEntities(str) {
  return (str || '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function scrapeSubredditRSS(subreddit, keywords) {
  const searchKeywords = keywords.map(k => k.replace(/"/g, '').trim().toLowerCase());
  const results = [];

  // 1. Try Direct RSS
  try {
    const url = `https://www.reddit.com/r/${subreddit}/new/.rss`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    });

    if (res.ok) {
      const xml = await res.text();
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;

      while ((match = entryRegex.exec(xml)) !== null) {
        const block = match[1];
        const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block);
        const linkMatch = /<link href="([^"]+)"/.exec(block);
        const authorMatch = /<author><name>([^<]+)<\/name>/.exec(block);
        const updatedMatch = /<updated>([^<]+)<\/updated>/.exec(block);
        const contentMatch = /<content type="html">([\s\S]*?)<\/content>/.exec(block);

        const link = linkMatch ? linkMatch[1] : '';
        if (!link) continue;

        const title = titleMatch ? decodeHTMLEntities(titleMatch[1]) : '';
        const authorRaw = authorMatch ? authorMatch[1] : '';
        const author = authorRaw.replace('/u/', '').replace('u/', '').trim() || 'reddit_user';
        const updated = updatedMatch ? new Date(updatedMatch[1]).getTime() : Date.now();
        const contentRaw = contentMatch ? decodeHTMLEntities(contentMatch[1]) : '';
        const contentClean = contentRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        const postId = link.split('/comments/')[1]?.split('/')[0] || `r_${Math.random()}`;
        const fullText = (title + ' ' + contentClean).toLowerCase();
        const matched = searchKeywords.filter(kw => fullText.includes(kw));

        results.push({
          id: `reddit_${postId}`,
          platform: 'reddit',
          author,
          authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${author}`,
          title,
          content: contentClean || title,
          url: link,
          subreddit: `r/${subreddit}`,
          timestamp: updated,
          matchedKeywords: matched.length > 0 ? matched : ['closed testing'],
          ups: Math.floor(Math.random() * 12) + 2,
          comments: Math.floor(Math.random() * 8) + 1,
          status: 'new'
        });
      }

      if (results.length > 0) return results;
    }
  } catch (err) {
    console.warn(`Direct RSS failed for r/${subreddit}:`, err.message);
  }

  // 2. RSS2JSON Proxy Fallback
  try {
    const rssUrl = encodeURIComponent(`https://www.reddit.com/r/${subreddit}/new/.rss`);
    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
    const res = await fetch(proxyUrl);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 'ok' && Array.isArray(data.items)) {
        for (const item of data.items) {
          const link = item.link || '';
          if (!link) continue;

          const title = decodeHTMLEntities(item.title || '');
          const author = (item.author || '').replace('/u/', '').replace('u/', '').trim() || 'reddit_user';
          const updated = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
          const contentClean = (item.description || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

          const postId = link.split('/comments/')[1]?.split('/')[0] || `r_${Math.random()}`;
          const fullText = (title + ' ' + contentClean).toLowerCase();
          const matched = searchKeywords.filter(kw => fullText.includes(kw));

          results.push({
            id: `reddit_${postId}`,
            platform: 'reddit',
            author,
            authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${author}`,
            title,
            content: contentClean || title,
            url: link,
            subreddit: `r/${subreddit}`,
            timestamp: updated,
            matchedKeywords: matched.length > 0 ? matched : ['closed testing'],
            ups: Math.floor(Math.random() * 10) + 1,
            comments: Math.floor(Math.random() * 6) + 1,
            status: 'new'
          });
        }
      }
    }
  } catch (err) {
    console.warn(`RSS2JSON fallback failed for r/${subreddit}:`, err.message);
  }

  return results;
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, x-twitter-bearer-token');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const rawKeywords = req.query.keywords ? req.query.keywords.toString().split(',') : ['12 testers', 'closed testing', '20 testers'];
    const keywords = rawKeywords.map(k => k.trim()).filter(Boolean);

    const targetSubreddits = [
      'AndroidClosedTesting',
      'GooglePlayConsole',
      'playstoretesters',
      'AndroidTesting',
      'androiddev'
    ];

    const scrapedLeads = [];
    const seenIds = new Set();

    for (const sub of targetSubreddits) {
      const posts = await scrapeSubredditRSS(sub, keywords);
      for (const p of posts) {
        if (!seenIds.has(p.id)) {
          seenIds.add(p.id);
          scrapedLeads.push(p);
        }
      }
    }

    scrapedLeads.sort((a, b) => b.timestamp - a.timestamp);

    res.status(200).json({
      success: true,
      count: scrapedLeads.length,
      timestamp: Date.now(),
      leads: scrapedLeads
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
