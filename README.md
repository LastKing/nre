# nre 项目，对npm 源的管理项目

>参考了 nrm ，自己的第一个 npm 全局安装命令行工具。


1. 测试：直接在本地全局安装 `$sudo npm install . g`
2. package.json 里面的`bin` 可以设置命令行的 别名`{nre2:'./index.js''}`如果不设置就是默认的package中的name

纯属好玩，无任何其他意思



参考：

1. [NodeJs制作命令行工具](https://segmentfault.com/a/1190000002918295#articleHeader3)