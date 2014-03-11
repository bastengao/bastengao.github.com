---
layout: post
title: 通过 logstash 监控日志并发送邮件
tags: [logstash, log, email]
---

最近系统里总有诡异的设备日志, 时隐时现，看到他出现时它已经消失了, 跟我们玩捉迷藏。
这时候时候要请出神奇的 logstash。

[logstash](http://logstash.net/) 是个日志监控神奇，有非常多的 input、filter 和 output。
下载 logstash 是一个 jar 包，其实 logstash 是用 ruby 写的，但通过 jruby 运行。
可能是借助于 java 的效率与跨平台性。

运行 `java -jar logstash-xxxx.jar agent -f my.conf -- web`,  启动 logstash 同时还有内置的 web ui, 访问端口默认 9292。
其中 **my.conf** 是配置文件。

配置 input ，通过 file 来指定监控我们要监控的日志文件。

```
input {
    file {
		path => ["/path/to/log"]
    }
}
```

配置 filter，通过 grep 来做过滤，不匹配的日志都会扔掉(当然也可以通过 dropDown => false 来保留)。

```
filter {
    grep {
        match => ["message", "test"]
    }
}
```

配置 output, 最常用的就是 stdout 和 elasticsearch。再通过强大的 logstash 提供的 web UI 查看，酷毙了。

```
output {
	stdout {}
	elasticsearch { embedded => true }
}
```

但是**还差一步**，我不想眼睛一直盯着浏览器一直看，还有更重要的事情做。我想有匹配的日志出现后，能通过 IM 或者 email 通知我，那就好多了。满足我需求的有 irc, email, hipchat (我只想到这么多)。经过我多次尝试后，以上三种都没有成功，百般无奈之下我想到了一种曲线救国的方式。
exec -> curl -> mailgun http api，就是通过 exec 执行系统命令 curl，通过 curl 来执行 [mailgun http api](http://documentation.mailgun.com/quickstart.html#sending-messages) 来发送邮件。后来想想 http 插件似乎也是可以的，等下次有机会试试。

```
output {
    # 之前的配置省略
    exec {
        # curl 参数参见 mailgun api 
        command => "curl xxx"
    }
}
```
