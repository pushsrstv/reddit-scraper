async function testTwitterGoogleScrape() {
  const query = encodeURIComponent('site:x.com OR site:twitter.com "closed testing" OR "12 testers"');
  // Google / DuckDuckGo RSS feed for Twitter search
  const url = `https://html.duckduckgo.com/html/?q=${query}`;
  console.log('Testing DuckDuckGo web scrape for Twitter posts...');

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    console.log('Status:', res.status);
    if (res.ok) {
      const html = await res.text();
      // Extract links to x.com or twitter.com
      const linkRegex = /href="([^"]*?(?:x\.com|twitter\.com)\/[^"]*?)"/gi;
      let match;
      const links = new Set();
      while ((match = linkRegex.exec(html)) !== null) {
        const rawUrl = decodeURIComponent(match[1]);
        if (rawUrl.includes('/status/')) {
          links.add(rawUrl);
        }
      }
      console.log(`🎉 SUCCESS! Found ${links.size} real Twitter/X post URLs:`, Array.from(links));
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testTwitterGoogleScrape();
