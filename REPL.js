let lispI = require('./parsers.js')

const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

var recursiveAsyncReadLine = function () {
  rl.question('>>>', function (answer) {
    if (answer === 'exit') {
      return rl.close()
    }
    answer = lispI.interpretLisp(answer)
    console.log(`Result: ${JSON.stringify(answer)}`)
    recursiveAsyncReadLine()
  })
}

recursiveAsyncReadLine()
