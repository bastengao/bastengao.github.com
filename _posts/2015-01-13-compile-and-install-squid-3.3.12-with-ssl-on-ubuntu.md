---
layout: post
title: 在 Ubuntu 12 上安装带 SSL 的 squid 3.3.12
tags: [squid3, ssl, ubuntu]
---

如果是 ubuntu 13/14 版本，可以参考这个[安装教程](http://www.cyborgworkshop.org/2013/12/12/installing-squid-3-3-8-and-squidguard-on-ubuntu-13-10-with-transparent-http-and-https/),
因为我的系统是 ubuntu 12.04 apt-get 能安装的最高版本是 squid 3.1.19，但是我需要用到 TSL 1.1 的支持，
squid 3.1.19 只支持到 (TSL 1.0)[http://www.squid-cache.org/Versions/v3/3.1/cfgman/sslproxy_options.html],
所以只能安装更高版本的 squid.

```shell
# 安装 squid 的依赖
apt-get update
apt-get install devscripts build-essential libssl-dev gawk m4 gcc-multilib
apt-get build-dep squid3

# 下载解压
wget http://www.squid-cache.org/Versions/v3/3.3/squid-3.3.12.tar.gz
tar zxf squid-3.3.12.tar.gz
cd squid-3.3.12
```

```
./configure \
--prefix=/usr \
--localstatedir=/var \
--libexecdir=/usr/lib/squid3 \
--srcdir=. \
--datadir=/usr/share/squid3 \
--sysconfdir=/etc/squid3 \
--with-default-user=proxy \
--with-logdir=/var/log/squid3 \
--with-pidfile=/var/run/squid3.pid \
--with-filedescriptors=65536 \
--with-large-files \
--enable-icmp \
--enable-async-io=8 \
--enable-delay-pools \
--enable-htpc \
--enable-cache-digests \
--enable-forw-via-db \
--enable-ssl \
--enable-ssl-crtd \
--enable-linux-netfilter \
--enable-gnuregex \
--enable-follow-x-forwarded-for \
--enable-snmp \
--enable-carp \
--enable-err-language=English
```

make 时间比较长，泡杯茶，休息一下

```
make
sudo make install
```


添加 proxy 用户和 proxy 组，并修改文件夹的 owner

```
sudo addgroup proxy
sudo adduser proxy proxy
sudo chown proxy:proxy /var/log/squid3
sudo chown proxy:proxy /var/cache/squid
```

这个似乎是给 `http_port` 的 `generate-host-certificates` 参数用的

```
sudo /usr/lib/squid3/ssl_crtd -c -s /var/lib/ssl_db
sudo chown -R proxy:proxy /var/lib/ssl_db
```

```
sudo mkdir /usr/share/ssl-cert/
cd /usr/share/ssl-cert/
openssl req -new -newkey rsa:1024 -days 365 -nodes -x509 -keyout squid3.pem -out squid3.pem
```

调整配置 `/etc/squid3.conf`, 如果你还不知道需要修改什么可以看我的下一篇主要讲配置的博客。

默认 http_port 3128 已经可以代理 https 的网站, 如果你需要对https的网站进行一些缓存处理, 比如对图片进行缓存就需要下面三行配置

```
http_port 3138 ssl-bump cert=/usr/share/ssl-cert/squid3.pem key=/usr/share/ssl-cert/squid3.pem
always_direct allow all
ssl_bump server-first all
```

```
# 如果配置了 cache_dir , 启动前需要初始化话缓存目录
sudo squid -z

# 检查配置文件
sudo squid -k parse

# 启动
sudo squid -YC -f /etc/squid3/squid.conf

# 重新加载配置
sudo kill -HUP `cat /var/run/squid3.pid`
```

测试前可能需要把一下squid.conf 中的 `http_access deny all` 改成 `http_access allow all`，
基本上就算安装完成了，可以配置浏览器的代理进行一下测试。
http 代理的端口是 3128, ssl 代理的端口是 3138，如何配置Firefox代理可以[看这里](http://freeproxylist2014.blogspot.com/2014/01/how-to-enter-proxy-settings-in-firefox.html)。
