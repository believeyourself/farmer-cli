# farmer-site-cli 使用文档

## 安装farmer-site-cli

```
npm i farmer-site-cli
```

查看是否安装成功

```
farmer version
```

### 

## spider 命令

简单使用，下载指定网页保存至当前执行目录:

```
farmer spider www.baidu.com
```

### 参数说明

--all：跟踪下载网页中同源的所有html文件

--md: 将请求到的html文件尝试转为md并下载(直接从html转md目前还有问题格式会乱，后续再更新)
