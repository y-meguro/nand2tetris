const fs = require('fs');
const path = require("path");

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

// call like "node projects/08/VMTranslater/index.js ../FunctionCalls/NestedCall"
// then create "../StackArithmetic/FunctionCalls/NestedCall/NestedCall.asm"
const vmTranslater = () => {
  const directoryPath = process.argv[2];
  const allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath));
  const files = allFiles.filter((file) => {
    return file.endsWith('.vm');
  });

  const index = directoryPath.lastIndexOf('/');
  const fileName = directoryPath.slice(index) + '.asm';
  const codeWriter = new CodeWriter(directoryPath + fileName);

  for (const file of files) {
    const filePath = directoryPath + '/' + file;
    translate(file, filePath, codeWriter);
  }
};

const translate = (fileName, filePath, codeWriter) => {
  const parser = new Parser(filePath);
  codeWriter.setFileName(fileName);

  while (parser.hasMoreCommands()) {
    if (parser.commandType() === C_ARITHMETIC) {
      const command = parser.arg1();
      codeWriter.writeArithmetic(command);
    } else if (parser.commandType() === C_PUSH) {
      const segment = parser.arg1();
      const index = Number(parser.arg2());
      codeWriter.writePushPop(C_PUSH, segment, index);
    } else if (parser.commandType() === C_POP) {
      const segment = parser.arg1();
      const index = Number(parser.arg2());
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
    } else if (parser.commandType() === C_FUNCTION) {
      const functionName = parser.arg1();
      const numLocals = Number(parser.arg2());
      codeWriter.writeFunction(functionName, numLocals);
    } else if (parser.commandType() === C_RETURN) {
      codeWriter.writeReturn();
    } else if (parser.commandType() === C_CALL) {
      const functionName = parser.arg1();
      const numArgs = Number(parser.arg2());
      codeWriter.writeCall(functionName, numArgs);
    } else {
      throw new Error('invalid commandType');
    }
    parser.advance();
  }
};

vmTranslater();