async function testTwitterSyndication() {
  const query = encodeURIComponent('"closed testing" OR "12 testers"');
  // Twitter syndication search widget endpoint
  const url = `https://syndication.twitter.com/settings?feature=search`;
  console.log('Testing Twitter Syndication search...');

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testTwitterSyndication();
