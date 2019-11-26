---
layout: post
title: 使用非默认端口对 Rails 反向代理要注意的地方
tags: [rails, nginx, proxy, reverse-proxy]
---

缘起是最近新部署的环境中 nginx 对 rails 进行反向代理使用的是不默认端口 80, 而是其他端口。
nginx 使用 http， 端口配置的是 81, 然后导致项目中 redirect_to 都重定向到 80 端口，
按道理应该是重定向到 81 端口，比如 `http://server:81/hello` 会错误的变成 `http://server/hello` 。

为什么不设置成 80 端口？我也想，但没办法。

最后查看 rails 和 rack 相关代码，发现 `request` 的 host、port 和 host_with_port 方法都优先使用 `X-Forwarded-Host`。
接着找到关于 Forwarded Host 的[规范](http://tools.ietf.org/html/rfc7239#section-5.3) 和 Host 的[规范](http://tools.ietf.org/html/rfc7230#section-5.4)，原来 Forwarded Host 的语法和 Host 是一致的，
都是 `Host = uri-host [ ":" port ] ;`，也就是 port 是可选的，如果没有指定则默认是 80(http) 或者 443(https)。

接着查看 nginx 配置中 `Host` 和 `X-Forwarded-Host` 并没有配置端口，加上端口配置后，重定向问题解决了。

```nginx
proxy_set_header Host $host
proxy_set_header X-Forwarded-Host $host
```

这里给出 nginx 完整配置，方便大家参看。

```nginx
server {
  listen 81;
  server_name  127.0.0.1;

  root /rails_project/public;

  location ~* ^(/assets|/favicon.ico) {
    access_log        off;
    expires           max;
  }

  location / {
    proxy_redirect     off;
    proxy_set_header   Host $host:$server_port;
    proxy_set_header   X-Forwarded-Host $host:$server_port;
    proxy_set_header   X-Forwarded-Port $server_port;
    proxy_set_header   X-Forwarded-Server $host;
    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_buffering    on;
    proxy_pass         http://127.0.0.1:3000;
  }
}
```

当然也能通过在 environment 中配置 `config.action_controller.default_url_options = { port: 81 }`
解决部分问题，url hepler 只能使用 xxx\_url，xxx\_path 依然是错误的端口。一些 gem 比如 devise，
在重定向中大量使用 xxx_path，也就不能正常工作了。
