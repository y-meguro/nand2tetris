const fs = require('fs');

const {
  C_PUSH,
  C_POP
} = require('./constants');

class CodeWriter {
  constructor(filePath) {
    this.outputPath = __dirname + '/' + filePath;
    fs.writeFileSync(this.outputPath, '');

    this.labelNumForCompare = 0;
    this.labelNumForReturnAddress = 0;

    this.writeInit();
  }

  writeInit() {
    this.writeCodes([
      '@256',
      'D=A',
      '@SP',
      'M=D',
    ]);
    this.writeCall('Sys.init', 0);
  }

  setFileName(fileName) {
    this.fileName = fileName;
  }

  writeArithmetic(command) {
    if (['neg', 'not'].includes(command)) {
      this.writeCalc1Value(command);
    } else if (['add', 'sub', 'and', 'or'].includes(command)) {
      this.writeCalc2Values(command);
    } else if (['eq', 'gt', 'lt'].includes(command)) {
      this.writeCompare(command);
    } else {
      throw new Error(`invalid command for writeArithmetic: ${command}`);
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
        throw new Error(`invalid segment: ${segment}`);
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

  writeLabel(label) {
    this.writeCodes([`(${label})`]);
  }

  writeGoto(label) {
    this.writeCodes([
      `@${label}`,
      '0;JMP'
    ]);
  }

  writeIf(label) {
    this.writePopToA();
    this.writeCodes([
      'D=M',
      `@${label}`,
      'D;JNE'
    ]);
  }

  writeCall(functionName, numArgs=0) {
    this.writeCodes([
      `@RETURN_ADDRESS_${this.labelNumForReturnAddress}`,
      'D=A',
    ]);
    this.writePushFromD();

    this.writeCodes([
      '@LCL',
      'D=M',
    ]);
    this.writePushFromD();

    this.writeCodes([
      '@ARG',
      'D=M',
    ]);
    this.writePushFromD();

    this.writeCodes([
      '@THIS',
      'D=M',
    ]);
    this.writePushFromD();

    this.writeCodes([
      '@THAT',
      'D=M',
    ]);
    this.writePushFromD();

    this.writeCodes([
      '@SP',
      'D=M',
      `@${numArgs}`,
      'D=D-A',
      `@5`,
      'D=D-A',
      '@ARG',
      'M=D', // ARG = SP - numArgs - 5
      '@SP',
      'D=M',
      '@LCL',
      'M=D', // LCL = SP
      `@${functionName}`,
      '0;JMP',
      `(RETURN_ADDRESS_${this.labelNumForReturnAddress})`,
    ]);

    this.labelNumForReturnAddress = this.labelNumForReturnAddress + 1;
  }

  writeReturn() {
    this.writeCodes([
      '@LCL',
      'D=M',
      '@R13', // R13にFRAMEを保存
      'M=D',
      '@5',
      'D=A',
      '@R13',
      'A=M-D', // FRAME - 5
      'D=M',
      '@R14', // R14にRETを保存
      'M=D'
    ]);

    this.writePopToA();
    this.writeCodes([
      'D=M',
      '@ARG',
      'A=M',
      'M=D', // *ARG = pop()

      '@ARG',
      'D=M+1',
      '@SP',
      'M=D', // SP = ARG + 1

      '@R13',
      'AM=M-1',
      'D=M',
      '@THAT',
      'M=D', // THAT = *(FRAME - 1)

      '@R13',
      'AM=M-1',
      'D=M',
      '@THIS',
      'M=D', // THIS = *(FRAME - 2)

      '@R13',
      'AM=M-1',
      'D=M',
      '@ARG',
      'M=D', // ARG = *(FRAME - 3)

      '@R13',
      'AM=M-1',
      'D=M',
      '@LCL',
      'M=D', // LCL = *(FRAME - 4)

      '@R14',
      'A=M',
      '0;JMP'
    ]);
  }

  writeFunction(functionName, numLocals=0) {
    this.writeCodes([
      `(${functionName})`,
      'D=0'
    ]);
    for (let i = 0; i < numLocals; i++) {
      this.writePushFromD();
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
      `@RETURN_TRUE_${this.labelNumForCompare}`,
      `D;${mnemonic}`,
      'D=0',
      `@NEXT_${this.labelNumForCompare}`,
      '0;JMP',
      `(RETURN_TRUE_${this.labelNumForCompare})`,
      'D=-1',
      `(NEXT_${this.labelNumForCompare})`
    ]);
    this.writePushFromD();

    this.labelNumForCompare = this.labelNumForCompare + 1;
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

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'));
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

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'));
    }

    this.writeCodes(['M=D']);
  }

  writePushFromFixedSegment(segment, index) {
    const label = this.getLabelBySegment(segment);
    this.writeCodes([`@${label}`]);

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'));
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

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'));
    }

    this.writeCodes(['M=D']);
  }
}

module.exports = CodeWriter;