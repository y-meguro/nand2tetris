const fs = require('fs');

class CodeWriter {
  constructor(filePath) {
    const index = filePath.lastIndexOf('.');
    this.outputPath = __dirname + '/' + filePath.slice(0, index) + '.asm';
    fs.writeFileSync(this.outputPath, '');

    this.labelNum = 0;
  }

  writeArithmetic(command) {
    if (['neg', 'not'].includes(command)) {
      this.writeCalc1Value(command);
    } else if (['add', 'sub', 'and', 'or'].includes(command)) {
      this.writeCalc2Values(command);
    } else if (['eq', 'gt', 'lt'].includes(command)) {
      this.writeCompare(command);
    } else {
      throw new Error('invalid arithmetic command');
    }
  }

  writePushPop(command, segment, index) {
    const codes = [];
    if (command === 'push') {
      if (segment === 'constant') {
        codes.push(
          '@' + index,
          'D=A'
        );
        this.writeCodes(codes);
        this.writePushFromD();
      }
    }
  }

  writeCodes(codes) {
    fs.appendFileSync(this.outputPath, codes.join('\n') + '\n');
  }

  // Dの値をpushし、SPを1つ進める
  writePushFromD() {
    this.writeCodes([
      '@SP',
      'A=M',
      'M=D',
      '@SP',
      'M=M+1'
    ]);
  }

  // popされた値をAに入れ、SPを1つ戻す
  writePopToA() {
    this.writeCodes([
      '@SP',
      'M=M-1',
      'A=M'
    ]);
  }

  writeCalc1Value(command) {
    let formula;
    if (command === 'neg') {
      formula = 'D=-M';
    } else if (command === 'not') {
      formula = 'D=!M';
    } else {
      throw new Error('c');
    }

    this.writePopToA();
    this.writeCodes([formula]);
    this.writePushFromD();
  }

  writeCalc2Values(command) {
    let formula;
    if (command === 'add') {
      formula = 'D=D+M';
    } else if (command === 'sub') {
      formula = 'D=M-D';
    } else if (command === 'and') {
      formula = 'D=D&M';
    } else if (command === 'or') {
      formula = 'D=D|M';
    } else {
      throw new Error('invalid command for writeCalc2Values');
    }

    this.writePopToA();
    this.writeCodes(['D=M']);
    this.writePopToA();
    this.writeCodes([formula]);
    this.writePushFromD();
  }

  writeCompare(command) {
    let mnemonic;
    if (command === 'eq') {
      mnemonic = 'JEQ';
    } else if (command === 'gt') {
      mnemonic = 'JGT';
    } else if (command === 'lt') {
      mnemonic = 'JLT';
    } else {
      throw new Error('invalid command for writeCompare');
    }

    this.writePopToA();
    this.writeCodes(['D=M']);
    this.writePopToA();
    this.writeCodes([
      'D=M-D',
      `@RETURN_TRUE_${this.labelNum}`,
      `D;${mnemonic}`,
      'D=0',
      `@NEXT_${this.labelNum}`,
      '0;JMP',
      `(RETURN_TRUE_${this.labelNum})`,
      'D=-1',
      `(NEXT_${this.labelNum})`
    ]);
    this.writePushFromD();

    this.labelNum = this.labelNum + 1;
  }
}

module.exports = CodeWriter;