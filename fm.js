const fs = require('fs');
const path = require('path');
const readline = require('readline');

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

function checkAvailability(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return true
  } catch (e) {
    return false
  }
}

function checkIsFile(filePath) {
  const stats = fs.statSync(filePath);
  return stats.isFile();
}

function checkIsDirectory(filePath) {
  const stats = fs.statSync(filePath);
  return stats.isDirectory();
}

function scanDirectory(filePath) {
  const items = fs.readdirSync(filePath);
  const result = {
    files: [],
    directories: []
  };
  items.forEach(item => {
    const itemPath = path.join(filePath, item);
    const stats = fs.statSync(itemPath);
    if (stats.isFile()) {
      result.files.push(item);
    } else if (stats.isDirectory()) {
      result.directories.push(item);
    }
  });
  return result;
}

function createDirectory(directoryPath) {
  fs.mkdirSync(directoryPath);
  return ('Directory created successfully!');
}

function createFile(filePath) {
  const content = "";
  fs.writeFileSync(filePath, content, 'utf-8');
  return ('File created successfully!');
}

function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf-8');
  return ('File written successfully!');
}

function readFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content;
}

function printTable(data = [[]]) {
  const symbols = {
    vertical: "|",
    horizontal: "-",
    edge: "+",
    blank: " "
  }
  const temp = {
    highest: [],
    line: "",
    result: []
  }
  data.forEach((row, rowIndex) => {
    row.forEach((column, index) => {
      const length = typeof column === "string" ? column.length : JSON.stringify(column).length;
      if (rowIndex === 0) {
        temp.highest.push(length);
        return;
      }
      const priviousLength = temp.highest[index];
      temp.highest[index] = length > priviousLength ? length : priviousLength;
    })
  })
  temp.line += symbols.edge;
  data[0].forEach((column, index) => {
    for (let i = 0; i < temp.highest[index] + 2; i++) temp.line += symbols.horizontal;
    temp.line += symbols.edge;
  })
  temp.result.push(temp.line);
  data.forEach((row, rowIndex) => {
    let line = symbols.vertical;
    row.forEach((column, index) => {
      const length = typeof column === "string" ? column.length : JSON.stringify(column).length;
      line += `${symbols.blank}${column}`
      for (let i = 0; i < temp.highest[index] - length; i++) line += `${symbols.blank}`;
      line += `${symbols.blank}${symbols.vertical}`;
    })
    temp.result.push(line);
    temp.result.push(temp.line);
  })
  temp.result.forEach(value => {
    console.log(value);
  })
}

class fileManager {
  constructor() {
    try {
      this.path = path.resolve();
      this.data = scanDirectory(this.path);
    } catch (e) {
      console.log(e.message);
    }
  }
  show() {
    const table = [];
    const dirsLength = this.data.directories.length;
    const filesLength = this.data.files.length;
    const files = this.data.files;
    const dirs = this.data.directories;

    for (let i = 0; i <= filesLength + dirsLength; i++) {
      const row = [];
      if (i < filesLength) {
        const filePath = files[i];
        row.push(i);
        row.push(filePath);
        row.push("file");
      }
      else if (i === filesLength + dirsLength) {
        row.push(i);
        row.push("..");
        row.push("back");
      } else {
        const dirPath = dirs[i - filesLength];
        row.push(i);
        row.push(dirPath);
        row.push("dir");
      }
      table.push(row);
    }
    printTable(table);
  }

  takeInput() {
    ask("#").then(response => {
      try {
      const dirsLength = this.data.directories.length;
      const filesLength = this.data.files.length;
        response = parseInt(response.trim());
      if (response > filesLength + dirsLength) {
        null;
      }
      if (response < filesLength) {
        null
      }
      else if (response === filesLength + dirsLength) {
        const currentPath = this.path;
        const currentPathArray = currentPath.split("/");
        currentPathArray.pop();
        this.path = currentPathArray.join("/")
        this.data = scanDirectory(this.path);
      } 
      else if (response >= filesLength && response < filesLength + dirsLength) {
        const dirs = this.data.directories;
        const dirPath = dirs[response - filesLength];
        this.path = path.join(this.path, dirPath);
        this.data = scanDirectory(this.path);
      }
      this.show();
      this.takeInput();
      } catch (e) {
        console.error(e.message);
        return;
      }
    })
  }
  
  open(){
    this.show();
    this.takeInput();
  }
}

const fm = new fileManager();
fm.open();
