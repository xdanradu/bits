function countDistinctSymbols(text) {
  let counter = Array(256).fill(0);

  for (let i=0; i< text.length; i++) {
    counter[text[i].charCodeAt(0)]++;
  }

  return counter.map((el,index) => {return {symbol: String.fromCharCode(index), count: el}});
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

new Vue({
  el: '#app',
  data: {
    username: '',
    password: '',
    status: '',
    products: [],
    text: ''
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
        const symbols = countDistinctSymbols(data);
        // console.log(symbols);
        const usedSymbols = 256 - symbols.filter(el => el.count === 0).length;
        console.log(`Initial size using ASCII: ${formatBytes(data.length * 8, 0) }`);
        console.log(`First compression using fixed codes on ${(usedSymbols).toString(2).length - 1} bits`);
        console.log(`Size using fixed codes:  ${formatBytes(data.length * 4, 0) }`);
        const alphabet = symbols.filter(el => el.count > 0);
        console.log(alphabet.sort((a, b)=>b.count - a.count));//descending sort
        this.text = data;
      } catch (err) {
        console.error(err);
      }
    },
    send: function () {
      console.log('ceva');
      let url = 'http://localhost:3000/data';
      // let binary = new Uint8Array(2);
      // binary[0] = 3;
      // binary[1] = 7;
      axios
          .post(url, this.text, {
            headers: {
              'Content-Type': 'text/html',
            }
          })
          .then(response => {
            console.log(response.data);
          });

    }
  }
});
