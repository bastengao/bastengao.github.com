---
layout: post
title: django 国际化使用中文遇到的小坑
tags: [django,translation,i18n]
---

如果一点都不了解先看 django i18n 机制的[官方文档](https://docs.djangoproject.com/en/1.10/topics/i18n/translation/)，这个文档比较详细的介绍了 django i18n 的流程和工作机制。

## 修改项目默认语言

先直接上手，修改项目默认语言 `settings.py` 找到 `LANGUAGE_CODE` 改为 `zh-cn`。
```python
# 默认是 LANGUAGE_CODE = 'en-us'
LANGUAGE_CODE = 'zh-cn'
```

## 创建本地翻译文件

在应用目录创建文件 `locale/zh-cn/LC_MESSAGES/django.po`, 记住一定要是 utf-8 格式。

django.po 文件的格式很简单, 例如下面。

```
# 这是注释
msgid  "hello"
msgstr "你好"

msgid  "world"
msgid  "世界"
```

项目中使用

```python
from django.utils.translation import ugettext_lazy as _
message = _('hello')
```

注意每次 django.po 文件改动后，需要执行 `django-admin compilemessages` 编译 po 生成 django.mo 文件。

如果 `django-admin compilemessages` 出错下面错误。
> CommandError: Can't find msgfmt. Make sure you have GNU gettext tools 0.15 or newer installed.

苹果系统(10.12.1)的解决办法，其他系统自行搜索。
```
brew install gettext
brew link gettext --force
```

## 解决请求访问问题

访问 django 是页面可能出现下面异常。
> 'ascii' codec can't decode byte xxx

如果遇到这个问题需要在 django.po 文件加入下面内容, [问题参考](http://stackoverflow.com/questions/19294898/django-translation-cant-decode)。

```
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
```

## 翻译默认表单验证错误消息

```python
# 常规的用法
message = ngettext_lazy("This field is required.")
# 单复数用法
message = ungettext_lazy(
    'Ensure this value has at least %(limit_value)d character (it has %(show_value)d).',
    'Ensure this value has at least %(limit_value)d characters (it has %(show_value)d).',
    'limit_value')
```

```
msgid  "This field is required."
msgstr "必须填写"

msgid         "Ensure this value has at least %(limit_value)d character (it has %(show_value)d)."
msgid_plural  "Ensure this value has at least %(limit_value)d characters (it has %(show_value)d)."
msgstr[0] "至少输入%(limit_value)d个字符，但是只有%(show_value)d"
msgstr[1] "至少输入%(limit_value)d个字符，但是只有%(show_value)d"
```

顺便吐槽一句，django 竟然找不到已经翻译好的各国语言文件，令人发指。rails 只需要装个  rails-i18n gem 就好了。
