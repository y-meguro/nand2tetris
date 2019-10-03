const fs = require('fs');

class CodeWriter {
  constructor(filePath) {
    const index = filePath.lastIndexOf('.');
    this.outputPath = __dirname + '/' + filePath.slice(0, index) + '.asm';
    fs.writeFileSync(this.outputPath, '');
  }

  writeArithmetic(command) {
    const codes = [];
    if (command === 'add') {
      codes.push(
        '@SP',
        'M=M-1',
        'A=M',
        'D=M',
        '@SP',
        'M=M-1',
        'A=M',
        'D=D+M',
      );
      this.writeCodes(codes);
      this.writeRegister();
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
        this.writeRegister();
      }
    }
  }

  writeCodes(codes) {
    fs.appendFileSync(this.outputPath, codes.join('\n') + '\n');
  }

  writeRegister() {
    const codes = [
      '@SP',
      'A=M',
      'M=D',
      '@SP',
      'M=M+1'
    ];
    this.writeCodes(codes);
  }
}

module.exports = CodeWriter;