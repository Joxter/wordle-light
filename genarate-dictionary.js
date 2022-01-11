let fs = require('fs')

function transform(input, out = input) {
  let trimmedWords = fs
    .readFileSync(`./${input}.txt`, 'utf-8')
    .split(/\r?\n/)
    .map(w => w.trim())

  let words4 = new Set(trimmedWords.filter(w => w.length === 4))

  let words5 = trimmedWords.filter(w => {
    if (w.length === 5) {
      let isPlural = w[4] === 's' && words4.has(w.slice(0, 4))
      return !isPlural
    }
    return false
  })

  fs.writeFileSync(`./${out}.js`, `window.dictionary=new Set(['${words5.join(`','`)}']);`, {
    flag: 'w',
  })
  console.log(input, words5.length)
}

transform('all-words', 'dictionary')
