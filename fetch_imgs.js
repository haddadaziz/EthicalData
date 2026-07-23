const https = require('https');

https.get('https://ethicaldatasecurity.ma/', { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const urls = data.match(/url\(['"]?(.*?)['"]?\)|src=['"](.*?\.(png|jpg|jpeg|webp))['"]/gi);
    if (urls) {
      console.log(urls.filter(u => !u.includes('logo') && !u.includes('svg')));
    } else {
      console.log("No URLs found.");
    }
  });
}).on('error', err => console.error(err));
