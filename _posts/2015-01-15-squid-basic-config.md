---
layout: post
title: squid 3.3 常用配置
tags: [squid3, squid]
---

接上篇博客，安装完 squid 后这里说一下常用的配置。

### ssl

默认 http_port 3128 已经可以代理 https 的网站, 如果你需要对https的网站进行一些缓存处理, 比如对图片进行缓存就需要配置 ssl 代理。

生成证书

```
sudo mkdir /usr/share/ssl-cert/
cd /usr/share/ssl-cert/
openssl req -new -newkey rsa:1024 -days 365 -nodes -x509 -keyout squid3.pem -out squid3.pem
```

修改 /etc/squid3/squid.conf

```
http_port 3138 ssl-bump cert=/usr/share/ssl-cert/squid3.pem key=/usr/share/ssl-cert/squid3.pem
always_direct allow all
ssl_bump server-first all
```


### 匿名代理


默认配置会泄露内网ip，如果你不想让人知道你使用代理，可以添加下面配置。

```
forwarded_for off
request_header_access Allow allow all
request_header_access Authorization allow all
request_header_access WWW-Authenticate allow all
request_header_access Proxy-Authorization allow all
request_header_access Proxy-Authenticate allow all
request_header_access Cache-Control allow all
request_header_access Content-Encoding allow all
request_header_access Content-Length allow all
request_header_access Content-Type allow all
request_header_access Date allow all
request_header_access Expires allow all
request_header_access Host allow all
request_header_access If-Modified-Since allow all
request_header_access Last-Modified allow all
request_header_access Location allow all
request_header_access Pragma allow all
request_header_access Accept allow all
request_header_access Accept-Charset allow all
request_header_access Accept-Encoding allow all
request_header_access Accept-Language allow all
request_header_access Content-Language allow all
request_header_access Mime-Version allow all
request_header_access Retry-After allow all
request_header_access Title allow all
request_header_access Connection allow all
request_header_access Proxy-Connection allow all
request_header_access User-Agent allow all
request_header_access Cookie allow all
request_header_access All deny all
```

### 缓存

```
# 缓存内存大小，默认 256m
cache_mem 128m

# 缓存存储的目录和大小 512M, 16 和 256 分别是一级目录和二级目录的个数
cache_dir ufs /var/cache/squid 512 16 256
```

如果配置了 cache_dir, 在启动前别忘了初始化目录 `sudo squid -z`

acl

```
# 匹配路径中图片结尾的请求
acl images urlpath_regex -i \.(gif|jpg|jpeg|png)$
# 匹配特定域名的请求
acl google_analytics dstdomain www.google-analytics.com

# 匹配路径是 xxx.js  和 xxx.js?v2015 的请求
acl js urlpath_regex -i \.js$
acl js urlpath_regex -i \.js\?

# 拒绝缓存 ga 的内容
cache deny google_analytics
# 缓存图片内容
cache allow images
# 缓存 js
cache allow js
# 剩下的都不缓存
cache deny all

# cache 的内容同时要配置 refresh_pattern
# 图片一天（1440分钟）后失效
refresh_pattern -i \.(gif|jpg|jpeg|png)$ 1440 20% 1440
# js
refresh_pattern -i \.(js)$ 1440 20% 1440
refresh_pattern -i \.(js)\? 1440 20% 1440
```

### DNS

显式指定 DNS server

```
dns_nameservers 8.8.8.8
```
