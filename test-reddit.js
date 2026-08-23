async function testRSS() {
  const urls = [
    'https://www.reddit.com/r/AndroidClosedTesting/new/.rss',
    'https://www.reddit.com/r/AndroidClosedTesting/search.rss?q=closed+testing&sort=new',
    'https://www.reddit.com/r/androiddev/new/.rss',
    'https://www.reddit.com/r/GooglePlayConsole/new/.rss',
    'https://pullpush.io/reddit/search/submission/?q=closed%20testing&subreddit=AndroidClosedTesting',
    'https://api.pushshift.io/reddit/search/submission/?q=closed%20testing'
  ];

  for (const url of urls) {
    console.log(`\nTesting: ${url}`);
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'application/rss+xml, application/xml, text/xml, application/json, */*'
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Success! Response length: ${text.length} chars`);
        console.log('Snippet:', text.substring(0, 300));
      } else {
        console.log('Failed:', res.statusText);
      }
    } catch (e) {
      console.error('Fetch error:', e.message);
    }
  }
}

testRSS();
