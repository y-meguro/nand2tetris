const Parser = require('./parser');
const CodeWriter = require('./codeWriter');

const {
  C_ARITHMETIC,
  C_PUSH,
  C_POP,
  C_LABEL,
  C_GOTO,
  C_IF,
  C_FUNCTION,
  C_RETURN,
  C_CALL
} = require('./constants');

const vmTranslater = () => {
  const filePath = process.argv[2];
  const parser = new Parser(filePath);
  const codeWriter = new CodeWriter(filePath);

  while (parser.hasMoreCommands()) {
    if (parser.commandType() === C_ARITHMETIC) {
      const command = parser.arg1();
      codeWriter.writeArithmetic(command);
    } else if (parser.commandType() === C_PUSH) {
      const segment = parser.arg1();
      const index = parser.arg2();
      codeWriter.writePushPop('push', segment, index);
    }
    parser.advance();
  }
};

vmTranslater();