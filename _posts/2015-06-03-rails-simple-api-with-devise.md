---
layout: post
title: 结合 devise 编写 rails api
tags: [devise, auth, rails, api, simple_token_authentication]
---

众所周知使用 Rails 做认证， devise 是不二的选择，历时悠久，文档全面和扩展丰富。
也许你早已经把 devise 集成到项目里面了，但如果你需要 rails 为你的移动应用提供 api 时，
很可能需要结合 devise 来做认证。


### Step 1: 覆盖 devise 默认的登录 controller

devise 默认的认证请求是 `POST /users/sign_in` 但他并不支持 format 为 json 的返回结果。
所以我们第一步需要让 devise 支持 json 的返回结果。

参考 [configuring-controllers](https://github.com/plataformatec/devise#configuring-controllers)，添加 `app/controllers/users/sessions_controller.rb` 文件。

```ruby
class Users::SessionsController < Devise::SessionsController
  # 默认只支持 html, 添加 json
  respond_to :html, :json

  # 如果 ApplicationController 设置了 'protect_from_forgery with: :exception',
  # 这里需要忽略检查
  skip_before_action :verify_authenticity_token
end
```

然后修改 routes.rb，指定自定义的 controller。

```ruby
devise_for :users, controllers: { sessions: "users/sessions" }
```

此时就可以 POST 访问 `/users/sign_in.json`, 应该能返回 json 格式的结果。
如果认证成功，将返回对应的 user(如果你默认的 resource 是 User)。

```
curl -X POST --data 'user[email]=abc@123.com&user[password]=secret' http://locahost:3000/users/sign_in.json
# { "id": 123, "email": "abc@123.com", "authentication_token": "a1b2c3", ... }
```

### Step 2: API 通过 token 认证

默认 web 登录后，通过 cookie(session) 来记录用户是否登录。 不能指望 API 调用也用传 cookie，
可以通过在 header 中传递认证后的 token, 来验证用户是否是合法的。

可以使用 [simple_token_authentication](https://github.com/gonzalo-bulnes/simple_token_authentication) gem 来完成 token 认证。
安装完成后， 配置 `ApplicationController` 只需要 API 调用才使用 token 认证，正常的页面访问不需要 token 认证。

```ruby
class ApplicationController < ActionController::Base
  protect_from_forgery with: :exception

  acts_as_token_authentication_handler_for User, unless: lambda { |controller| controller.request.format.html? }

  before_action :authenticate_user!
  ...
end
```

安装配置完成后，我们就可以使用 token 来认证 API 了。simple_token_authentication 会为每个用户分配一个 authentication_token，
在第一步中通过 devise 认证成功后，客户端保存返回的用户 token，然后在接下来的 API 调用中就可以使用该 token 来通过认证。

```
curl -H "X-User-Email:abc@123.com" -H "X-User-Token:a1b2c3" http://localhost:3000/my_api
```

### Step 3: 解决跨域调用(CORS)

如果是使用纯 API 的方式调用，比如 curl 或者 rest-client 上面两个步骤就已经可以正常工作了。
如果是在跨域环境下调用 API， 浏览器一般都会提示 CORS 错误。例如开发 ionic 时，就会出现。

跨域问题可以通过安装 [rack-cors](https://github.com/cyu/rack-cors) 来解决。

最后分享 ruby-china 上一个精华帖 [使用 Rails 构建 API 实践](https://ruby-china.org/topics/25822)，供大家参考。
