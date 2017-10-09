let env = {}

exports.interpretLisp = function(lispInput) {
	let lispy = "", i = 1;
	if(spaceParser(lispInput)[0] == "(")
		while(lispInput[i] !== ')') {
			lispy += lispInput[i];
			i++;
		}
	return lispParser(lispy);
}	

let lispParser = factoryParser(defineParser, symbolParser, literalParser);

function factoryParser(...parsers) {
	return function(In)	{
	for(let i = 0; i < parsers.length; i++)	{
		let result = parsers[i](In);
		if (result != null)	return result;
	}
	return null;
	};
}

function symbolParser(lispInput) {
	console.log("symbol", lispInput);
	let symbol = "", i = 0;
	if(/^[a-zA-Z\-]/.test(lispInput[i])) {
		while(lispInput[i] !== " ") {
			symbol += lispInput[i];
			i++;
		}
		return [symbol, spaceParser(lispInput.slice(i))];
	}
	return null;
}

function literalParser(lispInput) {
	console.log("literal");
	let num = "", i = 0;
	if(/[0-9]+/.test(lispInput[i])) {
		while(/[0-9]+/.test(lispInput[i])) {
			num += lispInput[i];
			i++;
		}
	console.log([num, spaceParser(lispInput.slice(i))]);
	return [num, spaceParser(lispInput.slice(i))];
	}
	return null;
}

function spaceParser(lispInput) {
	while(/\s/.test(lispInput[0])) lispInput = lispInput.slice(1);
	return lispInput;
}


function defineParser(lispInput) {
	console.log("define");
	if(lispInput.slice(0,6) == "define") {
		let res = symbolParser(spaceParser(lispInput.slice(7))), symbol = res[0];
		console.log("hey", res[1]);
		let val = lispParser(spaceParser(res[1])); 
		console.log("val", val[0]);
		env[symbol] = val[0];
		return env;
	}
	return null;
}
