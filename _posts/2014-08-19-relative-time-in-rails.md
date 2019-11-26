---
layout: post
title: rails 中相对时间显示
tags: [rails, relative-time]
---

### DateHelper

rails 自带的 view helper

在 view 中直接使用

```ruby
distance_of_time_in_words
time_ago_in_words
```

但如果再 controller 或者 model 代码中直接使用，需要先 require 一下

```ruby
require 'action_view'

# 在需要的地方 include
include ActionView::Helpers::DateHelper
# 然后就可以使用 helper 方法了
```

### rails-timeago

[rails-timeago](https://github.com/jgraichen/rails-timeago)

当然这个只能再 view 中使用, 实例代码如下

```erb
<%= timeago_tag Time.zone.now, :nojs => true, :limit => 10.days.ago %>
```

相比于 rails 自带的 helper 方法，timeago 有跟多的参数可配置。
