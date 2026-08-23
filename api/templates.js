const defaultTemplates = [
  {
    id: 't1',
    name: '🤝 14-Day Tester Swap (Recommended)',
    content: `Hi {author}! I saw your post looking for testers for your app. I can test your app for the full 14 days!

Here is my opt-in link: {my_app_link}
Google Group: {my_group_link}

Please send me your links too and I will install it right away and send a screenshot! Let's swap!`
  },
  {
    id: 't2',
    name: '📲 Quick Opt-In & Feedback Exchange',
    content: `Hey @{author}! I'm also running a closed test on Google Play and need testers.

I'll gladly test yours and leave feedback on Play Store.
My Join Link: {my_app_link}

Drop your link below and I'll opt in immediately!`
  },
  {
    id: 't3',
    name: '⭐ Google Group + Web Tester Link',
    content: `Hello {author}, I just joined your testing group!

Could you please join mine as well?
Web Link: {my_app_link}
Group Link: {my_group_link}

I promise to keep your app installed for 14+ days. Thanks!`
  }
];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({ success: true, templates: defaultTemplates });
}
