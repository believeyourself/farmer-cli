#!/usr/bin/env node
const commands = require("../src/commands");
const yParser = require("yargs-parser");
const [,,cmd,...rest] = process.argv;
const args:YArgs = yParser(rest);
if(commands[cmd]){
  commands[cmd](args)
}else{
  commands.help(0);
}