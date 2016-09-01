function Interpreter() {
  this.vars = {};
  this.functions = {};
}


/**
 * { function_description }
 * @param  {string}  expr  An expression
 * @return {Array}         Tokens
 */
Interpreter.prototype.tokenize = function(expr) {

  var regex = /[A-Za-z][A-Za-z0-9_]*|[-]?[0-9]*\.?[0-9]+|[-+*\/\%=\(\)^]|[^\s\t\n\b]+/g;

  if (expr.trim() === '') {
    return [];
  } 

  var tokens = expr.match(regex);

  // correcting the recognizing of unary minus and operand minus
  if (tokens[0] === '-') {
    tokens.splice(0, 1, '-1', '*');
  }
  for (var i = 1; i < tokens.length; i++) {
    if (tokens[i] === '-') {
      if (tokens[i - 1] === '(') {
        tokens.splice(i, 1, '-1', '*');
        i++;
      }
    } else if (tokens[i].substr(0, 1) === '-' && tokens[i - 1] !== '(') {
      tokens.splice(i, 1, '-', tokens[i].slice(1));
      i++;
    }
  }

  return tokens;

}


/**
 * Calculates value by given expression
 * @param  {string} expr  An expression
 * @return {number}       The calculated result
 */
Interpreter.prototype.input = function(expr) {

  var _this = this;
  var token = 0; //points to the position of array of tokens
  var tokens = this.tokenize(expr);

  //returns NaN if a sequense of tokens can't be parsed as a simple expression
  function parseSimpleExpr() {
    var name = tokens[token];
    var val = parseFloat(name);
    if (!isNaN(val)) {
      //value
      token++;
      return val;
    } else if (tokens[token] === '(') {
      //parenthesis
      token++;
      val = parse();
      if (tokens[token] === ')') {
        token++;
        return val;
      } else {
        console.error('No close round bracket');
        return NaN;
      }
    } else if (['sin', 'cos', 'tan', 'sqrt', 'round', 'ln'].indexOf(name) > -1) {
      //build-in functions
      switch (name.toLowerCase()) {
        case 'sin': 
          val = parseSimpleExpr(token++);
          return Math.sin(val);
        case 'cos': 
          val = parseSimpleExpr(token++);
          return Math.cos(val);
        case 'tan': 
          val = parseSimpleExpr(token++);
          return Math.tan(val);
        case 'sqrt': 
          val = parseSimpleExpr(token++);
          return Math.sqrt(val);
        case 'round':
          val = parseSimpleExpr(token++);
          return Math.round(val);
        case 'ln': 
          val = parseSimpleExpr(token++);
          return Math.log(val);
        default:
          console.error('Build-in function is not handled');
          return NaN;
      }
    } else if (['pi', 'e'].indexOf(name) > -1) {
      //build-in constants
      switch(name.toLowerCase()) {
        case 'pi':
          token++;
          return Math.PI;
        case 'e':
          token++;
          return Math.E;
        default:
          console.error('Build-in constan is not handled');
          return NaN;
      }
    } else {
      //variables
      if (tokens[token + 1] === '=') {
        token += 2;
        return _this.vars[name] = parse();
      } else if (_this.vars[name]) {
        token++;
        return _this.vars[name];
      } else {
        //console.error('Unknown variable');
        //return NaN;
        throw Error('Unknown variable');
      }
    }
  }

  function getPriority(operand) {
    switch(operand) {
      case '+': case '-': 
        return 1;
      case '*': case '/': case '%':
        return 2;
      case '^':
        return 3;
      default:
        return 0;
    }
  }

  function binaryOperation(val1, val2, operand) {
    switch (operand) {
      case '+': 
        return val1 + val2;
      case '-':
        return val1 - val2;
      case '*':
        return val1 * val2;
      case '/':
        return val1 / val2;
      case '%':
        return val1 % val2;
      case '^':
        return Math.pow(val1, val2);
      default:
        console.error('binaryOperation is nor recognized');
        return NaN;
    }
  }

  function parseBinaryExpr(minPriority) {
    var left = parseSimpleExpr();
    for(;;) {
      if (token >= tokens.length) {
        return left;
      }
      var operand = tokens[token];
      var priority = getPriority(operand);
      if (priority <= minPriority) {
        return left;
      }
      token++;
      var right = parseBinaryExpr(priority);
      left = binaryOperation(left, right, operand);
    }
  }

  function parse() {
    return parseBinaryExpr(0);
  }

  if (tokens.length) {
    return parse();
  } else {
    return '';
  }

}

var tests = [
  '2 + 2 * 2',
  '  ',  
  '',
  'sin(pi / 2) + cos(0)',
  '5 + cos(0)^2 + sin(pi/2)^2',
  '5 * (2 + 5',
  '10 - (6 - 2 * sin(pi/2))',
  '(2 + sin(pi/2))',
  'x = pi / 12',
  '(cos(x)^2 + sin(x)^2)',
  't = pi / 2',
  '2*(-t)',
  '2 * sin(t/2) * cos(t/2)', // => sin(t)=sin(pi/2)=1 
  '-1',
  '-(cos(0))',
  '-(-(-4)))',
  '-(-(2 + 5))',
  '7 +(- 4)',
  'y',
  '2 + 2',
]

var interpreter = new Interpreter();

for (var i = 0; i < tests.length; i++) {
  console.log(tests[i] + ' => ' + interpreter.input(tests[i]));
}
