let env = {
  // '+': function (arg) { arg.reduce(function (sum, value) { return sum + value }) }
  '+': (arg) => arg.reduce((sum, val) => sum + val),
  '-': (arg) => arg.reduce((dif, val) => dif - val),
  '*': (arg) => arg.reduce((mul, val) => mul * val),
  '/': (arg) => arg.reduce((div, val) => div / val),
  '<': function (arg) { return arg[0] < arg[1] },
  '>': function (arg) { return arg[0] > arg[1] },
  '<=': function (arg) { return arg[0] <= arg[1] },
  '>=': function (arg) { return arg[0] >= arg[1] },
  'pow': function (arg) { return Math.pow(arg[0], arg[1]) },
  'pi': function (arg) { return Math.PI },
  'length': function (arg) { return arg[0].length },
  'max': (arg) => arg.reduce((max, cur) => max > cur ? max : cur),
  'min': (arg) => arg.reduce((min, cur) => min < cur ? min : cur),
  'eq?': function (arg) { return arg[0] == arg[1] },
  'equal?': function (arg) { return arg[0] === arg[1] },
  'sqrt': function (arg) { return arg[0] },
  'round': function (arg) { return Math.round(arg[0]) },
  'not': function (arg) { return !arg[0] },
  'abs': function (arg) { return Math.abs(arg[0]) },
  'append': function (arg) { return String(arg[0]) + String(arg[1]) }
}

exports.interpretLisp = function (lispInput) {
  return (lispInput) ? lispParser(lispInput) : null
}

let lispParser = factoryParser(expressionParser, defineParser, opParser, literalParser, symbolParser)

function factoryParser (...parsers) {
  return function (In) {
    for (let i = 0; i < parsers.length; i++) {
      let result = parsers[i](In)
      if (result != null) return result
    }
    return null
  }
}

function expressionParser (lispInput) {
  // console.log('Expression')
  if (lispInput[0] === '(') {
    return lispParser(spaceParser(lispInput.slice(1)))
  }
  return null
}

function defineParser (lispInput) {
  // console.log('define')
  if (lispInput.slice(0, 6) === 'define') {
    let res = symbolParser(spaceParser(lispInput.slice(7)))
    let symbol = res[0]
    console.log('hey', res[1])
    let val = lispParser(spaceParser(res[1]))
    console.log('val', val[0])
    env[symbol] = val[0]
    console.log(env)
    return [null, val[1]]
  }
  return null
}

function opParser (lispInput) {
  let op = lispInput.split(' ')[0]
  console.log(op)
  let j = op.length
  let arg = ''
  let argArr = []
  lispInput = spaceParser(lispInput.slice(j + 1))
  console.log(lispInput)
  if (op in env) {
    while (lispInput) {
      if (lispInput[0] !== ' ' && lispInput[0] !== ')' && lispInput[0] !== '(') {
        arg += lispInput[0]
        lispInput = lispInput.slice(1)
      }
      else if (lispInput[0] === '(') {
        arg = lispParser(lispInput)
        let args = arg[0]
        lispInput = arg[1]
        argArr.push(parseFloat(args))
        lispInput = lispInput.slice(1)
        arg = ''
      }
      else if (lispInput[0] === ' ') {
        argArr.push(parseFloat(arg))
        lispInput = lispInput.slice(1)
        arg = ''
      }
      else if (lispInput[0] === ')') {
        if (arg) {
          argArr.push(parseFloat(arg))
          arg = ''
        }
        lispInput = lispInput.slice(1)
      }
      console.log('argArr', argArr)
    }
    return [env[op](argArr), lispInput]
  }
  return null
}

function symbolParser (lispInput) {
  // console.log('symbol', lispInput)
  let symbol = ''
  let i = 0
  if (/^[a-zA-Z-]/.test(lispInput[i])) {
    while (lispInput[i] !== ' ' && lispInput[i] !== ')') {
      symbol += lispInput[i]
      i++
    }
    return [symbol, spaceParser(lispInput.slice(i))]
  }
  return null
}

function literalParser (lispInput) {
  // console.log('literal')
  let num = ''
  let i = 0
  if (/[0-9]+/.test(lispInput[i])) {
    while (/[0-9]+/.test(lispInput[i]) && lispInput[i] !== ')') {
      num += lispInput[i]
      i++
    }
    // console.log([num, spaceParser(lispInput.slice(i))])
    return [num, spaceParser(lispInput.slice(i))]
  }
  return null
}

function spaceParser (lispInput) {
  while (/\s/.test(lispInput[0])) lispInput = lispInput.slice(1)
  return lispInput
}
