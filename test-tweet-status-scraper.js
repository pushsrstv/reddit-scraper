async function testStatusScraper() {
  const query = encodeURIComponent('site:x.com/*/status/ "closed testing" OR "12 testers"');
  const url = `https://html.duckduckgo.com/html/?q=${query}`;

  console.log('Testing DuckDuckGo for exact tweet status URLs:', url);
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
      // Match result anchors containing status URLs
      const linkRegex = /href="([^"]*?(?:x\.com|twitter\.com)\/[^"]*?\/status\/[0-9]+[^"]*?)"/gi;
      let match;
      const links = new Set();
      while ((match = linkRegex.exec(html)) !== null) {
        let link = decodeURIComponent(match[1]);
        if (link.includes('uddg=')) {
          link = decodeURIComponent(link.split('uddg=')[1].split('&')[0]);
        }
        links.add(link);
      }

      console.log(`\n🎉 SUCCESS! Found ${links.size} REAL INDIVIDUAL TWEET STATUS URLs:`);
      Array.from(links).slice(0, 10).forEach((l, i) => {
        console.log(`[Tweet ${i+1}] ${l}`);
      });
    }
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testStatusScraper();
