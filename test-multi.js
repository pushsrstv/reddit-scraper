async function testMultiSubRSS() {
  const url = 'https://www.reddit.com/r/AndroidClosedTesting+androiddev+GooglePlayConsole+playstoretesters+AndroidTesting/new/.rss';
  console.log('Fetching multi-subreddit RSS:', url);
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
      const entryCount = (xml.match(/<entry>/g) || []).length;
      console.log(`Success! Found ${entryCount} real posts in multi-subreddit feed.`);
    }
  } catch (e) {
    console.error(e);
  }
}

testMultiSubRSS();
