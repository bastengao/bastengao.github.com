---
layout: post
title: settingslogic VS rails_config
tags: [config, settingslogic, rails_config]
---

说到项目配置我之前用 [rails_config](https://github.com/railsconfig/rails_config) 比较多，在一个新项目上决定试试 [settingslogic](https://github.com/settingslogic/settingslogic)。因为对比了 ruby-toolbox 的数据，settingslogc 下载量远远超过 rails_config ，发现 settingslogic 有许多优点

* 下载量大
* 历时悠久
* 定制灵活
* 所有配置在一个文件一目了然

__但。是。__

* 需要手动加 Settings 文件
* 需要手动更改 config/boot.rb 文件，用 syck 替换 psych, [参见](https://github.com/settingslogic/settingslogic#2-create-your-settings)
* 配置不能覆盖嵌套属性(yaml 的 parser 都换了，你还想让我怎样，这点让我很难接受)

相比之下 rails_config

* `rails g rails_config:install` 生成配置文件
* 开箱即用
* 可覆盖嵌套属性

遂继续用 rails_config。