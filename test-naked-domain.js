async function testNakedDomain() {
  const subreddits = [
    'AndroidClosedTesting',
    'GooglePlayConsole',
    'playstoretesters',
    'AndroidTesting',
    'androiddev',
    'AppDevelopers'
  ];

  let total = 0;
  for (const sub of subreddits) {
    const url = `https://reddit.com/r/${sub}/new/.rss`;
    console.log(`Fetching: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
          'Accept': 'application/atom+xml, application/xml, text/xml'
        }
      });
      console.log(`Status for r/${sub}: ${res.status}`);
      if (res.ok) {
        const xml = await res.text();
        const entryCount = (xml.match(/<entry>/g) || []).length;
        console.log(`SUCCESS! Found ${entryCount} real posts from r/${sub}!`);
        total += entryCount;
      }
    } catch (e) {
      console.error(e.message);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n🎉 TOTAL REAL SCRAPED POSTS: ${total}`);
}

testNakedDomain();
