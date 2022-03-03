  /*
  * @Date: 2021-12-01 09:55:57
  * @LastEditors: lzj
  * @LastEditTime: 2021-12-02 13:13:47
  * @FilePath: \farmer-cli\src\spider\index.ts
  */
  import axios, { AxiosResponse } from "axios";
  import toMarkdown = require("to-markdown");
  import path = require("path");
  import fs =  require("fs");
  import chalk = require("chalk");
  import * as cheerio from "cheerio";

  let total = 0;//文件个数
  let origin:URL = null;//出事url
  let usedPath:string[] = [];//爬取过url
  let queue:string[] = [];//等待爬起数组

  const options = {
    all:false,
    md:false,
    tag: "body"
  }


  // 域名前缀处理
  const prefixUrl = (url:string) => {
    if(url && !url.startsWith("http")){
      return `https://${url}`;
    }
    return url;
  }

  // 获取页面中的同源URL地址并补全域名协议
  const getAllHref = ($:cheerio.CheerioAPI)=>{
    const tags = $("a");
    const arr = Array.from(tags);

    const target = arr.map((a:any)=>{
      const url = a.attribs.href;

      //补全协议，域名
      const completeUrl =  url?.startsWith("/") ? origin.hostname+url : url;
      
      //排除其他域名和爬取过的域名
      if(!completeUrl || !completeUrl.includes(origin.hostname) || usedPath.includes(completeUrl)){
        return null;
      }
      
      return prefixUrl(completeUrl);
    }).filter((url:string)=>{
      return !!url;
    });
    return target;
  }

  // 请求目标地址
  const requestUrl = async (url:string,savePath:string)=>{
    const urlObj = new URL(url);
    const res: AxiosResponse = await axios.get(encodeURI(url),{
      params: urlObj.searchParams as any,
      headers:{
        // ":authority": "www.caiens.com",
        // ":method": "GET",
        // ":path": options.pathname,
        // ":scheme": options.protocol,
        // "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
        // "accept-encoding": "gzip, deflate, br",
        // "accept-language": "zh-CN,zh;q=0.9",
        // "cache-control": "no-cache",
        // "cookie": "Hm_lvt_4ce34c5cbb183d774ef750fc346c16ff=1636188368; mc_a_t_885=1; captcha_854264996=3d18809e220fc235bc51c7e94084b2d7",
        // "pragma": "no-cache",
        // "sec-fetch-dest": "document",
        // "sec-fetch-mode": "navigate",
        // "sec-fetch-site": "none",
        // "sec-fetch-user": "?1",
        // "upgrade-insecure-requests": 1,
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
      }
    })
    //错误处理
    .catch((e) => {
      console.error(chalk.redBright("===================="));
      console.error(chalk.redBright(url));
      console.error(chalk.redBright(e));
      return null;
    });

    //报错了
    if(!res){
      return;
    }

    //处理重定向
    if(res.status >= 300 && res.status <= 400){
      requestUrl(prefixUrl(res.headers.location),savePath);
      return;
    }
    if(res.status === 403){
      console.error(chalk.redBright(`访问被禁止:${res.status}[ ${url} ]`));
      return;
    }
    else if(res.status !== 200){
      console.error(chalk.redBright("===================="));
      console.error(chalk.redBright(`请求失败，code:${res.status}[ ${url} ]`));
      return;
    }
    

    //记录处理过得路径
    usedPath.push(url);

    //内容处理
    let content = res.data;
    const $ = cheerio.load(content);
    const artical = $(options.tag);

    //不是内容页的页面不保存
    if(artical){
      let fileName = `${urlObj.hostname}${urlObj.pathname}${urlObj.hash}`.replace(/(\/|\\)/g,"_");
      if(options.md){
        //保存md文件
        let mdContent = toMarkdown(artical.toString());
        const finalFileName = fileName.includes(".md") ? fileName : `${fileName}.md`;
        fs.writeFileSync(path.join(savePath,finalFileName),mdContent.toString());
      }else{
        //保存html文件
        const finalFileName = fileName.includes(".html") ? fileName : `${fileName}.html`;
        fs.writeFileSync(path.join(savePath, finalFileName),artical.toString());
      }
    }

    // 获取页面中所有的URL
    if(options.all){
      const $ = cheerio.load(content);
      queue.push(...getAllHref($));
    }
  }

  const saveImage = () => {
    
  }

  const start = async (url:string,saveDir:string)=>{
    queue.push(url);
    while(queue.length > 0){
      const url = queue.shift();
      await requestUrl(url,saveDir);
      total++;
    }
    
    console.log(chalk.green(`下载成功${total}个文件`))
  }

  //生成下载目录
  const genDirectory = () => {
    //创建保存目录 
    let saveDir = path.join(process.cwd(),`./${origin.hostname}`);
    if(!fs.existsSync(saveDir)){
      fs.mkdirSync(saveDir);  
    }

    // 创建图片保存路径
    let imageDir = path.join(saveDir,`images`);
    if(!fs.existsSync(imageDir)){
      fs.mkdirSync(imageDir);  
    }

    return saveDir;
  }

  module.exports = async (args:YArgs) => {
    const [url] = args._;
    options.all = args.all || false;
    options.md = args.md || false;
    options.tag = args.tag || "body";
    origin = new URL(prefixUrl(url));

    const saveDir = genDirectory();
    start(prefixUrl(url), saveDir)
  }