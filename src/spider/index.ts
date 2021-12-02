/*
 * @Date: 2021-12-01 09:55:57
 * @LastEditors: lzj
 * @LastEditTime: 2021-12-02 13:13:47
 * @FilePath: \farmer-cli\src\spider\index.ts
 */
import https = require("https");
import http = require("http");
import path = require("path");
import fs =  require("fs");
import chalk = require("chalk");
import toMarkdown = require('to-markdown');
import { IncomingMessage } from "http";
import * as cheerio from "cheerio";

let origin:URL = null;
let usedPath:string[] = [];

const prefixUrl = (url:string) => {
  if(!url.startsWith("http")){
    return `https://${url}`;
  }
  return url;
}

const getAllHref = ($:cheerio.CheerioAPI)=>{
  const tags = $("a");
  const arr = Array.from(tags);
  return arr.map((a:any)=>{
    return a.attribs.href;
  }).filter((url:string)=>{
    return url && url.match(/^(http(s?):\/\/)/);
  });
}

const getUrl = (url:string,savePath:string)=>{
  const options = new URL(prefixUrl(url));
  if(!origin.hostname.includes(options.hostname) || usedPath.includes(options.pathname)){
    return;
  }

  const agent = options.protocol === "https:"? https : http;
  const port = options.protocol === "https:"? 443 : options.port || 80;
  agent.get({
    hostname:options.hostname,
    port:port,
    path:options.pathname,
    hash:options.hash,
    searchParams: options.searchParams as any,
    headers:{
      "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36"
    }
  }, (res: IncomingMessage) => {

    //处理重定向
    if(res.statusCode >= 300 && res.statusCode <= 400){
      getUrl(prefixUrl(res.headers.location),savePath);
      return;
    }else if(res.statusCode !== 200){
      console.error(chalk.redBright("===================="));
      console.error(chalk.redBright(`请求失败，code:${res.statusCode}[ ${url} ]`));
      return;
    }
    

    //记录处理过得路径
    usedPath.push(options.pathname);

    //内容处理
    let content = "";
    res.on('data', (d:Buffer) => {
      content += d;
    });
    res.on('end',async () => {
      //保存html文件
      let fileName = `${options.hostname}${options.pathname}${options.hash}`.replace(/(\/|\\)/g,"_");
      fs.writeFileSync(path.join(savePath,`${fileName}.html`),content.toString());

      //保存md文件
      // let mdContent = toMarkdown(content);
      // fs.writeFileSync(path.join(savePath,`${fileName}.md`),mdContent.toString());
      console.log(chalk.green(`${fileName}已保存到路径:${savePath}`));

      //当前页面中的url继续读取
      const $ = cheerio.load(content);
      
      const tasks:any[] = [];
      getAllHref($).forEach((url:string)=>{
        tasks.push(new Promise(()=>{
          getUrl(prefixUrl(url),savePath);
        }))
      });

      //有任务则五秒后开启下一轮
      if(tasks.length > 0){
         await Promise.all(tasks);
      }
      
    });
  })
  //错误处理
  .on('error', (e: Error) => {
    console.error(chalk.redBright("===================="));
    console.error(chalk.redBright(url));
    console.error(chalk.redBright(e));
  });
}

module.exports = async (args:YArgs) => {
  let [url] = args._;
  //创建保存目录 
  let saveDir = path.join(process.cwd(),`./${url}`);
  if(!fs.existsSync(saveDir)){
    fs.mkdirSync(saveDir);  
  }
  origin = new URL(prefixUrl(url));
  getUrl(url,saveDir);
}