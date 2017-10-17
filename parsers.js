let env = {
  '+': (arg) => arg.reduce((sum, val) => sum + val),
  '-': (arg) => arg.reduce((dif, val) => dif - val),
  '*': (arg) => arg.reduce((mul, val) => mul * val),
  '/': (arg) => arg.reduce((div, val) => div / val),
  '<': function (arg) { return arg[0] < arg[1] },
  '>': function (arg) { return arg[0] > arg[1] },
  '<=': function (arg) { return arg[0] <= arg[1] },
  '>=': function (arg) { return arg[0] >= arg[1] },
  'pow': function (arg) { return Math.pow(arg[0], arg[1]) },
  'pi': Math.PI,
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
  let res
  if (lispInput) {
    while (lispInput) {
      res = lispParser(spaceParser(lispInput))
      if (res !== null) lispInput = res[1]
      else return 'Error'
    }
    return res[0]
  }
  return null
}

let lispParser = factoryParser(expressionParser, defineParser, lambdaParser, ifParser, opParser, quoteParser, setParser, literalParser, symbolParser)

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
  let res
  if (lispInput[0] !== '(') {
    return null
  }
  while (lispInput[0] !== ')') {
    res = lispParser(spaceParser(lispInput.slice(1)))
    if (res !== null) lispInput = res[1]
    else return null
  }
  return [res[0], spaceParser(lispInput.slice(1))]
}

function defineParser (lispInput) {
  if (lispInput.slice(0, 6) === 'define') {
    let res = symbolParser(spaceParser(lispInput.slice(7)))
    let symbol = res[0]
    if (symbol in env) return null
    let val = lispParser(spaceParser(res[1]))
    env[symbol] = val[0]
    return [null, val[1]]
  }
  return null
}

function lambdaParser (lispInput) {
  if (lispInput.slice(0, 6) === 'lambda') {
    lispInput = spaceParser(lispInput.slice(6))
    let i = 1, count = 0, params = [], func = {}
    if (lispInput[0] === '(') {
      while (lispInput[i] !== ')') {
        if (lispInput[i] !== ' ') {
          params.push(lispInput[i])
        }
        i++
      }
      func.params = params
      lispInput = spaceParser(lispInput.slice(i + 1))
      let fnBody = ''
      while (lispInput) {
        if (lispInput[0] === '(') {
          count++
          fnBody += lispInput[0]
          lispInput = lispInput.slice(1)
        }
        else if (lispInput[0] === ')') {
          count--
          fnBody += lispInput[0]
          lispInput = lispInput.slice(1)
          if (count === 0) {
            break
          }
        }
        else if (lispInput[0] !== '(' && lispInput[0] !== ')') {
          fnBody += lispInput[0]
          lispInput = lispInput.slice(1)
        }
      }
      func.body = fnBody
      return [func, lispInput]
    }
    return null
  }
  return null
}

function ifParser (lispInput) {
  if (lispInput.slice(0, 2) === 'if') {
    let exprTwo, expr3, exprThree
    let exp1 = lispParser(spaceParser(lispInput.slice(2)))
    let exprOne = exp1[0]
    let expr2 = lispParser(spaceParser(exp1[1]))
    if (expr2) {
      exprTwo = expr2[0]
      lispInput = expr2[1]
    }
    else return null
    expr3 = lispParser(spaceParser(expr2[1]))
    if (expr3) {
      exprThree = expr3[0]
      lispInput = expr3[1]
    }
    if (!expr3 && !exprOne) return null
    let res = (exprOne) ? exprTwo : exprThree
    return [res, lispInput]
  }
  return null
}

function opParser (lispInput) {
  let op = lispInput.split(' ')[0]
  let j = op.length
  let arg = ''
  let argArr = []
  lispInput = spaceParser(lispInput.slice(j + 1))
  if ((op in env) && ((typeof env[op] === 'function') || (typeof env[op] === 'object'))) {
    while (lispInput[0] !== ')') {
      if (lispInput[0] !== ' ' && lispInput[0] !== '(') {
        arg += lispInput[0]
        lispInput = lispInput.slice(1)
      }
      else if (lispInput[0] === ' ') {
        argArr.push(parseFloat(lispParser(arg)[0]))
        lispInput = lispInput.slice(1)
        arg = ''
      }
      else if (lispInput[0] === '(') {
        let res = lispParser(lispInput)
        lispInput = res[1]
        argArr.push(res[0])
      }
    }
    if (arg) {
      argArr.push(parseFloat(lispParser(arg)[0]))
    }
    if (typeof env[op] === 'function') {
      return [env[op](argArr), lispInput]
    }
    else if (typeof env[op] === 'object') {
      env[op].env = {}
      for (let i = 0; i < argArr.length; i++) {
        env[op].env[env[op].params[i]] = argArr[i]
      }
      for (let i of env[op].params) {
        let regex = new RegExp(i, 'g')
        env[op].body = env[op].body.replace(regex, env[op].env[i])
      }
      return ['', env[op].body]
    }
  }
  return null
}

function symbolParser (lispInput) {
  let symbol = ''
  let i = 0
  if (/^[a-zA-Z-]/.test(lispInput[i])) {
    if (env[lispInput]) {
      return [env[lispInput], '']
    }
    while (lispInput[i] !== ' ' && lispInput[i] !== ')') {
      symbol += lispInput[i]
      i++
    }
    return [symbol, spaceParser(lispInput.slice(i))]
  }
  return null
}

function quoteParser (lispInput) {
  let i = 0, res = ''
  if (lispInput.slice(0, 5) === 'quote') {
    lispInput = spaceParser(lispInput.slice(5))
    while (lispInput[i] !== ')') {
      res += lispInput[i]
      i++
    }
    res += ')'
    i++
    lispInput = spaceParser(lispInput.slice(i))
    return [res, lispInput]
  }
  return null
}

function setParser (lispInput) {
  let res
  if (lispInput.slice(0, 4) === 'set!') {
    lispInput = spaceParser(lispInput.slice(4))
    res = lispInput.split(' ')[0]
    let len = res.length
    lispInput = lispInput.slice(len + 1)
    if (res in env) {
      let val = lispParser(lispInput)
      env[res] = val[0]
      lispInput = val[1]
    }
    return [null, lispInput]
  }
  return null
}

function literalParser (lispInput) {
  let num = ''
  let i = 0
  if (/[0-9]+/.test(lispInput[i])) {
    while (/[0-9]+/.test(lispInput[i]) && lispInput[i] !== ')') {
      num += lispInput[i]
      i++
    }
    return [parseFloat(num), spaceParser(lispInput.slice(i))]
  }
  return null
}

function spaceParser (lispInput) {
  while (/\s/.test(lispInput[0])) lispInput = lispInput.slice(1)
  return lispInput
}
