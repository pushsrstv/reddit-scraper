async function testGoogleRssStatus() {
  const queries = [
    'inurl:status "closed testing"',
    'inurl:status "12 testers"',
    'inurl:status "20 testers"',
    'site:x.com inurl:status "closed testing"'
  ];

  for (const q of queries) {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=en-US&gl=US&ceid=US:en`;
    console.log(`\nTesting query: ${q}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml'
        }
      });

      console.log('Status:', res.status);
      if (res.ok) {
        const xml = await res.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        let count = 0;

        while ((match = itemRegex.exec(xml)) !== null) {
          const block = match[1];
          const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block);
          const linkMatch = /<link>([\s\S]*?)<\/link>/.exec(block);
          const pubDateMatch = /<pubDate>([\s\S]*?)<\/pubDate>/.exec(block);

          const title = titleMatch ? titleMatch[1] : '';
          const link = linkMatch ? linkMatch[1] : '';

          if (title.length > 10) {
            count++;
            console.log(`  [Post ${count}] Title: ${title.substring(0, 70)}... | Link: ${link.substring(0, 60)}...`);
          }
        }
        console.log(`Total extracted: ${count}`);
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

testGoogleRssStatus();
