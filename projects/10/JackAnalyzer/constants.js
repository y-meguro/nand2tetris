const TOKEN_TYPE = {
  KEYWORD: 'KEYWORD',
  SYMBOL: 'SYMBOL',
  INT_CONST: 'INT_CONST',
  STRING_CONST: 'STRING_CONST',
  IDENTIFIER: 'IDENTIFIER',
};

const KEYWORDS = {
  CLASS: 'class',
  CONSTRUCTOR: 'constructor',
  FUNCTION: 'function',
  METHOD: 'method',
  FIELD: 'field',
  STATIC: 'static',
  VAR: 'var',
  INT: 'int',
  CHAR: 'char',
  BOOLEAN: 'boolean',
  VOID: 'void',
  TRUE: 'true',
  FALSE: 'false',
  NULL: 'null',
  THIS: 'this',
  LET: 'let',
  DO: 'do',
  IF: 'if',
  ELSE: 'else',
  WHILE: 'while',
  RETURN: 'return'
};

const SYMBOLS = [
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',
  '.',
  ',',
  ';',
  '+',
  '-',
  '*',
  '/',
  '&',
  '|',
  '<',
  '>',
  '=',
  '~'
];

module.exports = {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS,
}