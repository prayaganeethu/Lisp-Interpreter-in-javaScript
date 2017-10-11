let env = {
  // '+': function (arg) { arg.reduce(function (sum, value) { return sum + value }) }
  '+': function (arg) { return arg[0] + arg[1] },
  '-': function (arg) { return arg[0] - arg[1] },
  '*': function (arg) { return arg[0] * arg[1] },
  '/': function (arg) { return arg[0] / arg[1] },
  '%': function (arg) { return arg[0] + arg[1] },
  '<': function (arg) { return arg[0] < arg[1] },
  '>': function (arg) { return arg[0] > arg[1] },
  '<=': function (arg) { return arg[0] <= arg[1] },
  '>=': function (arg) { return arg[0] >= arg[1] },
  'pow': function (arg) { return Math.pow(arg[0], arg[1]) },
  'pi': function (arg) { return Math.PI },
  'length': function (arg) { return arg[0].length },
  'max': function (arg) { return Math.max(arg) },
  'min': function (arg) { return Math.min(arg) },
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

let lispParser = factoryParser(defineParser, expressionParser, symbolParser, literalParser)

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
  console.log('Expression')
  let lispy = ''
  let i = 1
  if (spaceParser(lispInput)[0] === '(') {
    while (lispInput[i] !== ')') {
      lispy += lispInput[i]
      i++
    }
  }
  lispy = spaceParser(lispy)
  let argArr = []
  let args = lispy.split(' ')
  let op = args[0]
  for (let i = 1; i < args.length; i++) {
    if (args[i] !== ' ') {
      argArr.push(parseFloat(args[i]))
    }
  }
  let res
  if (op in env) {
    res = env[op](argArr)
  }
  return res
}

function symbolParser (lispInput) {
  console.log('symbol', lispInput)
  let symbol = ''
  let i = 0
  if (/^[a-zA-Z-]/.test(lispInput[i])) {
    while (lispInput[i] !== ' ') {
      symbol += lispInput[i]
      i++
    }
    return [symbol, spaceParser(lispInput.slice(i))]
  }
  return null
}

function literalParser (lispInput) {
  console.log('literal')
  let num = ''
  let i = 0
  if (/[0-9]+/.test(lispInput[i])) {
    while (/[0-9]+/.test(lispInput[i])) {
      num += lispInput[i]
      i++
    }
    console.log([num, spaceParser(lispInput.slice(i))])
    return [num, spaceParser(lispInput.slice(i))]
  }
  return null
}

function spaceParser (lispInput) {
  while (/\s/.test(lispInput[0])) lispInput = lispInput.slice(1)
  return lispInput
}

function defineParser (lispInput) {
  console.log('define')
  if (lispInput.slice(0, 6) === 'define') {
    let res = symbolParser(spaceParser(lispInput.slice(7)))
    let symbol = res[0]
    console.log('hey', res[1])
    let val = lispParser(spaceParser(res[1]))
    console.log('val', val[0])
    env[symbol] = val[0]
    return env
  }
  return null
}
