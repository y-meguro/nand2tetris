const fs = require('fs');
const path = require("path");

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

class Parser {
  constructor(filePath) {
    const fileContent = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: "utf-8"});
    const lines = fileContent.split(/\r\n/);
    this.instructions = lines.filter((line) => {
      return line !== '' && line.indexOf("//") !== 0;
    });
    this.lineCounter = 0;
    this.currentCommand = this.instructions[this.lineCounter];
  }

  hasMoreCommands() {
    return this.instructions.length > this.lineCounter ? true : false;
  }

  advance() {
    if (!this.hasMoreCommands()) return;
    this.lineCounter = this.lineCounter + 1;
    const command = this.instructions[this.lineCounter];
    if (!command) return;
    this.currentCommand = command.split("//")[0];
    return;
  }

  commandType() {
    if (this.currentCommand.indexOf('push') === 0) {
      return C_PUSH;
    } else if (this.currentCommand.indexOf('pop') === 0) {
      return C_POP;
    } else if (this.currentCommand.indexOf('label') === 0) {
      return C_LABEL;
    } else if (this.currentCommand.indexOf('goto') === 0) {
      return C_GOTO;
    } else if (this.currentCommand.indexOf('if-goto') === 0) {
      return C_IF;
    } else if (this.currentCommand.indexOf('function') === 0) {
      return C_FUNCTION;
    } else if (this.currentCommand ==='return') {
      return C_RETURN;
    } else if (this.currentCommand.indexOf('call') === 0) {
      return C_CALL;
    } else {
      return C_ARITHMETIC;
    }
  }

  arg1() {
    if (this.commandType() === C_RETURN) return;
    if (this.commandType() === C_ARITHMETIC) {
      return this.currentCommand;
    }
    return this.currentCommand.split(' ')[1];
  }

  arg2() {
    if (![C_PUSH, C_POP, C_FUNCTION, C_CALL].includes(this.commandType())) return;
    return this.currentCommand.split(' ')[2];
  }
}

module.exports = Parser;