async function testNitterInstances() {
  const instances = [
    'https://nitter.privacydev.net',
    'https://nitter.poast.org',
    'https://nitter.lucabased.xyz',
    'https://nitter.x86-64.net',
    'https://nitter.cz',
    'https://nitter.woodland.cafe'
  ];

  const query = encodeURIComponent('"closed testing" OR "12 testers"');

  for (const inst of instances) {
    const url = `${inst}/search/rss?f=tweets&q=${query}`;
    console.log(`Testing Nitter RSS: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
        }
      });
      console.log(`Status for ${inst}:`, res.status);
      if (res.ok) {
        const xml = await res.text();
        const itemCount = (xml.match(/<item>/g) || []).length;
        console.log(`🎉 SUCCESS! Found ${itemCount} tweets on ${inst}!`);
      }
    } catch (e) {
      console.error(`Failed ${inst}:`, e.message);
    }
  }
}

testNitterInstances();
