const fs = require('fs');

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

class CodeWriter {
  constructor(filePath) {
    const index = filePath.lastIndexOf('.');
    this.outputPath = __dirname + '/' + filePath.slice(0, index) + '.asm';
    fs.writeFileSync(this.outputPath, '');

    const index2 = this.outputPath.lastIndexOf('/');
    this.fileName = this.outputPath.slice(index2 + 1);

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
      throw new Error('invalid command for writeArithmetic');
    }
  }

  writePushPop(command, segment, index) {
    if (command === C_PUSH) {
      if (segment === 'constant') {
        this.writeCodes([
          `@${index}`,
          'D=A'
        ]);
        this.writePushFromD();
      } else if (['local', 'argument', 'this', 'that'].includes(segment)) {
        this.writePushFromReferencedSegment(segment, index);
      } else if (['pointer', 'temp'].includes(segment)) {
        this.writePushFromFixedSegment(segment, index);
      } else if (segment === 'static') {
        this.writeCodes([
          `@${this.fileName}.${index}`,
          'D=M'
        ]);
        this.writePushFromD();
      } else {
        throw new Error('invalid segment');
      }
    } else if (command === C_POP) {
      if (['local', 'argument', 'this', 'that'].includes(segment)) {
        this.writePopToReferencedSegment(segment, index);
      } else if (['pointer', 'temp'].includes(segment)) {
        this.writePopToFixedSegment(segment, index);
      } else if (segment === 'static') {
        this.writePopToA();
        this.writeCodes([
          'D=M',
          `@${this.fileName}.${index}`,
          'M=D'
        ]);
      } else {
        throw new Error('invalid segment');
      }
    } else {
      throw new Error('invalid command for writePushPop');
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
      throw new Error('invalid command for writeCalc1Value');
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

  getLabelBySegment(segment) {
    if (segment === 'local') {
      return 'LCL';
    } else if (segment === 'argument') {
      return 'ARG';
    } else if (segment === 'this') {
      return 'THIS';
    } else if (segment === 'that') {
      return 'THAT';
    } else if (segment === 'pointer') {
      return '3';
    } else if (segment === 'temp') {
      return '5';
    } else {
      throw new Error('invalid segment');
    }
  }

  writePushFromReferencedSegment(segment, index) {
    const label = this.getLabelBySegment(segment);
    this.writeCodes([
      `@${label}`,
      'A=M'
    ]);

    const indexNum = Number(index);
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'));
    }

    this.writeCodes(['D=M']);
    this.writePushFromD();
  }

  writePopToReferencedSegment(segment, index) {
    this.writePopToA();

    const label = this.getLabelBySegment(segment);
    this.writeCodes([
      'D=M',
      `@${label}`,
      'A=M'
    ]);

    const indexNum = Number(index);
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'));
    }

    this.writeCodes(['M=D']);
  }

  writePushFromFixedSegment(segment, index) {
    const label = this.getLabelBySegment(segment);
    this.writeCodes([`@${label}`]);

    const indexNum = Number(index);
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'));
    }

    this.writeCodes(['D=M']);
    this.writePushFromD();
  }

  writePopToFixedSegment(segment, index) {
    this.writePopToA();

    const label = this.getLabelBySegment(segment);
    this.writeCodes([
      'D=M',
      `@${label}`
    ]);

    const indexNum = Number(index);
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'));
    }

    this.writeCodes(['M=D']);
  }
}

module.exports = CodeWriter;