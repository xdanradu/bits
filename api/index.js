let express = require('express');
const fs = require('fs');
let cors = require('cors');
let app = express();
app.use(cors());

const parseRawBody = (req, res, next) => {
  req.setEncoding('utf8');
  req.rawBody = '';
  req.on('data', (chunk) => {
    req.rawBody += chunk;
  });
  req.on('end', () => {
    next();
  });
}
app.use(parseRawBody);


app.get('/', function (request, response) {
  response.json({ message: `REST API running on ${request.headers.host}` });
});

app.post('/data', function (request, response) {
  console.log(request.body);
  const payloadSize = formatBytes(request.get("content-length"), 2);
  fs.writeFileSync('data.txt', request.rawBody);
  console.log (`Received and saved ${payloadSize}` );
  response.json({ status: `Received ${payloadSize}` });
});

app.listen(3000, function () {
  console.log('Server running @ localhost:3000');
});

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
