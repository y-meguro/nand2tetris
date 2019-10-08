const fs = require('fs');

class VMWriter {
  constructor(filePath) {
    this.filePath = filePath;
    fs.writeFileSync(this.filePath, '');
  }

  writePush(segment, index) {
    fs.appendFileSync(this.filePath, `push ${segment} ${index}` + '\n');
  }

  writePop(segment, index) {
    fs.appendFileSync(this.filePath, `pop ${segment} ${index}` + '\n');
  }

  writeArithmetic(command) {
    fs.appendFileSync(this.filePath, command + '\n');
  }

  writeLabel(label) {
    fs.appendFileSync(this.filePath, `label ${label}` + '\n');
  }

  writeGoto(label) {
    fs.appendFileSync(this.filePath, `goto ${label}` + '\n');
  }

  writeIf(label) {
    fs.appendFileSync(this.filePath, `if-goto ${label}` + '\n');
  }

  writeCall(name, nArgs) {
    fs.appendFileSync(this.filePath, `call ${name} ${nArgs}` + '\n');
  }

  writeFunction(name, nLocals) {
    fs.appendFileSync(this.filePath, `function ${name} ${nLocals}` + '\n');
  }

  writeReturn() {
    fs.appendFileSync(this.filePath, 'return' + '\n');
  }
};

module.exports = VMWriter;