const fs = require('fs');
const path = require("path");

const JackTokenizer = require('./jackTokenizer');
const CompilationEngine = require('./compilationEngine');

const {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS,
} = require('./constants');

// call like "node projects/10/JackAnalyzer/index.js ../Square"
const jackAnalyzer = () => {
  const directoryPath = process.argv[2];
  const allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath));
  const files = allFiles.filter((file) => {
    return file.endsWith('.jack');
  });

  for (const file of files) {
    const inputFilePath = directoryPath + '/' + file;
    const outputFilePath = __dirname + '/' + (directoryPath + '/' + file).slice(0, -5) + 'T2.xml';
    translate(inputFilePath, outputFilePath);
  }
};

const translate = (inputFilePath, outputFilePath) => {
  const jackTokenizer = new JackTokenizer(inputFilePath);
  fs.writeFileSync(outputFilePath, '<tokens>' + '\n');

  while (jackTokenizer.hasMoreTokens()) {
    let code;
    if (jackTokenizer.tokenType() === TOKEN_TYPE.KEYWORD) {
      code = '<keyword> ' + jackTokenizer.keyWord() + ' </keyword>';
    } else if (jackTokenizer.tokenType() === TOKEN_TYPE.SYMBOL) {
      code = '<symbol> ' + jackTokenizer.symbol() + ' </symbol>';
    } else if (jackTokenizer.tokenType() === TOKEN_TYPE.INT_CONST) {
      code = '<integerConstant> ' + jackTokenizer.intVal() + ' </integerConstant>';
    } else if (jackTokenizer.tokenType() === TOKEN_TYPE.STRING_CONST) {
      code = '<stringConstant> ' + jackTokenizer.stringVal() + ' </stringConstant>';
    } else if (jackTokenizer.tokenType() === TOKEN_TYPE.IDENTIFIER) {
      code = '<identifier> ' + jackTokenizer.identifier() + ' </identifier>';
    } else {
      throw new Error('invalid tokenType');
    }

    jackTokenizer.advance();
    fs.appendFileSync(outputFilePath, code + '\n');
  }
  fs.appendFileSync(outputFilePath, '</tokens>' + '\n');
};

jackAnalyzer();