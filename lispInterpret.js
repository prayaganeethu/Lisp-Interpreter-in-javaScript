let env = {}

exports.interpretLisp = function(lispInput) {
	lispInput = lispInput.replace('(', '( ').replace(')',' )').split(" ");
	if (lispInput[1] == "define") defineParser(lispInput);
	return parenthesisParser(lispInput);
}

function parenthesisParser(lispInput) {	 
	return (lispInput[0] == "(") ? operatorParser(lispInput.slice(1)) : null;
}

let operatorParser = factoryParser(symbolParser, literalParser, ifParser, defineParser, procedureParser);

function factoryParser(...parsers) {
	return function(In)	{
	for(let i = 0; i < parsers.length; i++)	{
		let result = parsers[i](In);
		if (result != null)	return result;
	}
	return null;
	}
}

function defineParser(lispInput) {
	if(lispInput[0] == "define") {
		env[lispInput[1]] = lispInput[2];
		return (env);
	}
}

function symbolParser() {

}

function literalParser() {

}

function ifParser() {

}

function procedureParser() {

}
