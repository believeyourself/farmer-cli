/*
 * @Date: 2021-11-24 13:21:11
 * @LastEditors: lzj
 * @LastEditTime: 2021-12-01 14:36:17
 * @FilePath: \farmer-cli\src\commands.ts
 */
import chalk = require("chalk");
import path = require("path");
import spider = require("./spider");

const help = (code=0)=>{
    console.log(`Usage:
    ${chalk.green("spider help")} 帮助
    ${chalk.green("spider version")} 版本号
    ${chalk.green("spider spider [url]")} 爬取指定网址`);
    process.exit(code);
  }

const version = ()=>{
  const pkg = require(path.join(__dirname, '../../package.json'))
  console.log(pkg.version);
}

export {
  help,
  version,
  spider
}