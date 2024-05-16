---
title: Git 常用指令
date: 2022-06-28
sidebar: 'auto'
tags:
 - git
categories:
 - 前端
---

## 本地仓库

```
git init # 初始化本地git 以下所有操作的前提条件

git add -A # 添加当前所有变动文件到本地缓存区
git commit -m '<commit-word>' # 提交缓存区内容到本地仓库
git commit -am '<commit-word>' # 上面两步合并为一步的命令

git checkout master
git checkout -b <feat-name> # 新建feat-name分支并切换到该分支

git branch -a # 列出所有本地分支和远程分支
git branch -D <feat-name> # 删除本地feat-name分支

git status # 显示当前分支状态
git reset --hard # 回滚到最近的commit
git config --list # 显示当前的Git配置

```

## 远程仓库

```
git remote add origin <URL> # 关联远程仓库，以下操作的前提条件
git remote -v # 显示远程仓库
git branch -vv  # 查看本地分支与远程分支对应关系

git pull # 拉取远程代码到本地
git push -u origin master # 推送本地到远程master分支
git push origin :branch-name # 删除远程分支 # 等同于 git push origin --delete [branch-name]

git merge feat-name # feat-name分支内容合并到当前分支，适合不同分支间commit合并操作
git checkout -b devbranch origin/devbranch  # 创建分支并切换分支，同时对应到远程分支

git pull或者git fetch origin可以拉取所有远程分支
使用git pull origin devbranch命令可以拉取单远程分支
```

## 高级

```
# 变基。
# 记住，rebase操作永远不在公共分支操作；同时rebase与公共分支名永远不同时出现
# 场景1:减少同一分支提交记录
# 交互式合并当前分支最近三次的记录，用于简化提交记录。
# 注意：不要合并先前提交的东西，也就是已经提交远程分支的纪录。
git rebase -i HEAD~3

# 场景2: 把feat-A变得基于feat-B
# # 把当前A分支的提交commit，变基到A和B分支共同祖先的commit上，然后加上B分支后续的commit。
git reabse feat-B

# 子模块
git submodule add https://github.com/djyde/ToProgress # 添加子模块
git submodule status # 检查子模块状态
git submodule update ToProgress # 更新子模块
git submodule deinit ToProgress && git rm ToPogress # 删除子模块

# Tag
git tag # 查看tag
git tag -a <tag-name> -m <comment> # 新建tag
git push origin --tags # 推送tag
    
```

## 常用

### 部署gh-pages

```
// 部署gh-pages主页(一直在master分支上执行)

# 1. 把dist分支上传到master分支
npm run build && git commit -am 'deploy'
# 2. 意思是把远程master（注意不是本地master）分支的dist文件夹，
# 推送到远程的gh-pages分支。
git subtree push --prefix dist origin gh-pages
    
```

可以设置deploy命令：

```
"deploy": "npm run build && git commit -am 'deploy' && git subtree push --prefix dist origin gh-pages",
    
```
::tip
 以上是使用原生git命令，实际项目中更推荐[gh-pages](https://lq782655835.github.io/blogs/tools/git-command.html)这样的工具包。
:::

### fork仓库同步代码

将源项目代码同步到Fork出来的个人项目上

```
#拉取Fork出来的分支
git clone Fork的分支url

#注意：进入项目根目录，执行下面操作

#查看所有远程库(remote repo)的远程url
git remote -v

#添加源分支url
git remote add upstream 替换成源项目url

#查看所有远程库(remote repo)的远程url
git remote -v

#从源分支获取最新的代码
git fetch upstream

#切换到主分支
git checkout master

#合并本地分支和源分支,本地库和远程的github原仓库同步
git merge upstream/master

#push到fork分支,本地的仓库提交到github
git push origin master
    
```

### git emoji

执行 git commit 时使用 emoji 为本次提交打上一个 "标签", 使得此次 commit 的主要工作得以凸现，也能够使得其在整个提交历史中易于区分与查找。

| emoji          | emoji 代码                     | commit 说明       |
| -------------- | ---------------------------- | --------------- |
| 🎉 (庆祝)        | `:tada:`                     | 初次提交            |
| ✨ (火花)         | `:sparkles:`                 | 引入新功能           |
| 🔖 (书签)        | `:bookmark:`                 | 发行/版本标签         |
| 🐛 (bug)       | `:bug:`                      | 修复 bug          |
| 🚑 (急救车)       | `:ambulance:`                | 重要补丁            |
| 🌐 (地球)        | `:globe_with_meridians:`     | 国际化与本地化         |
| 💄 (口红)        | `:lipstick:`                 | 更新 UI 和样式文件     |
| 🎬 (场记板)       | `:clapper:`                  | 更新演示/示例         |
| 🚨 (警车灯)       | `:rotating_light:`           | 移除 linter 警告    |
| 🔧 (扳手)        | `:wrench:`                   | 修改配置文件          |
| ➕ (加号)         | `:heavy_plus_sign:`          | 增加一个依赖          |
| ➖ (减号)         | `:heavy_minus_sign:`         | 减少一个依赖          |
| ⬆️ (上升箭头)      | `:arrow_up:`                 | 升级依赖            |
| ⬇️ (下降箭头)      | `:arrow_down:`               | 降级依赖            |
| ⚡️ (闪电)🐎 (赛马) | `:zap:``:racehorse:`         | 提升性能            |
| 📈 (上升趋势图)     | `:chart_with_upwards_trend:` | 添加分析或跟踪代码       |
| 🚀 (火箭)        | `:rocket:`                   | 部署功能            |
| ✅ (白色复选框)      | `:white_check_mark:`         | 增加测试            |
| 📝 (备忘录)       | `:memo:`                     | 撰写文档            |
| 🔨 (锤子)        | `:hammer:`                   | 重大重构            |
| 🎨 (调色板)       | `:art:`                      | 改进代码结构/代码格式     |
| 🔥 (火焰)        | `:fire:`                     | 移除代码或文件         |
| ✏️ (铅笔)        | `:pencil2:`                  | 修复 typo         |
| 🚧 (施工)        | `:construction:`             | 工作进行中           |
| 👷 (工人)        | `:construction_worker:`      | 添加 CI 构建系统      |
| 💚 (绿心)        | `:green_heart:`              | 修复 CI 构建问题      |
| 🔒 (锁)         | `:lock:`                     | 修复安全问题          |
| 🐳 (鲸鱼)        | `:whale:`                    | Docker 相关工作     |
| 🍎 (苹果)        | `:apple:`                    | 修复 macOS 下的问题   |
| 🐧 (企鹅)        | `:penguin:`                  | 修复 Linux 下的问题   |
| 🏁 (旗帜)        | `:checked_flag:`             | 修复 Windows 下的问题 |