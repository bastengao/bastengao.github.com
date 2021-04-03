---
layout: post
title: iris HTML 模板
tags: [go,web,web,template,iris]
published: true
---

目前的一些 web framework 做 API 很方便，但是做 template 渲染都是简单粗暴，直接输出模板，提供自定义模板函数外，其他额外功能很少。
但真正开发 HTML 还是很需要很多东西，例如 layout 来组织 HTML 整体结构减少冗余，还需要 partial render 来解决 HTML 片段复用。

例如下面典型 HTML，基本每个页面都需要这些东西，如果每个页面都复制完整 HTML 简直是灾难。

```html
<!DOCTYPE html>
<html>
  <head>
    <link>
    <script>
    ...
  </head>
  <body>
    <header>
      ...
    </header>

    content here

    <footer>
      ...
    </footer>
  </body>
</html>
```
![layout]({{site.url}}/images/2021-03-26/layout.svg)

熟悉 Rails 的同学都知道 Rails 有一套[完整机制](https://guides.rubyonrails.org/layouts_and_rendering.html)来解决这些问题。[iris](https://github.com/kataras/iris) 能够比较好的解决这些问题，文档参考[Wiki](https://github.com/kataras/iris/wiki/View) 和 [GoDoc](https://pkg.go.dev/github.com/kataras/iris/view)，官方提供了[layout 例子](https://github.com/kataras/iris/tree/master/_examples/view/layout/html)。例子主要如下：

views/layouts/maim.html
{% raw %}
```
<!DOCTYPE html>
<head>
  <title>{{.Title}}</title>
</head>
<body>
  {{ yield }}

  <footer>
    {{ render "partials/footer.html" }}
  </footer>
</body>
</html>
```
{% endraw %}

views/index.html
{% raw %}
```html
<h1>Index Body</h1>
<h3>Message: {{.Message}}</h3>
```
{% endraw %}

main.go
```go
package main

import "github.com/kataras/iris/v12"

func main() {
    app := iris.New()
    engine := iris.HTML("./views", ".html")
    // 也可以通过这里设置默认 layout 就不用每次手动指定
    // engine.Layout("layouts/main.html")
    app.RegisterView(engine)
    app.Get("/", index)
    app.Listen(":8080")
}

func index(ctx iris.Context) {
    data := iris.Map{
        "Title":      "Page Title",
        "FooterText": "Footer contents",
        "Message":    "Main contents",
    }

    ctx.ViewLayout("layouts/main.html")
    ctx.View("index.html", data)
}
```

`yield` 在 layout 模板用来渲染页面动态内容，例如 `views/index.html` 的内容。`render` 可以渲染其他模板，例如 `partials/footer.html`。
还有 `urlpath` 模板函数，方便做反向路由用，例如 {% raw %}`<a href="{{ urlpath "home" }}">Home</a>`{% endraw %}, 这样改路由就不用大费周章的全局搜索了。


不过 [iris view](https://pkg.go.dev/github.com/kataras/iris/view) 也可以单独使用，view module 抽象了 `Engine` 接口, 接口定义如下。

```go
type Engine interface {
    // Load should load the templates from a physical system directory or by an embedded one (assets/go-bindata).
    Load() error
    // ExecuteWriter should execute a template by its filename with an optional layout and bindingData.
    ExecuteWriter(w io.Writer, filename string, layout string, bindingData interface{}) error
    // Ext should return the final file extension which this view engine is responsible to render.
    Ext() string
}
```

[iris-view-example](https://github.com/bastengao/iris-view-example) 是 `net/http` + iris view 的例子，供大家参考。
