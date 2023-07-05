---
layout: post
title: 在 Go 中使用 exec 包 Cmd.StdoutPipe() 注意事项
tags: [go,exec,StdoutPipe]
published: true
---

在 Go 中执行一个外部命令，然后读取第一行输出代码一般是这样的。

```go
cmd := exec.Command("prog")
stdout, err := cmd.StdoutPipe()
if err != nil {
    log.Fatal(err)
}

err = cmd.Start()
if err != nil {
    log.Fatal(err)
}

scanner := bufio.NewScanner(stdout) // 1 读取完第一行
if scanner.Scan() {
    fmt.Println(scanner.Text())
}

err = cmd.Wait() // 2 等待命令结束
log.Printf("Command finished with error: %v", err)
```

上面代码感觉没什么问题，执行后会发现，外部命令都已经执行完毕了，代码会卡在 Wait 这里。
重新看文档后才明白问题所在，Wait 函数不仅会等待外部命令退出，还会等待之前打开的输出管道复制完成。

> func (c *Cmd) Wait() error
>
> Wait waits for the command to exit and __waits__ for any copying to stdin or copying from stdout or stderr to complete.

所以正确的用法是如果使用了 StdoutPipe 那么就要把它读完。

```diff
scanner := bufio.NewScanner(stdout) // 1 读取完第一行
if scanner.Scan() {
    fmt.Println(scanner.Text())
}

+io.Copy(io.Discard, stdout)
```
