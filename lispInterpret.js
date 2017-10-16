// let opArr = ['+', '-', '/', '*', '<', '>', '<=', '>=', 'pow', 'pi', 'length', 'max', 'min', 'eq?', 'equal?', 'sqrt', 'round', 'not', 'abs', 'append']
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
  // let envObj = Object.assign({}, env)
  // console.log(envObj)
  let res
  // let envObj = new Env(env)
  // console.log(envObj.outer)
  // console.log(typeof lispInput)
  if (lispInput) {
    while (lispInput) {
      res = lispParser(spaceParser(lispInput), env)
      lispInput = res[1]
    }
    console.log('FIRSTTTTTTTTTTTTT', res)
    return res[0]
  }
  return null
}

let lispParser = factoryParser(expressionParser, defineParser, lambdaParser, ifParser, opParser, quoteParser, setParser, literalParser, symbolParser)

function factoryParser (...parsers) {
  console.log('factory')
  return function (In) {
    for (let i = 0; i < parsers.length; i++) {
      let result = parsers[i](In, env)
      if (result != null) return result
    }
    return null
  }
}

function expressionParser (lispInput, env) {
  console.log('expr')
  let res
  if (lispInput[0] !== '(') {
    return null
  }
  while (lispInput[0] !== ')') {
    res = lispParser(spaceParser(lispInput.slice(1)), env)
    lispInput = res[1]
  }
  console.log('yooooo', [res[0], spaceParser(lispInput.slice(1))])
  return [res[0], spaceParser(lispInput.slice(1))]
}

function defineParser (lispInput, env) {
  console.log('define')
  if (lispInput.slice(0, 6) === 'define') {
    let res = symbolParser(spaceParser(lispInput.slice(7)), env)
    // console.log('defineeeeeee', res)
    let symbol = res[0]
    let val = lispParser(spaceParser(res[1]), env)
    // console.log('define valllllll', val)
    env[symbol] = val[0]
    console.log(env)
    return [null, val[1]]
  }
  return null
}

function lambdaParser (lispInput, env) {
  console.log('lambda')
  if (lispInput.slice(0, 6) === 'lambda') {
    return parseLambda(spaceParser(lispInput.slice(6)))
    // console.log('lambdaaaaaa',res)
  }
  return null
}

function parseLambda (lispInput, env) {
  console.log('parseLambda')
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
    // console.log('HEYYY', params, fnBody)
    return [func, lispInput]
  }
  return null
}

function ifParser (lispInput, env) {
  console.log('if')
  if (lispInput.slice(0, 2) === 'if') {
    let exp1 = lispParser(spaceParser(lispInput.slice(2)), env)
    let exprOne = exp1[0]
    let expr2 = lispParser(spaceParser(exp1[1]), env)
    let exprTwo = expr2[0]
    let expr3 = lispParser(spaceParser(expr2[1]), env)
    let exprThree = expr3[0]
    lispInput = expr3[1]
    let res = (exprOne) ? exprTwo : exprThree
    return [res, lispInput]
  }
  return null
}

function opParser (lispInput, env) {
  console.log('op')
  let op = lispInput.split(' ')[0]
  let j = op.length
  let arg = ''
  let argArr = []
  lispInput = spaceParser(lispInput.slice(j + 1))
  if ((op in env) && ((typeof env[op] === 'function') || (typeof env[op] === 'object'))) {
    // console.log('HEREEEEEEEEE')
    while (lispInput[0] !== ')') {
      if (lispInput[0] !== ' ' && lispInput[0] !== '(') {
        arg += lispInput[0]
        lispInput = lispInput.slice(1)
      }
      else if (lispInput[0] === ' ') {
        argArr.push(parseFloat(lispParser(arg, env)[0]))
        lispInput = lispInput.slice(1)
        arg = ''
      }
      else if (lispInput[0] === '(') {
        let res = lispParser(lispInput, env)
        lispInput = res[1]
        argArr.push(res[0])
      }
    }
    if (arg) {
      argArr.push(parseFloat(lispParser(arg, env)[0]))
    }
    // console.log('HEREEEEEEEEEE EEEE', argArr)
    if (typeof env[op] === 'function') {
      // console.log('EEEEEEEEEEEEEE', env[op](argArr), argArr)
      return [env[op](argArr), lispInput]
    }
    else if (typeof env[op] === 'object') {
      console.log('HEYYYYYYY', argArr, env[op].params)
      env[op].env = {}
      for (let i = 0; i < argArr.length; i++) {
        env[op].env[env[op].params[i]] = argArr[i]
      }
      // console.log(env)
      // console.log(lispParser(env[op].body, env[op].env)[0])
      return procParser(env[op].params, env[op].body, env[op].env, env)
    }
  }
  return null
}

function procParser (fnParams, fnBody, fnEnv, env) {
  console.log('proc')
  for (let i of fnParams) {
    let regex = new RegExp(i, 'g')
    fnBody = fnBody.replace(regex, fnEnv[i])
  }
  console.log('BODYYYY', fnBody)
  console.log('procccccc', lispParser(fnBody, env))
  return lispParser(fnBody, env)
}

function symbolParser (lispInput, env) {
  console.log('symbol')
  // let envObj = new Env(env)
  let symbol = ''
  let i = 0
  if (/^[a-zA-Z-]/.test(lispInput[i])) {
    // console.log(lispInput)
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

function quoteParser (lispInput, env) {
  console.log('quote')
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

function setParser (lispInput, env) {
  console.log('set!')
  let res
  if (lispInput.slice(0, 4) === 'set!') {
    lispInput = spaceParser(lispInput.slice(4))
    res = lispInput.split(' ')[0]
    let len = res.length
    lispInput = lispInput.slice(len + 1)
    if (res in env) {
      let val = lispParser(lispInput, env)
      env[res] = val[0]
      lispInput = val[1]
    }
    console.log(env)
    return [null, lispInput]
  }
  return null
}

function literalParser (lispInput, env) {
  console.log('literal')
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
