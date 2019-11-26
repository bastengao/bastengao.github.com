---
layout: post
title: premailer 使用样式的坑
tags: [maile, mailer, style, premailer]
---

最近做邮件相关的工作，大家都知道 html 可是的 email 中不能直接引用 stylesheet 或者使用 `link` 或者 `style` 标签,
邮件服务商会删除邮件内所有 link[rel=stylesheet] 和 style 的所有内容。所以能使用的只有通过 style 属性设置。
例如 `<a style="color: blue;">example</a>`，所以就有做 email css inline 这样的事情的 gem ，比如 [premailer](https://github.com/premailer/premailer)，如果用 rails 可以使用 [premailer-rails](https://github.com/fphilipe/premailer-rails)。

我通过 premailer-rails 间接使用的 premailer 的版本是 1.8.2，希望你看到此篇博客的时候这个问题已经解决，问题跟踪参见 [issue](https://github.com/premailer/premailer/issues/228)。

下面说我遇到的坑，我有这样的文件，一个样式和一个模板。

```
app/
  assets/
    stylesheets/
      email.css
  views/
    layouts/
      email.html.erb
```

email.html.erb

```html
<head>
  ...
  <%= stylesheet_link_tag "email" %>
</head>
...
```

邮件中用到的email.css文件在生产环境 asset 编译后会产生这样的文件

```css
@charset "UTF-8";body,table,th,td{family:xxx}.work{}...
```

编译后的第一个样式不会被正常解析，只有后面的能起作用，也就是 `body,table,th,td{family:xxx}` 会被忽略，除非在 body 前加个空格，
但很明显做不到，但可以在样式文件中添加一个无用的站位的 class, 例如

```css
.nothing {
  background: transparent;
}

/* your style below */
body, table, th, td{
  family: xxx;
}
...

```

这样就能正常工作了。
