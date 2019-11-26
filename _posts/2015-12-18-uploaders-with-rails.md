---
layout: post
title: rails上传组件那些事
tags: [rails,carrierwave, paperclip, dragonfly, refile]
published: false
---

### carrierwave

说到 rails 上传文件，大家基本上可以想到老牌的 carrierwave, 不过他确实太老了，老的都懒得发部新版本了
，最新版本都是[2014年2月](https://github.com/carrierwaveuploader/carrierwave/releases)的事了。但 carrierwave 的插件和文档还挺丰富。

看 carrierwave 的[上手例子](https://github.com/carrierwaveuploader/carrierwave#getting-started)

```
rails generate uploader Avatar
```

```ruby
# app/uploaders/avatar_uploader.rb
class AvatarUploader < CarrierWave::Uploader::Base
  storage :file
end

# app/models/user.rb
class User < ActiveRecord::Base
  mount_uploader :avatar, AvatarUploader
end
```

有了上面代码，基本上就实现了给用户上传头像的功能。

接下来可以对头像进行下处理，比如裁剪成方形。

```ruby
# app/uploaders/avatar_uploader.rb
class AvatarUploader < CarrierWave::Uploader::Base
  storage :file

  version :thumb do
    process resize_to_fill: [200,200]
  end
end

```erb
# app/users/show.html.erb
<%= image_tag @user.avatar.thumb %>
```

carrierwave 目前这种工作方式，基本上可以满足大部分需求。单独的 uploader 对上传文件进行配置，同时定义不同版本的图片，代码结构比较清晰。但坏处也显而易见，uploader 里定义了那些版本的图片，view 就只能用这些尺寸的版本，如果 view 需要新的版本后者图片的尺寸是动态的，那就没没辙了。

### paperclip

carrierwave one modle differenct uploaders

paperclip auto_on_fly

dragonfly

refile
