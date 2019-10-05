class CompilationEngine {
  constructor(filePath) {
    this.outputPath = __dirname + '/' + filePath;
    fs.writeFileSync(this.outputPath, '');
  }

  
};

module.exports = CompilationEngine;