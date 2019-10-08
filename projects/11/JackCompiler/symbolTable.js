const { KIND } = require('./constants');

class SymbolTable {
  constructor() {
    this.staticTable = {};
    this.fieldTable = {};
    this.argTable = {};
    this.varTable = {};
  }

  startSubroutine() {
    this.argTable = {};
    this.varTable = {};
  }

  define(name, type, kind) {
    if (kind === KIND.STATIC) {
      this.staticTable[name] = {
        type,
        kind,
        index: this.varCount(KIND.STATIC)
      };
    } else if (kind === KIND.FIELD) {
      this.fieldTable[name] = {
        type,
        kind,
        index: this.varCount(KIND.FIELD)
      };
    } else if (kind === KIND.ARGUMENT) {
      this.argTable[name] = {
        type,
        kind,
        index: this.varCount(KIND.ARGUMENT)
      };
    } else if (kind === KIND.VAR) {
      this.varTable[name] = {
        type,
        kind,
        index: this.varCount(KIND.VAR)
      };
    } else {
      throw new Error(`invalid kind for define, kind: ${kind}`);
    }
  }

  varCount(kind) {
    if (kind === KIND.STATIC) {
      return Object.keys(this.staticTable).length;
    } else if (kind === KIND.FIELD) {
      return Object.keys(this.fieldTable).length;
    } else if (kind === KIND.ARGUMENT) {
      return Object.keys(this.argTable).length;
    } else if (kind === KIND.VAR) {
      return Object.keys(this.varTable).length;
    } else {
      throw new Error(`invalid kind for varCount, kind: ${kind}`);
    }
  }

  kindOf(name) {
    if (name in this.argTable) {
      return this.argTable[name].kind;
    } else if (name in this.varTable) {
      return this.varTable[name].kind;
    } else if (name in this.staticTable) {
      return this.staticTable[name].kind;
    } else if (name in this.fieldTable) {
      return this.fieldTable[name].kind;
    } else {
      return KIND.NONE;
    }
  }

  typeOf(name) {
    if (name in this.argTable) {
      return this.argTable[name].type;
    } else if (name in this.varTable) {
      return this.varTable[name].type;
    } else if (name in this.staticTable) {
      return this.staticTable[name].type;
    } else if (name in this.fieldTable) {
      return this.fieldTable[name].type;
    } else {
      throw new Error(`invalid name for typeOf, name: ${name}`);
    }
  }

  indexOf(name) {
    if (name in this.argTable) {
      return this.argTable[name].index;
    } else if (name in this.varTable) {
      return this.varTable[name].index;
    } else if (name in this.staticTable) {
      return this.staticTable[name].index;
    } else if (name in this.fieldTable) {
      return this.fieldTable[name].index;
    } else {
      throw new Error(`invalid name for indexOf, name: ${name}`);
    }
  }
};

module.exports = SymbolTable;