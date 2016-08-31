var token; //points to the position of array of tokens
var expr;  //array of tokens

function init(expression) {
  token = 0;
  expr = expression;
}

//returns NaN if a sequense of tokens can't be parsed as a simple expression
function parseSimpleExpr() {
  var name = expr[token];
  var val = parseFloat(name);
  if (!isNaN(val)) {
    token++;
    return val;
  } else if (expr[token] === '(') {
    val = parse(token++);
    if (expr[token] === ')') {
      token++;
      return val;
    } else {
      console.error('No close round bracket');
      return NaN;
    }
  } else {
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
      default: 
        return val;
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
      //console.error('Unrecognized operator is found'); show message when bumps a brackit
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
    if (token >= expr.length) {
      return left;
    }
    var operand = expr[token];
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

var regex = /[A-Za-z][A-Za-z0-9_]+|[\(\)]|[-+]?[0-9]*\.?[0-9]+|[-+*\/\%=\(\)^]|sin|cos|tan/g;
//var input = '2 + 2 * 2';
/*var input = '5 + cos(0) - 2 * sin(1.57)';
var inputToArray = input.match(regex);
console.log(inputToArray);*/

var tests = [
  '2 + 2 * 2'.match(regex),
  'sin(1.571) + cos(0)'.match(regex),
  '5 + cos(0)^2 + sin(1.57)^2'.match(regex),
  '(6 - 2 * sin(1.571))'.match(regex),
  '(2 + sin(1.57))'.match(regex),
  '(cos(3)^2 + sin(3)^2)'.match(regex),
  '2 * sin(0.2618) * cos(0.2618)'.match(regex),
]

for (var i = 0; i < tests.length; i++) {
  init(tests[i]);
  console.log(tests[i].join('') + '=' + parse(tests[i]));
}
