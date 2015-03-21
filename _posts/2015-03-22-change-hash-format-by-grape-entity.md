---
layout: post
title: 使用 grape-entity 转换 Hash 到另一种 Hash
tags: [ruby, grape-entity]
---

大家都知道 [Grape](https://github.com/intridea/grape) 是做 api 的，[grape-entity](https://github.com/intridea/grape-entity)
可以将数据以自己定制的结构通过 json 或者 xml 格式暴露给客户端。但 grap-entity 还有一种特殊的用法，
他可以将数据以一种结构转换为另一种结构。

比如有如下示例数据

```ruby
{
  name: "bastengao",
  site: "http://bastengao.com",
  blogs: [
    {
      title: "blog0"
      url: "blog-url0"
    },
    {
      title: "blog1"
      url: "blog-url1"
    }
  ]
}
```

想要转换后的数据

```ruby
{
  site: {
    author: "bastengao",
    url: "http://bastengao.com"
  }
  blog_urls: [ "blog-url0", "blog-url1" ]
}
```

要实现转换的逻辑，可以像下面这样写。

```ruby
class ConvertEntity < Grape::Entity
  expose :site do |data, options|
    { author: data[:name], url: data[:site] }
  end

  expose :blog_urls do |data, options|
    data[:blogs].map {|blog| blog[:url] }
  end
end

ConvertEntity.represent(data).serializable_hash
```

虽然示例数据也可以通过纯 ruby 几行代码实现，
如果遇到复杂的业务数据或者业务使用 grape-entity 会清晰许多，而且更易于维护，同时 Entity 之间也可复用。
