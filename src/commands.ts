const path = require("path");

const help = (code=0)=>{
    console.log(`Usage:
    farmer help: 帮助
    farmer version: 版本`);
    process.exit(code);
  }

const version = ()=>{
  const package = require(path.join(__dirname, '../../package.json'))
  console.log(package.version);
}

module.exports = {
  help,
  version
}