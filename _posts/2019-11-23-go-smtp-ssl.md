---
layout: post
title: Go SMTP SSL 发邮件的一个小坑
tags: [go,smtp,ssl]
---

Go 标准库已经带了 net/stmp 的库，可以通过 `smtp.SendMail(addr, auth, from, to, msg)` 直接发送邮件。看到 SendMail https://godoc.org/net/smtp#SendMail 方法的描述说如果可以使用 TLS 认证。

```
SendMail connects to the server at addr, switches to TLS if possible, authenticates with the optional mechanism a if possible, and then sends an email from address from, to addresses to, with message msg. The addr must include a port, as in "mail.example.com:smtp".
```

测试了非 SSL 连接发邮件没有问题，SSL 方式就会等待60后莫名其妙的返回 `EOF` 错误。
检查了多变配置后还是有问题，搜索到这个帖子 [go-smtp, unable to send email through gmail, getting EOF](https://stackoverflow.com/questions/57063411/go-smtp-unable-to-send-email-through-gmail-getting-eof) ，里面解释了原因和解决办法。
使用 [Golang SSL SMTP Example](https://gist.github.com/chrisgillis/10888032) 这个 gist 的代码可以解决这个问题，碰巧我在用 github.com/jordan-wright/email 这个库，这个库可以提供一些发送邮件便利方法，同时 `Email#SendWithTLS` 方法完成了上面 gist 同样的工作，直接用这个方法就可以省好多代码。
下面是个完整例子

```go
import (
    "crypto/tls"
    "net/smtp"

    "github.com/jordan-wright/email"
)

func sendExample() error {
    ssl := true
    host := "example.com"
    auth := smtp.PlainAuth("", username, password, host)

    e := email.NewEmail()
    e.From = "from@example.com"
    e.To = []string{"to@example.com"}
    e.Subject = "subject"
    e.Text = []byte("test")

    if ssl {
        return e.SendWithTLS("example.com:465", auth, &tls.Config{ServerName: host})
    } else {
        return e.Send("example.com:25", auth)
    }
}
```

我的环境 go 1.13.4 。
