Popush 部署文档
==============

*chaowei@tagsys.org*

*1 Nov 2013*

## 安装依赖

软件 | 版本 |
------------- | ----- |
Nginx *       | 1.5   |
Node          | 0.10  |
MongoDB       | 2.2   |
Python        | 2.7   |
Perl          | 5.14  |
Ruby          | 2.0   |
Lua           | 5.2   |
JDK           | 7.0   |
MINGW         |       |
Window        | 7.0   |
**请下载源码编译
..推荐将mongodb,nginx解压到D盘，同时将popush clone到D盘

## 获取源码

	git clone https://github.com/GrassSunFlower/mypopush.git


## 部署
	在nginx里面将conf文件用lib中conf文件替换。修改路径地址

	在popush根目录下有start.bat文件，点击
非解压到D盘
##获取依赖项
	cd popush所在目录，在命令行输入:npm install
##部署
	cd nginx所在目录  输入start nginx
	cd mongodb所在目录，进入bin，输入 start mongod 
#开始服务器
	cd popush文件夹，输入node app.js
