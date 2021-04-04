let express = require('express');
let bitsUtils = require('bits-utils');
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
  const payloadSize = bitsUtils.getSize(request.get("content-length"), 2);
  fs.writeFileSync('data.txt', request.rawBody);
  console.log (`Received and saved ${payloadSize}` );
  response.json({ status: `Received ${payloadSize}` });
});

app.listen(3000, function () {
  console.log('Server running @ localhost:3000');
});
