const fs = require('fs');
const path = require("path");
const CompilationEngine = require('./compilationEngine');

// call like "node projects/10/JackAnalyzer/index.js ../Square"
const jackAnalyzer = () => {
  const directoryPath = process.argv[2];
  const allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath));
  const files = allFiles.filter((file) => {
    return file.endsWith('.jack');
  });

  for (const file of files) {
    const inputFilePath = directoryPath + '/' + file;
    const outputFilePath = __dirname + '/' + (directoryPath + '/' + file).slice(0, -5) + '2.xml';
    new CompilationEngine(inputFilePath, outputFilePath);
  }
};

jackAnalyzer();