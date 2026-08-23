async function parseRedditRSS(subreddit) {
  const url = `https://www.reddit.com/r/${subreddit}/new/.rss`;
  console.log(`Fetching RSS for r/${subreddit}...`);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    });

    if (!res.ok) {
      console.log(`r/${subreddit} failed with status: ${res.status}`);
      return [];
    }

    const xml = await res.text();
    const entries = [];
    const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
    let match;

    while ((match = entryRegex.exec(xml)) !== null) {
      const block = match[1];
      
      const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block);
      const linkMatch = /<link href="([^"]+)"/.exec(block);
      const authorMatch = /<author><name>([^<]+)<\/name>/.exec(block);
      const updatedMatch = /<updated>([^<]+)<\/updated>/.exec(block);
      const contentMatch = /<content type="html">([\s\S]*?)<\/content>/.exec(block);

      const title = titleMatch ? decodeHTMLEntities(titleMatch[1]) : '';
      const link = linkMatch ? linkMatch[1] : '';
      const author = authorMatch ? authorMatch[1].replace('/u/', '') : 'reddit_user';
      const updated = updatedMatch ? new Date(updatedMatch[1]).getTime() : Date.now();
      const contentRaw = contentMatch ? decodeHTMLEntities(contentMatch[1]) : '';
      const contentClean = contentRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

      entries.push({
        id: `reddit_${link.split('/comments/')[1]?.split('/')[0] || Math.random()}`,
        platform: 'reddit',
        author,
        authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${author}`,
        title,
        content: contentClean || title,
        url: link,
        subreddit: `r/${subreddit}`,
        timestamp: updated,
        ups: 5,
        comments: 3,
        status: 'new'
      });
    }

    return entries;
  } catch (err) {
    console.error(`Error fetching r/${subreddit}:`, err.message);
    return [];
  }
}

function decodeHTMLEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

async function run() {
  const posts = await parseRedditRSS('AndroidClosedTesting');
  console.log(`Parsed ${posts.length} real live posts from r/AndroidClosedTesting!`);
  if (posts.length > 0) {
    console.log('Sample Live Post 1:', posts[0]);
    console.log('Sample Live Post 2:', posts[1]);
  }
}

run();
