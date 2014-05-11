---
layout: post
title: 从Java程序员转变为Ruby程序员
tags: [工作, 开发语言, 跳槽]
---

进这个[公司](http://microwise-system.com/)是在2012年三四月份的时候，离开咸阳，来到西安。当时投了了一堆简历，然后接接到很多面试电话。找工作的时候还住在咸阳，每天基本是早上西安，下午回咸阳。我并没有给现在的公司投简历，但接到面试电话后就来试试，那天答题感觉自己状态不是很好，令人意外地是回咸阳的路上就收到了offer(这样的效率让我很吃惊，我接触的其他公司通常是第二天或者更久才通知结果)，故事就从那个时候开始。

刚进公司，经理分给我一个将 3000 个 X 按照地域关系按照一定的模式分配唯一的 ID的任务(不能说的太细，关心技术就够了)，当时我毫不犹豫的就决定使用 ruby 来完成这项任务。原始数据中又一部分比较完善，有一些则不是。第一步，我先用 ruby 将他们从 excel 导入到数据库中，转化为结构化数据。第二部，写 ruby 脚本推算出大概 1500 个 X 的ID。第三部，需要手工完成，为了提高效率，我用 ruby 写了个简单地 web 页面，来辅助我完成。最后实在是太多了，没有弄完，但也有 2000 个吧，基本可以满足使用要求了。

说起来也怪，我的工作其实是Java Developer，但开始竟然用的不是Java。随后接下来两年的工作，基本上和大部分Java 程序员是一样的，主要是Java web 和后台项目。

由于我之前已经有两年maven的使用经验，很难接受不是 maven 的 java 项目，凡是我发起的项目都是 maven，最后java项目没有不是基于 maven 的。

有了 maven 后，自动化测试和持续集成是水到渠成的事。接下来在公司内部搭建了 teamcity，当时主要觉得 teamcity 比 jenkins UI 好看一些，但貌似现在 jenkins 社区支持会好一些。

开发工具大家基本上都使用又重又笨得 Eclipse 或者 MyEclispse(一些人可能情绪比较激动，但我就是这样认为的)，我选择 IntelliJ IDEA，自从用了他再也有没有换过。自从 Google 将 android 官方开发工具从 Eclipse 换为 Android Stutio(基于 IntelliJ)，让我更坚信这一点。 还有就是任何开发工具，不管是IntelliJ 还是 Sublime Text 或者纯 VIM，我都使用 VIM。渐渐地大家也都接受了 IntelliJ，做个一两次VIM的分享后，部门内的其他成员有些也使用了VIM。为此，我还给大家买了些印有VIM命令的鼠标垫(当然也有Linux命令的)。

新产品的开发中，我加入了 Bootstrap(但是版本还是2.x)，公司一直没有专业的UI设计。模板主要使用 freemarker，借鉴 Rails 的 layout 机制，也总结出了自己的用法。

由于部门内一个主要做维护工作的人离职投奔自己的理想，学画画去也。我为了减轻数据库的维护工作，引入了 [flayway](http://flywaydb.org/)，类似于 Rails 的 Migration，唯一不足的就是没有 rollback 功能。

同时为了更方便维护，我在项目发布的时候加入了的版本号，参考[maven webapp 读取代码版本号](/blog/2013/11/maven-webapp-read-scm-version.html)，同时把这个任务通过 maven plugin 交给了 teamcity，测试通过后发布到 ftp，并提供 http 下载打包项目。

后来为了公司产品产品更好地展示和移动应用的下载，我用 GitHub 提供的 Pages 服务搭建了[产品网站](http://products.microwise-system.com/)，同时为了信息更透明和更好地交流，我让大家每开发一个功能都要写相关的博客。

我们版本控制一直使用svn，且大家开发一直都在主干上，但实施的项目越来越多，有时候情况紧急需要某个特性进行部署，可是另外一个功能可是开发了一半。这种事情经常发生，我想通过将版本控制换为 git，并通过特性分支(svn 也可以有分支，git 更方便，同时组内成员更容易掌握和操作)的方式能有效地避免此类问题。换 git 另外一个好处是，可以更好地做 code review，特性分支开发完成后提交 pull request，然后进行 code review，通过后 merge 到 master。由于我的离职，无法推进此事，但其他人会继续跟进。

在公司两年时间，收获了三个开源项目，一个是struts的插件[strts2-freeroute](https://github.com/bastengao/struts2-freeroute) 另外两个是 [painter](https://github.com/bastengao/painter)和 [common-css](https://github.com/bastengao/common-css)，有兴趣的同学可以关注。

时间很快到了2014年4月，有一天我在[ruby-china](http://ruby-china.org/)看到西安有招聘帖，就发了简历，后来面试也很愉快，很快就拿到了 offer，期间还偶遇到了经常在ruby线下活动的朋友(ruby 的圈子太小了)。五一过后，我就把离职的事情告诉了经理，经理一开始就愉快地答应了，但后来意识到我的离开影响比较大想挽留我(加薪等等各种诱惑)，期间我也纠结过，在公司两年时间，怎么可能没有感情呢？最终我还是选择了离开，转向Ruby。

进公司的第一个任务使用ruby，最后离开也是为了ruby，可见ruby对我的影响有多重要。印象中是11年6月接触的ruby，还是更早已经记不清了。自从接触到ruby就对他感觉非常好，自学ruby。但是后来学习rails的时候遇到了障碍，对于一个新手rails一开始概念的确有些多。期间学习rails断断续续，三天大鱼两天晒网。后来为了激励自己，[参加西安ruby的线下活动](/blog/2014/06/xian-rubyist-first-offline-party.html)。最终还是rails入了门，可是业余时间写rails已经不能满足我的需求，所以我还是选择了寻找全职的ruby工作。
