async function testProxy() {
  const targetUrl = encodeURIComponent('https://www.reddit.com/r/AndroidClosedTesting/new.json?limit=25');
  const proxyUrl = `https://api.allorigins.win/get?url=${targetUrl}`;

  console.log('Testing proxy URL:', proxyUrl);
  try {
    const res = await fetch(proxyUrl);
    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      const rawContent = data.contents;
      const parsed = JSON.parse(rawContent);
      const posts = parsed?.data?.children || [];
      console.log(`SUCCESS! Found ${posts.length} real live posts via proxy!`);
      if (posts.length > 0) {
        console.log('Sample Live Post 1:', posts[0].data.title);
        console.log('Author:', posts[0].data.author);
        console.log('Link:', 'https://reddit.com' + posts[0].data.permalink);
      }
    } else {
      console.log('Failed proxy fetch:', res.statusText);
    }
  } catch (e) {
    console.error(e);
  }
}

testProxy();
