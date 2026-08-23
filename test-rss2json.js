async function testRss2Json() {
  const subreddits = [
    'AndroidClosedTesting',
    'GooglePlayConsole',
    'playstoretesters',
    'AndroidTesting',
    'androiddev'
  ];

  let total = 0;
  for (const sub of subreddits) {
    const rssUrl = encodeURIComponent(`https://www.reddit.com/r/${sub}/new/.rss`);
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
    console.log(`Fetching rss2json for r/${sub}...`);
    try {
      const res = await fetch(apiUrl);
      console.log(`Status for r/${sub}: ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ok' && Array.isArray(data.items)) {
          console.log(`🎉 SUCCESS! Extracted ${data.items.length} real posts from r/${sub}!`);
          if (data.items.length > 0) {
            console.log('  Sample post 1 title:', data.items[0].title);
            console.log('  Sample post 1 URL:', data.items[0].link);
            console.log('  Sample post 1 author:', data.items[0].author);
          }
          total += data.items.length;
        }
      }
    } catch (e) {
      console.error(e.message);
    }
  }

  console.log(`\n🚀 GRAND TOTAL REAL SCRAPED POSTS VIA RSS2JSON: ${total}`);
}

testRss2Json();
