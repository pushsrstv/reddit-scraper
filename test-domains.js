async function testDomains() {
  const domains = [
    'https://old.reddit.com/r/AndroidClosedTesting/new/.rss',
    'https://sh.reddit.com/r/AndroidClosedTesting/new/.rss',
    'https://www.reddit.com/r/AndroidClosedTesting/new/.rss',
    'https://reddit.com/r/AndroidClosedTesting/new/.rss'
  ];

  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    'TesterHuntBot/1.0 (Android closed testing finder; dev@testerhunt.io)',
    'curl/7.68.0'
  ];

  for (const domain of domains) {
    for (const ua of userAgents) {
      console.log(`\nTesting: ${domain} | UA: ${ua.substring(0, 30)}...`);
      try {
        const res = await fetch(domain, {
          headers: {
            'User-Agent': ua,
            'Accept': 'application/atom+xml, application/xml, text/xml'
          }
        });
        console.log(`Status: ${res.status}`);
        if (res.ok) {
          const text = await res.text();
          console.log(`🎉 SUCCESS! Returned ${text.length} bytes`);
          break;
        }
      } catch (e) {
        console.error(e.message);
      }
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}

testDomains();
