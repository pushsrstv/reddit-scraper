async function testRssWithDelay() {
  const subreddits = ['AndroidClosedTesting', 'GooglePlayConsole', 'playstoretesters', 'AndroidTesting'];
  const allPosts = [];

  for (const sub of subreddits) {
    const url = `https://www.reddit.com/r/${sub}/new/.rss`;
    console.log(`Fetching RSS for r/${sub}...`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/atom+xml, application/xml, text/xml'
        }
      });
      console.log(`Status for r/${sub}:`, res.status);
      if (res.ok) {
        const xml = await res.text();
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
        let match;
        let count = 0;

        while ((match = entryRegex.exec(xml)) !== null) {
          count++;
          const block = match[1];
          const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(block);
          const linkMatch = /<link href="([^"]+)"/.exec(block);
          const authorMatch = /<author><name>([^<]+)<\/name>/.exec(block);

          if (titleMatch && linkMatch) {
            allPosts.push({
              title: titleMatch[1],
              url: linkMatch[1],
              author: authorMatch ? authorMatch[1] : 'user',
              sub
            });
          }
        }
        console.log(`Successfully parsed ${count} posts from r/${sub}!`);
      }
    } catch (e) {
      console.error(e.message);
    }
    // Sleep 1.2s to prevent 429
    await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nTOTAL REAL LIVE POSTS FETCHED: ${allPosts.length}`);
  if (allPosts.length > 0) {
    console.log('Sample Live Post 1:', allPosts[0]);
    console.log('Sample Live Post 5:', allPosts[4] || allPosts[1]);
  }
}

testRssWithDelay();
