---
layout: post
title: iris 使用小技巧
tags: [go,iris,mvc]
last_modified: 2022-05-18 22:02
published: true
---

## 内嵌模板

Go build 出的二进制文件是不包括静态资源的，例如 html。
所以 iris 结合使用 go-bindata 把静态资源打包到二进制文件，并注册给 view engine 使用。大概代码如下：

```go
tmpl := iris.HTML("./views", ".html")
tmpl.Binary(Asset, AssetNames)
```

自从 Go 1.6 有了官方的内嵌资源功能后 [embed](https://pkg.go.dev/embed)，其他的一些做静态资源打包的就被大一统了。
结合 iris(v12.2.0-beta1) 用，就非常简单了。示例如下：

```go
//go:embed views/*
var fs embed.FS

// iris.HTML 支持目录或者 http.FileSystem
tmpl = iris.HTML(http.FS(fs), ".html")
```

## MVC GetByXxx

官方 [MVC wiki](https://github.com/kataras/iris/wiki/MVC) 里列举了 GetBy 和 GetXxxBy, 但是少说明了一个 GetByXxx, 效果如下。

```go
mvc.New(app.Party("/users")).Handle(new(UsersController))

// Method: GET
// Resource: /users/{userID:int64}/addresses
func (* UsersController) GetByAddresses(userID int64) string {
    return "addresses"
}
```

## MVC 路由命名

iris 支持[路由命名](https://github.com/kataras/iris/wiki/Routing-reverse-lookups)，并可以通过路由名称来获取路径。这种就可以方便的实现跳转或者页面引用路径，而不必到处写死路径。
常规注册路由可以很方便的拿到 `router.Route` 从何进行命名，像下面这样.

```go
app.Get("/", h).Name = "home"
```

但是如果使用 MVC, 路由注册是动态的，没法直接拿到 `Route` 对象，需要通过 `AfterActivation` 回调来获取路由，从而进行命名。如下面这样：

```go
type MyController struct {}

func (c *MyController) AfterActivation(b mvc.AfterActivation) {
    c.GetRoutes("Get")[0].Name = "home"
}

func (c *MyController) Get() string {
    return "home"
}
```

## MVC 重定向

通过设置 mvc.Response 里的 Path 就可以实现跳转了。

```go
func (c *MyController) Get() mvc.Result {
    return mvc.Response{
        Path: "/path/redirect/to",
    }
}
```

以上是基于 iris v12.2.0-beta1 版本的技巧，供大家参考。
