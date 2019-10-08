const fs = require('fs');
const path = require("path");
const CompilationEngine = require('./compilationEngine');

// call like "node projects/11/JackCompiler/index.js ../Square"
const JackCompiler = () => {
  const directoryPath = process.argv[2];
  const allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath));
  const files = allFiles.filter((file) => {
    return file.endsWith('.jack');
  });

  for (const file of files) {
    const inputFilePath = directoryPath + '/' + file;
    const outputFilePath = __dirname + '/' + (directoryPath + '/' + file).slice(0, -5) + '.vm';
    new CompilationEngine(inputFilePath, outputFilePath);
  }
};

JackCompiler();