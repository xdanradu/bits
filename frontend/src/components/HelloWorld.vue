<template>
  <div class="hello">
    <h1>{{ msg }} <span v-if="compressionRate">{{ compressionRate }}%</span></h1>
    <button v-on:click="sendUncompressed()">Send uncompressed text</button>
    <button v-on:click="sendCompressed()">Send compressed text</button>
  </div>
</template>

<script>
let bitsUtils = require("bits-utils");
let axios = require("axios");

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data() {
    return {
      uncompressedSize: 0,
      compressedSize: 0,
      compressionRate: 0
    }
  },
  created() {
    this.loadFileAndPrintToConsole('http://127.0.0.1:8081/test-data.txt');//run http-server -o --cors in resources before
    // this.loadFileAndPrintToConsole('https://threejsfundamentals.org/LICENSE');
  },
  methods: {
    loadFileAndPrintToConsole: async function (url) {
      try {
        const response = await fetch(url);
        const data = await response.text();
        this.text = data;
      } catch (err) {
        console.error(err);
      }
    },
    sendUncompressed: function() {
      let url = 'http://localhost:3000/uncompressed';
      this.uncompressedSize = this.text.length;
      this.setCompressionRate(this.compressedSize, this.uncompressedSize);
      console.log(bitsUtils.getSize(this.uncompressedSize));
      axios
          .post(url, this.text, {
            headers: {
              'Content-Type': 'text/html'
            }
          })
          .then(response => {
            console.log(response.data);
          });
    },
    sendCompressed: function() {
      const t0 = performance.now();
      const compressed = bitsUtils.compressUsingFixedCodes(this.text);
      const t1 = performance.now();
      console.log("Compression took " + parseFloat(((t1 - t0)/1000)).toFixed(2) + " seconds.");

      const metadata = {
        codes: JSON.stringify(Array.from(compressed.codes.entries())),
        numberOf8BitChunks: compressed.numberOf8BitChunks,
        codeLengthInBits: compressed.codeLengthInBits,
        totalBits: compressed.totalBits,
        dataBits: compressed.dataBits,
        unusedBits: compressed.unusedBits  }

      this.compressedSize = compressed.numberOf8BitChunks + JSON.stringify(metadata).length;
      console.log(`Metadata size: ${bitsUtils.getSize(JSON.stringify(metadata).length)}`);
      console.log(`Binary data: ${bitsUtils.getSize(compressed.numberOf8BitChunks)}`);
      console.log(`Compressed data size: ${bitsUtils.getSize(this.compressedSize)}`);
      this.setCompressionRate(this.compressedSize, this.uncompressedSize);

      this.sendMetadata(compressed.binaryData, metadata);
    },
    sendMetadata: function(binaryData, metadata) {
      let url = 'http://localhost:3000/compressed-metadata';
      axios
          .post(url, metadata, {
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => {
            console.log(response);
            this.sendCompressedData(binaryData);
          });
    },
    sendCompressedData: function(binaryData) {
      let url = 'http://localhost:3000/compressed-data';
      axios
          .post(url, binaryData, {
            headers: {
              'Content-Type': 'text/html'
            }
          })
          .then(response => {
            console.log(response.data);
          });
    },
    setCompressionRate(a, b) {
      if (a && b) { this.compressionRate = parseFloat((1-a/b)*100).toFixed(2);}
    }
  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: deepskyblue;
}

button {
  padding:10px;
  margin:10px;
}

button:hover {
  cursor: pointer;
}
</style>
