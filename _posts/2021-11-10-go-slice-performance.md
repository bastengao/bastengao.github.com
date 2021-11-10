---
layout: post
title: Go slice 不同使用方式性能测试
tags: [go,slice,performance]
published: true
---

写 Go 必然要经常用到 slice, 大家一般初始化 slice 无非是下面几种方式.

1. `var s []int`
2. `s := []int{}`
3. `s := make([]int, 0)` (这种和上面效果一样，但不推荐，推荐理由)
4. `s := make([]int, n)`

如果是构造一个空的 slice 推荐使用第一种写法，
推荐理由参考 [Uber Go Style Guide](https://github.com/uber-go/guide/blob/master/style.md#local-variable-declarations)
和 [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments#declaring-empty-slices). 初始化完后，让我们来使用 slice, 实现 0-9 十个数都加到 slice.

```go
var s []int
for i := 0; i < 10; i++ {
    s = append(s, i)
}
```

```go
s := make([]int, 10)
for i := 0; i < 10; i++ {
    s[i] = i
}
```

盲猜应该是第二种写法效率高并且省内存，因为 slice 空间初始化的时候就一次分配好了。不过还是要用实际测试数据说话，上 [benchmark](https://gist.github.com/bastengao/397a3f3e8c0d30217b32d87afebb36ff).

```go
package main

import "testing"

func BenchmarkInitLen(b *testing.B) {
    n := b.N
    for i := 0; i < n; i++ {
        a := make([]int64, n)
        for j := 0; j < n; j++ {
            a[j] = int64(j)
        }
    }
}

func BenchmarkInitCap(b *testing.B) {
    n := b.N
    for i := 0; i < n; i++ {
        a := make([]int64, 0, n)
        for j := 0; j < n; j++ {
            a = append(a, int64(j))
        }
    }
}

func BenchmarkZero(b *testing.B) {
    n := b.N
    for i := 0; i < n; i++ {
        var a []int64
        for j := 0; j < n; j++ {
            a = append(a, int64(j))
        }
    }
}

func BenchmarkInitZeroLen(b *testing.B) {
    n := b.N
    for i := 0; i < n; i++ {
    a := make([]int64, 0)
        for j := 0; j < n; j++ {
            a = append(a, int64(j))
        }
    }
}
```

测试设备信息:

```
MacBook Pro (13-inch, M1, 2020) 
OS: macOS Monterey
CPU: Apple M1
Mem: 16 GB
Go: 1.7.3
```

测试结果:

```
BenchmarkInitLen
BenchmarkInitLen-8       	  131744	     68970 ns/op	 1056771 B/op	       1 allocs/op
BenchmarkInitCap
BenchmarkInitCap-8       	  189924	     96863 ns/op	 1523716 B/op	       1 allocs/op
BenchmarkZero
BenchmarkZero-8          	   49658	    120226 ns/op	 2303233 B/op	      27 allocs/op
BenchmarkInitZeroLen
BenchmarkInitZeroLen-8   	   49298	    120323 ns/op	 2303233 B/op	      27 allocs/op
```

可以看到 BenchmarkInitLen 测试结果是最好的，执行速度和内存非配都是最优的，执行耗时是最差的 57.3%，内存使用是最差的 45.9%。
所以当我们知道 slice 明确长度的，推荐使用 `s := make([]int, len)` 来初始化，然后通过索引来赋值。

上篇博客还在三月，转眼就要到年末了，记得上次写博客还是上次，真是时光荏苒，写一篇比较水的博客充个数，要不然 2021 年就只有一篇博客了。
