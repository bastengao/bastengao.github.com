---
layout: post
title: java中将异步转化为同步
tags: [java, sync, async]
published: false
---

从大家学习第一门程序语言起，代码基本都是顺序执行的。这点毋庸置疑，把大象关进冰箱也是顺序执行。
但是计算机的硬件性能在提升，相应地软件能够为了充分利用cpu资源，也将是多线程的。如果程序还是单线程，顺序执行恐怕你现在还看不到我的这篇博客。

一旦说道多线程就会有异步，同步，线程安全这些东西。关于线程安全，推荐[Java并发编程实战](http://book.douban.com/subject/10484692/)这本书，这次主要说如何将异步转化为同步. 

写过 javascript 人都知道 javascript 中是没有 sleep 方法的，就是 javascript 里所有的处理都是异步的，sleep 要通过 setTimeout 来实现。  

```javascript
// sleep 5000 millis
setTimeout(function(){
  console.log("i will back after 5000 millis.")
}, 5000);
```

上面代码中的匿名函数不是马上执行的，而是 5 秒后，系统调用。包括大家平时用的 ajax , 同样也是异步操作。

不像 javascript，java 则需要 `Thread` 来并发执行。通常 web 服务器或者 tcp/udp 服务，如果用同步的 i/o api，都需要使用多线程提高系统的吞吐。
有时候为了效率会将同步的业务拆成异步的，例如用户注册，同时发送验证邮件，但发送邮件可能会比较耗时，这样用户会有长时间的等待，为了提升用户体验，我们可以将发送邮件放在后台线程中去执行。但是多线程会打乱我们平时认为代码顺序执行的习惯，所以写出来的代码会更难理解和测试。

同样我们有时候却需要将异步转化为同步，或者看起来是同步。例如需要等待另一个异步操作的结果。

现在我们步入正题，可以通过以下方式将异步转化为同步。

### synchronized keyword
```java
final Object lock = new Object();

Thread asyncTask = new Thread(){

    @Override
    public void run(){ 
        // do something 
        synchronized(lock) {
            lock.notify();
        }
    }
};
asyncTask.start();

synchronized(lock) {
    lock.wait();
}
```

### Lock

`Lock` 相比 `synchronized` 关键字性能会略胜一筹。

```java
final Lock lock = new ReentrenLog();
final Condition condition = lock.newCondition();

Thread asyncTask = new Thread(){

    @Override
    public void run(){ 
        // do something 
        try {
            lock.tryLock();
            condition.signal();
        } finally {
            lock.unlock();
        }
    }
};

try {
    lock.tryLock();
    condition.await();
} finally {
    lock.unlock();
}
```

### lock until
除了 `Lock`, java 还提供了一些锁相关的工具类，例如 `CountDownLatch` 方便我们使用。

```java
CountDownLatch latch = new CountDownLatch(2);

Thread asyncTask = new Thread(){

    @Override
    public void run(){ 
        // do something 
        latch.countDown();
    }
};
asyncTask.start();

latch.countDown();
```


### jdeferred
[jdeferred](TODO github) 是一个类似于 [jQuery.Deferred](TODO jquery api)(可参考 [阮一峰的博客](TODO)) 的Java实现。 我简单地看了他的源代码，是基于 `synchronzed` 来实现的，用他主要还是因为他的接口简单(与 jQuery.Deferred 相似)，无他。
