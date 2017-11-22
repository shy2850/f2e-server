title: f2e-blog 脚手架  
keywords: f2e-blog, 博客, 文档  
description: 使用 f2e-blog 逐步完成个人博客环境搭建  
date: 2017/11/16

# f2e-blog
f2e-blog 是基于nodejs环境的极简个人博客开发框架。 只需要你了解markdown语法就能快速完成博客文章的发布。

> **以下所有命令请在支持 `*nix-bash` 环境下使用， 不支持 dos或者powershell**

## install&start

- Node.js >= 8.9.1
- Git

``` bash
$ git clone https://github.com/shy2850/f2e-blog # 下载
$ cd f2e-blog
$ npm i
$ npm run tsc # 编译代码
$ npm start   # 启动服务并监听

```

## write article

1. 在 `src/` 下新建 `.md` 文件， 刷新首页列表看到最新文章， 点击进入后实时预览
2. 在 `.md` 文档开始部分书写以下格式描述 

> title: f2e-blog 脚手架  
> keywords: f2e-blog, 博客, 文档  
> description: 使用 f2e-blog 逐步完成个人博客环境搭建  
> date: 2017/11/16

## install for deploy
`install.sh` 将 `output` 目录设置为发布博客的源目录, 你可以选择 `github` 或者 `(s)ftp` 等  
如果是 `github` 你需要在 `install` 的时候进行初始化

``` bash
cp -rf ./node_modules/font-awesome/fonts ./src
rm -rf ./output
git clone https://github.com/shy2850/shy2850.github.io output
```

## deploy
`deploy.sh` 将 `output` 目录代码发布到指定 工具, 这里使用 `github`  
``` bash
npm run build # 前端构建
cd ./output # 进入目标目录
git add .   # git 操作进行发布
git commit -m "update"
git push    # 可能需要输入密码 (除非你设置了 ssh-key)
```
> [ssh-key 指南](/utils/git/ssh-key/)

## deploy 发布
发布你博客需要执行以下命令  
```bash
$ npm run build
$ npm run deploy
```
配置好 [ghpages](https://pages.github.com/) 就可以看到你发布的内容了
欢迎参观: [shy2850.github.io](https://shy2850.github.io)
