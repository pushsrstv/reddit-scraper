async function testSingleRSS() {
  const url = 'https://www.reddit.com/r/AndroidClosedTesting/new/.rss';
  console.log('Fetching:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/atom+xml, application/xml, text/xml'
      }
    });

    console.log('Status:', res.status);
    if (res.ok) {
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

        const title = titleMatch ? titleMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '';
        const link = linkMatch ? linkMatch[1] : '';
        const author = authorMatch ? authorMatch[1].replace('/u/', '') : 'user';
        const updated = updatedMatch ? new Date(updatedMatch[1]).getTime() : Date.now();
        const contentRaw = contentMatch ? contentMatch[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&') : '';
        const contentClean = contentRaw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

        entries.push({
          title,
          link,
          author,
          timestamp: new Date(updated).toLocaleString(),
          snippet: contentClean.substring(0, 150)
        });
      }

      console.log(`\n🎉 SUCCESS! Parsed ${entries.length} LIVE REAL POSTS from r/AndroidClosedTesting:`);
      entries.slice(0, 5).forEach((item, idx) => {
        console.log(`\n--- [Post ${idx + 1}] ---`);
        console.log(`Title: ${item.title}`);
        console.log(`Author: u/${item.author}`);
        console.log(`Date: ${item.timestamp}`);
        console.log(`URL: ${item.link}`);
      });
    }
  } catch (e) {
    console.error(e);
  }
}

testSingleRSS();
