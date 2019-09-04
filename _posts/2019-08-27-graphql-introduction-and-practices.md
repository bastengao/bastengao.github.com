---
layout: post
title: GraphQL ruby 实现入门和实践
tags: [graphql,ruby,practices]
---

从 2018 年初项目从 REST 切换成 GraphQL 后就一直从事 GraphQL 的开发，从 1.7 开始, 升级到 1.8 然后到 1.9 可以说是对 GraphQL ruby 有一个比较深入的使用。正好在 [RubyConf China 2019](http://www.rubyconfchina.org/) 组织者之一的 [hooopo](https://ruby-china.org/hooopo) 怂恿下，让我对 GraphQL 贡献一个话题，我也就怀着激动和忐忑的心接受了。

认证 header 我们是使用 JWT, 用起来非常方便，但是如果要做登出业务需要后端对 JWT 进行存储来进行二次验证。授权最早是使用 graphql-guard, 后面 1.8+ 版本加了授权支持也没有使用，不知道实际使用的效果如何。

如果可以项目一开始还是建议使用 Relay 实践，Object Idenfication 和 node 接口还是比较省事。基于游标的分页如果满足项目需求用起来也不错，如果是基于页码的分页我们进行了一些自己的封装，现在独立一个 gem 在这里 [graphql-paging](https://github.com/bastengao/graphql-paging)。

Subscription 推送也是一个比较使用的特性，可以基于 ActionCable 实现，不过客户端集成那里 ActionCable 的 js adapter 有点小问题，不知道现在还会不会有坑。

总而言之如果是稍微大一点的 API 项目我觉得 GraphQL 还是有明显的优势，同时如果项目团队人员比较多的情况下也可以较少关于 API 文档的沟通成本。

* [PPT下载](/downloads/graphql-introduction-and-practices.pdf)
* 视频在下面

<iframe width="560" height="315" src="https://www.youtube.com/embed/UquN88bxgqA" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>