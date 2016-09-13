---
layout: post
title: 两则 rake 小技巧
tags: [rails,rake]
---

## 技巧1：给rake任务传递数组参数

首先 rake 是不支持传递数组参数的，但是我们可以通过将多个参数按空格拆分得到数组。

```
task :i_need_array, [:array] do |t, args|
  # 按空格拆分
  array = args.array.split(' ')
  ...
end

rake "i_need_array[1 2 3 4]" # 注意执行带参数的任务时需要给任务加双引号
```

## 技巧2：在 rake 任务里调用其他任务

```
task :first do
  puts 'first'
end

# 有两个参数的任务, 同时会先执行 first
task :second, [:a, :b] => :first do |t, args|
  puts 'second'
  puts args
end

# 调用其他任务，同时传递参数
task :foo do
  # 相当于 rake "second[1,2]", second 的前置任务 first 也会被先调用
  Rake::Task['second'].invoke(1, 2)

  # 只运行 second 本身，不会运行 first 任务
  Rake::Task['second'].execute(Rake::TaskArguments.new([:a, :b], [1, 2]))
end
```
