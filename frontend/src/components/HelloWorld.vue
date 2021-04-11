<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button v-on:click="sendUncompressed()">Send book uncompressed</button>
    <button v-on:click="sendCompressed()">Send book compressed</button>
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
      this.sendMetadata(compressed.binaryData, {
        codes: compressed.codes,
        numberOf8BitChunks: compressed.numberOf8BitChunks,
        codeLengthInBits: compressed.codeLengthInBits,
        totalBits: compressed.totalBits,
        dataBits: compressed.dataBits,
        unusedBits: compressed.unusedBits  });
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
    }
  }


}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1 {
  color: deepskyblue;
}
</style>
