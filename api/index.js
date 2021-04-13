let express = require('express');
let bitsUtils = require('bits-utils');
const fs = require('fs');
let cors = require('cors');
let Parser = require("binary-parser").Parser;

let app = express();
app.use(cors());


const parseRawBody = (req, res, next) => {
  req.setEncoding('binary');
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

app.post('/uncompressed', function (request, response) {
  const payloadSize = bitsUtils.getSize(request.get("content-length"), 2);
  fs.writeFileSync('data-uncompressed.txt', request.rawBody);
  console.log (`Received and saved ${payloadSize}` );
  response.json({ status: `Received ${payloadSize}` });
});

let metadata = null;
let metadataSizeInBytes = '';
app.post('/compressed-metadata', function (request, response) {
  const payloadSize = request.get("content-length");
  metadataSizeInBytes = payloadSize;
  const temp = JSON.parse(request.rawBody);

  metadata = {codes: new Map(JSON.parse(temp.codes)),
    numberOf8BitChunks: temp.numberOf8BitChunks,
    codeLengthInBits: temp.codeLengthInBits,
    totalBits: temp.totalBits,
    dataBits: temp.dataBits,
    unusedBits: temp.unusedBits }
  response.json({ status: `Received ${bitsUtils.getSize(payloadSize, 2)} metadata` });
});

app.post('/compressed-data', function (request, response) {
  const payloadSizeInBytes = request.get("content-length");
  let buf = Buffer.from(request.rawBody, 'binary');
  const parser = new Parser()
      .array("data", {
        type: "uint8",
        length: metadata.numberOf8BitChunks
      });

  const compressed = {binaryData: parser.parse(buf).data, ...metadata};
  console.time('decompression');
  const uncompressed = bitsUtils.decompress(compressed);
  console.timeEnd('decompression')
  // fs.writeFileSync('binary-data.txt', request.rawBody);
  fs.writeFileSync('original-data.txt', uncompressed);
  console.log (`ASCII data size: ${bitsUtils.getSize(uncompressed.length)}` );
  console.log (`Data: ${bitsUtils.getSize(payloadSizeInBytes)} + Metadata: ${bitsUtils.getSize(metadataSizeInBytes)}` );
  response.json({ status: `Received ${bitsUtils.getSize(payloadSizeInBytes, 2)} binary data` });
});

app.listen(3000, function () {
  console.log('Server running @ localhost:3000');
});
