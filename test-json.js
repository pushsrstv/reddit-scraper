async function testJson() {
  const url = 'https://www.reddit.com/r/AndroidClosedTesting/new.json?limit=25';
  console.log('Fetching JSON:', url);
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'android:com.testerhunt.app:v1.0.0 (by /u/testerhunt_dev_2026)',
        'Accept': 'application/json'
      }
    });

    console.log('Status:', res.status);
    if (res.ok) {
      const data = await res.json();
      const children = data?.data?.children || [];
      console.log(`Success! Found ${children.length} posts.`);
      if (children.length > 0) {
        console.log('First real live post:', children[0].data.title);
        console.log('Author:', children[0].data.author);
        console.log('Permalink:', 'https://reddit.com' + children[0].data.permalink);
      }
    } else {
      console.log('Error body:', (await res.text()).substring(0, 300));
    }
  } catch (e) {
    console.error(e);
  }
}

testJson();
