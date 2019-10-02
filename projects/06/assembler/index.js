const fs = require('fs');
const inputPath = '../pong/PongL.asm';
const outputPath = __dirname + '/../pong/PongL_create.hack';

const Parser = require('./parser');
const Code = require('./code');

const assembler = () => {
  const parser = new Parser(inputPath);
  const code = new Code();

  let machineCode;
  const machineCodes = [];

  while (parser.hasMoreCommands()) {
    if (parser.commandType() === 'C_COMMAND') {
      const destMnemonic = parser.dest();
      const compMnemonic = parser.comp();
      const jumpMnemonic = parser.jump();
      // console.log('===========destMnemonic', destMnemonic);
      // console.log('===========compMnemonic', compMnemonic);
      // console.log('===========jumpMnemonic', jumpMnemonic);

      const dest = code.dest(destMnemonic);
      const comp = code.comp(compMnemonic);
      const jump = code.jump(jumpMnemonic);
      // console.log('===========dest', dest);
      // console.log('===========comp', comp);
      // console.log('===========jump', jump);

      machineCode = '111' + comp + dest + jump;
    } else if (parser.commandType() === 'A_COMMAND') {
      const symbol = parseInt(parser.symbol());
      machineCode = ('0000000000000000' + symbol.toString(2)).slice(-16);
    } else if (parser.commandType() === 'L_COMMAND') {
      machineCode = parser.symbol();
    } else {
      throw new Error('invalid commandType');
    }

    machineCodes.push(machineCode);
    parser.advance();
  }

  fs.writeFileSync(outputPath, machineCodes.join('\n'));
};

assembler();