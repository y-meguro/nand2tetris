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

// call like "node projects/07/VMTranslater/index.js ../StackArithmetic/StackTest/StackTest.vm"
// then create "../StackArithmetic/StackTest/StackTest.asm"
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
      codeWriter.writePushPop(C_PUSH, segment, index);
    } else if (parser.commandType() === C_POP) {
      const segment = parser.arg1();
      const index = parser.arg2();
      codeWriter.writePushPop(C_POP, segment, index);
    } else if (parser.commandType() === C_LABEL) {
      const label = parser.arg1();
      codeWriter.writeLabel(label);
    } else if (parser.commandType() === C_GOTO) {
      const label = parser.arg1();
      codeWriter.writeGoto(label);
    } else if (parser.commandType() === C_IF) {
      const label = parser.arg1();
      codeWriter.writeIf(label);
    }
    parser.advance();
  }
};

vmTranslater();