---
layout: post
title: machinery 同步获取任务结果的小坑
tags: [go,machinery]
---

下面是 [machinery](https://github.com/RichardKnop/machinery) 获取任务执行结果的[示例代码](https://github.com/RichardKnop/machinery#keeping-results)

```go
results, err := asyncResult.Get(time.Duration(time.Millisecond * 5))
if err != nil {
  // getting result of a task failed
  // do something with the error
}
for _, result := range results {
  fmt.Println(result.Interface())
}
```

上面 `Get(sleepDuration)` 会阻塞调用一直尝试到获取任务结果为止。当任务量巨大的时候，这会导致大量的 redis 查询操作，同时消耗大量的本地 socket 资源，更严重的情况会把本地 socket 资源耗尽。

还好除了同步获取任务结果的方式，还有异步的方式。[Signature](https://github.com/RichardKnop/machinery#signatures) 可以设置 `OnSuccess: []*Signature` 和 `OnError: []*Signature` 字段，当任务完成后会执行设置的回调任务。这样就完美解决了大量轮询的情况。
