const fs = require('fs');
const path = require("path");

const {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS,
} = require('./constants');

class JackTokenizer {
  constructor(filePath) {
    let fileContent = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: "utf-8"});

    // delete comments and empty lines
    while (fileContent.indexOf('/*') !== -1) {
      const index = fileContent.indexOf('/*');
      const index2 = fileContent.indexOf('*/');
      fileContent = fileContent.slice(0, index) + fileContent.slice(index2 + 2);
    }
    const lines = fileContent.split(/\n/).filter((line) => {
      return line !== '' && !line.startsWith('//');
    });

    // delete comments for each lines
    const linesWithoutComments = lines.map((line) => {
      return line.split('//')[0].trim();
    });

    // parse each lines
    this.tokens = [];
    const reg = /[\{\}\(\)\[\]\.,;\+\-\*\/&\|<>=~]/;

    linesWithoutComments.forEach((line) => {
      while (line) {
        if (line.startsWith('"')) {
          const index = line.indexOf('"', 1);
          this.tokens.push(line.slice(0, index + 1));
          line = line.slice(index + 1).trim();
        } else if (line.indexOf(' ') !== -1) {
          const index = line.indexOf(' ');
          let unit = line.slice(0, index);
          line = line.slice(index + 1).trim();

          while (unit) {
            if (unit.match(reg)) {
              const index = unit.match(reg).index;
              if (index !== 0) {
                this.tokens.push(unit.slice(0, index));
              }
              this.tokens.push(unit.slice(index, index + 1));
              unit = unit.slice(index + 1);
            } else {
              this.tokens.push(unit);
              unit = '';
            }
          }
        } else {
          while (line) {
            if (line.match(reg)) {
              const index = line.match(reg).index;
              if (index !== 0) {
                this.tokens.push(line.slice(0, index));
              }
              this.tokens.push(line.slice(index, index + 1));
              line = line.slice(index + 1);
            } else {
              this.tokens.push(line);
              line = '';
            }
          }
        }
      }
    });

    this.tokenCounter = 0;
    this.currentToken = this.tokens[this.tokenCounter];
  }

  hasMoreTokens() {
    return this.tokens.length > this.tokenCounter ? true : false;
  }

  advance() {
    if (!this.hasMoreTokens()) return;
    this.tokenCounter = this.tokenCounter + 1;
    this.currentToken = this.tokens[this.tokenCounter];
    return;
  }

  tokenType() {
    if (Object.values(KEYWORDS).includes(this.currentToken)) {
      return TOKEN_TYPE.KEYWORD;
    } else if (SYMBOLS.includes(this.currentToken)) {
      return TOKEN_TYPE.SYMBOL;
    } else if (this.currentToken.match(/^[0-9]+$/) && Number(this.currentToken) <= 32767) {
      return TOKEN_TYPE.INT_CONST;
    } else if (this.currentToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      return TOKEN_TYPE.IDENTIFIER;
    } else if (this.currentToken.match(/^"[^"\n]*"$/)) {
      return TOKEN_TYPE.STRING_CONST;
    } else {
      throw new Error(`invalid tokenType. currentToken: ${this.currentToken}`);
    }
  }

  keyWord() {
    if (this.tokenType() !== TOKEN_TYPE.KEYWORD) return;
    return this.currentToken;
  }

  symbol() {
    if (this.tokenType() !== TOKEN_TYPE.SYMBOL) return;
    if (this.currentToken === '<') {
      return '&lt;'
    } else if (this.currentToken === '>') {
      return '&gt;'
    } else if (this.currentToken === '&') {
      return '&amp;'
    } else {
      return this.currentToken;
    }
  }

  identifier() {
    if (this.tokenType() !== TOKEN_TYPE.IDENTIFIER) return;
    return this.currentToken;
  }

  intVal() {
    if (this.tokenType() !== TOKEN_TYPE.INT_CONST) return;
    return this.currentToken;
  }

  stringVal() {
    if (this.tokenType() !== TOKEN_TYPE.STRING_CONST) return;
    return this.currentToken.slice(1, -1);
  }
};

module.exports = JackTokenizer;