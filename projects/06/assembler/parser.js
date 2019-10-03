const fs = require('fs');
const path = require("path");

const { A_COMMAND, C_COMMAND, L_COMMAND } = require('./constants');

class Parser {
  constructor(filePath) {
    const fileContent = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: "utf-8"});
    const lines = fileContent.replace(/ /g, '').split(/\r\n/);
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
    if (this.currentCommand.indexOf('@') === 0) {
      return A_COMMAND;
    } else if (this.currentCommand.indexOf('(') === 0) {
      return L_COMMAND;
    } else {
      return C_COMMAND;
    }
  }

  symbol() {
    if (this.commandType() === A_COMMAND) {
      return this.currentCommand.slice(1);
    } else if (this.commandType() === L_COMMAND) {
      return this.currentCommand.slice(1, -1);
    } else {
      throw new Error('commandType should be A_COMMAND or L_COMMAND');
    }
  }

  dest() {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call dest');
    }
    if (this.currentCommand.indexOf(';') !== -1) {
      return null;
    }
    return this.currentCommand.split('=')[0];
  }

  comp() {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call comp');
    }
    if (this.currentCommand.indexOf(';') !== -1) {
      return this.currentCommand.split(';')[0];
    }
    return this.currentCommand.split('=')[1];
  }

  jump() {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call jump');
    }
    return this.currentCommand.split(';')[1];
  }
}

module.exports = Parser;