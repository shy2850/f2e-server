title: ssh-key 指南  
keywords: git, ssh-key, github  
description: 如何生成SSH key
date: 2017/11/17

SSH key提供了一种与GitHub通信的方式，通过这种方式，能够在不输入密码的情况下，将GitHub作为自己的remote端服务器，进行版本控制

# 步骤
- 检查SSH keys是否存在
- 生成新的ssh key
- 将ssh key添加到GitHub中

## 1. 检查SSH keys是否存在
输入下面的命令，如果有文件`id_rsa.pub` 或 `id_dsa.pub`，则直接进入步骤3将SSH key添加到GitHub中，否则进入第二步生成SSH key
``` bash
ls -al ~/.ssh
# Lists the files in your .ssh directory, if they exist
```

## 2. 生成新的ssh key
在命令行中输入`ssh-keygen -t rsa -C "your_email@example.com"`  
默认会在相应路径下 `~` 生成`id_rsa`和`id_rsa.pub`两个文件，如下面代码所示
``` bash
ssh-keygen -t rsa -C "your_email@example.com"
# Creates a new ssh key using the provided email
Generating public/private rsa key pair.
Enter file in which to save the key (~/.ssh/id_rsa):
```
## 3. 将ssh key添加到GitHub中
文本编辑器打开`id_rsa.pub`文件，里面的信息即为SSH key，将这些信息复制到GitHub的[Add SSH key](https://github.com/settings/keys)页面即可  
```bash
cat ~/.ssh/id_rsa.pub
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDGHSXDF1W2ae/NfgBQ+GiXjDURqfGS1kukXv/GHP9g74VOt3z6tOAnVee0R9Zj3nwYfaWIlBGoRaEWO4WK8CHaHNihQwcf5Lo7RH/e98AN6ezDUz
1xnnzk3yYG7CrnJHzlWH7bQXw8uHOAQrs8hRauv/B3BzheZ6anb9y8Pkpet4z9xUiGaEMcv+KgFow/jxOiBa+sPnXOu7BgehjKNnEVw6ru9ekoiX4eQjOT0Nl6tyd40UjkZGxvEYxZrtIEGMrP+x
Qs/wdUWa72B6Y/V3chyURhiqsC0V0uh36sO2SgvXmMPi1FNN9yIy4hq0Pw1he74sLskY2mFX7R7e2N your_email@example.com
```