const http = require('http');

const data = JSON.stringify({
  name: 'Test User',
  email: 'test@example.com',
  phone: '0000000000',
  location: 'Local',
  bio: 'Test profile from script',
  totalSaved: 100,
  monthlyAverage: 50
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/profile',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(data);
req.end();
