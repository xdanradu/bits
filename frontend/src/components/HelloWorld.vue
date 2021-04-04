<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button v-on:click="handleClick()">Send book</button>
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
    //this.loadFileAndPrintToConsole('http://127.0.0.1:4200/shakespeare.txt');
    this.loadFileAndPrintToConsole('https://threejsfundamentals.org/LICENSE');
  },
  methods: {
    loadFileAndPrintToConsole: async function (url) {
      try {
        const response = await fetch(url);
        const data = await response.text();
        const symbols = bitsUtils.countDistinctASCIISymbols(data);
        // console.log(symbols);
        const usedSymbols = 256 - symbols.filter(el => el.count === 0).length;
        console.log(
            `Initial size using ASCII: ${bitsUtils.getSize(data.length * 8, 0)}`
        );
        let fixedCodeLength = usedSymbols.toString(2).length - 1;
        console.log(
            `First compression using fixed codes on ${fixedCodeLength} bits`
        );
        console.log(
            `Size using fixed codes:  ${bitsUtils.getSize(data.length * fixedCodeLength, 0)}  + control size: ${bitsUtils.getSize(usedSymbols * 8)}`
        );
        const alphabet = symbols.filter(el => el.count > 0);
        console.log(alphabet.sort((a, b) => b.count - a.count)); //descending sort
        this.text = data;
      } catch (err) {
        console.error(err);
      }
    },
    handleClick: function() {
      let url = 'http://localhost:3000/data';
      // let binary = new Uint8Array(2);
      // binary[0] = 3;
      // binary[1] = 7;
      axios
          .post(url, this.text, {
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
