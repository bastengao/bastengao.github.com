---
layout: post
title: 子目录下访问Rails
tags: [rails, relative-url]
---

一般 Rails 项目部署完都是通过根路径去访问，例如访问 `http://example.com/` 会映射到 `root_url`.
如果一个 server 上部署多个 Rails app 可以通过 nginx 的 `server_name` 来区分,
例如下面nginx配置。

```
server {
  listen: 80;
  server_name app1.example.com;
  root /user/wwwuser/app1/public;
  ...
}

server {
  listen: 80;
  server_name app2.example.com;
  root /user/wwwuser/app2/public;
  ...
}
```

这样访问 `http://app1.example.com` 会映射到 app1 的 `root_rul`, 以此类推。
开发环境中大家测试多域名情况，推荐大家使用 [xip](http://xip.io/) 服务。

但如果资源比较紧张，两个 Rails app 没办法通过两个域名分区，还有一种办法可以通过子目录来区分。
大概效果是这样的 `http://example.com/` 的请求会映射到 app1, `http://example.com/app2/` 的请求会映射到 app2。

下面介绍具体步骤：

### step 1

app2 添加配置, application.rb 还是 enironments/\*.rb 自己视情况而定。
```ruby
config.relative_url_root = '/app2'
```

### step 2

修改 config.ru
```ruby
map App2::Application.config.relative_url_root || "/" do
  run Rails.application
end
```

### step 3

调整 nginx 配置, 这块比较麻烦，主要是一个 server 下要配置两个代理。

```nginx
upstream app1 {
  server unix:///home/wwwuser/app1/tmp/sockets/puma.sock fail_timeout=0;
}

upstream app2 {
  server unix:///home/wwwuser/app2/tmp/sockets/puma.sock fail_timeout=0;
}

server {
  listen 80;
  server_name  example.com;

  root /home/wwwuser/app1/current/public;

  # 关键靠这行, 要写在前面
  location /app2/ {
     try_files $uri/index.html $uri @app2;
  }

  try_files $uri/index.html $uri @app1;

  location @app1 {
    proxy_redirect     off;
    proxy_set_header   Host $host;

    proxy_set_header   X-Forwarded-Host $host;
    proxy_set_header   X-Forwarded-Server $host;

    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_buffering    on;
    proxy_pass         http://app1;
  }

  location @app2 {
    proxy_redirect     off;
    proxy_set_header   Host $host;

    proxy_set_header   X-Forwarded-Host $host;
    proxy_set_header   X-Forwarded-Server $host;

    proxy_set_header   X-Real-IP        $remote_addr;
    proxy_set_header   X-Forwarded-For  $proxy_add_x_forwarded_for;
    proxy_buffering    on;
    proxy_pass         http://app2;
  }
}
```

### step 4

最后还有个问题是 nginx 的 root 只能指定一个，没办法同时指定 app1 和 app2，所以访问 app2 的 assets
的时候，得靠 app2 Rails自己服务。所以需要给 app2 添加环境变量 `ENV[RAILS_SERVE_STATIC_FILES] = true`
或者配置 `config.serve_static_files = true`.


参考资料：
* http://guides.rubyonrails.org/configuring.html#deploy-to-a-subdirectory-relative-url-root
* http://stevesaarinen.com/blog/2013/05/16/mounting-rails-in-a-subdirectory-with-nginx-and-unicorn/
