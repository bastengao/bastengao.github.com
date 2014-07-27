---
layout: post
title: 中国地区数据 rails gem
tags: [gem, rails, chinese-regions]
---

[chinese\_regions\_rails](https://github.com/bastengao/chinese_regions_rails) 是我写的第一个 gem, 也是我第一个 rails gem。里面包含了如何编写 gem, 如何编写 rails 的 rake task, 和如何编写 rails generator。尽管一开始涉及的东西都比较多但都是相对简单, 最终还是磕磕绊绊的弄出来了(多数遇到问题是都参考现成的开源项目)。

这个 gem 其实是个搬运工，只是将 [chinese\_regions\_db](https://github.com/xixilive/chinese_regions_db) 数据和 rails 的 activerecord 的 model 结合起来。我们不生产*中国地区数据*, 只是大自然的搬运工。过生也很简单，生成 `Region` model, 并将地区数据通过 `seed` 插入到 `regions` 表中，打完收工。
