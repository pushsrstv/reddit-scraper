async function testProxies() {
  const proxies = [
    'https://corsproxy.io/?https://www.reddit.com/r/AndroidClosedTesting/new.json?limit=25',
    'https://api.codetabs.com/v1/proxy?quest=https://www.reddit.com/r/AndroidClosedTesting/new.json?limit=25',
    'https://cors-anywhere.herokuapp.com/https://www.reddit.com/r/AndroidClosedTesting/new.json?limit=25'
  ];

  for (const p of proxies) {
    console.log(`Testing: ${p}`);
    try {
      const res = await fetch(p, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
        }
      });
      console.log(`Status: ${res.status}`);
      if (res.ok) {
        const text = await res.text();
        console.log(`Success! Response length: ${text.length}`);
        if (text.startsWith('{')) {
          const data = JSON.parse(text);
          const children = data?.data?.children || [];
          console.log(`Found ${children.length} posts!`);
          if (children.length > 0) {
            console.log('Sample post:', children[0].data.title);
          }
        }
      }
    } catch (e) {
      console.error('Error:', e.message);
    }
  }
}

testProxies();
