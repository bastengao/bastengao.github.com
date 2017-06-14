---
layout: post
title: blacksand - 一个基于 Rails Engine 的 CMS gem
tags: [rails,cms]
---

今年的第二篇博客已经是小半年以后了，来把上一篇挖的坑先填了。内部项目需要做一个门户系统，但是找了 Rails 其他 CMS gem 以后发现没有能用的东西，有点沮丧。
所以作为一个程序员必须自力更生，发明轮子。
[blacksand](https://github.com/microwisesystem/blacksand) 最初是在一个内部项目上写的最早的代码，后来把业务不相关的东西提取出来，在解决内部项目问题上一点一点完善，在做了3、4个门户网站后基本成形。

blacksand 抽象出了模板、原型、页面和导航。模板考虑到大部分情况 CMS 的编辑人员都不会 html/css 这些东西，模板主要面向的是程序员，所以添加模板就直接在 Rails 项目写 erb, 然后通过 yaml 导入到数据。例如下面:

```
app/
  themes/
    demo/
      views/
        news/
          index.erb.html
          show.erb.html
```

demo.yml
```yaml
templates:
  - name: "新闻列表"
    path: /news/index
  - name: "新闻详情"
    path: /news/show
```

程序员的工作就是添加模板，供编辑人员添加页面的时候选择使用，模板将决定页面将如何展示。

原型考虑到页面有些场景下不只两个属性（标题和内容），例如新闻除了标题和新闻内容这两个属性外，还会有发布时间和编辑。提取出新闻原型，添加的页面选择新闻原型后，就会给页面动态扩展两个属性并显示两个输入框。抽象出原型可以提供页面不同的数据需求。原型就像类，规定有哪些字段，页面就像实例，存储实际的数据。原型也是通过 yaml 导入到数据库的，例如：

demo.yml
```yaml
prototypes:
  - name: 新闻
    fields_attributes:
    - name: date
      field_type: date
      description: 发布时间
      required: true
    - name: editor
      field_type: string
      description: 编辑
      required: false
```

页面就代表着实际的页面，展示在前端。页面默认有标题、内容（富文本）、模板、原型和标示属性。同时页面也有父子关系，用来规划不同内容板块，例如新闻列表下有很多条新闻。

导航则代表着大部分门户系统顶部的导航条，后台维护一个导航列表。导航可以关联某个具体的页面或者是外部链接。

blacksand 是一个 Rails Engine, 有比较轻的倾入性，可以和现有的 Rais 项目集成。 内部实现上使用了 [themes_for_rails](https://github.com/chamnap/themes_on_rails)，可以让一个 Rails 项目提供多个门户系统而模板不会乱。

以上就是 blacksand 的设计思路，欢迎大家使用，提交 issue 或者 pr。
