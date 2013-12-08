---
layout: post
title: 在 maven 项目中使用 sigar
tags: [maven, sigar]
published: true
last_modified: 2013-12-08 11:51
---

最近做监测方面的工作，需要获取主机信息，如内存，CPU，网络情况等等。[sigar](http://www.hyperic.com/products/sigar) 正好能做这样的事情, [项目地址](https://github.com/hyperic/sigar)。

sigar 的使用我就不多说了，这里主要说如何在 maven 项目中使用。

### 1. 项目中添加依赖

```xml
<dependency>
    <groupId>org.fusesource</groupId>
    <artifactId>sigar</artifactId>
    <version>1.6.4</version>
</dependency>
```

### 2. 添加sigar本地库到 java.library.path

sigar API 依赖本地库文件工作的，内部通过`java.library.path`加载本地库文件。
本地库文件根据不同的平台，有下面这些文件。

```
libsigar-amd64-freebsd-6.so
libsigar-amd64-linux.so
libsigar-amd64-solaris.so
libsigar-ia64-hpux-11.sl
libsigar-ia64-linux.so
libsigar-pa-hpux-11.sl
libsigar-ppc-aix-5.so
libsigar-ppc-linux.so
libsigar-ppc64-aix-5.so
libsigar-ppc64-linux.so
libsigar-s390x-linux.so
libsigar-sparc-solaris.so
libsigar-sparc64-solaris.so
libsigar-universal-macosx.dylib
libsigar-universal64-macosx.dylib
libsigar-x86-freebsd-5.so
libsigar-x86-freebsd-6.so
libsigar-x86-linux.so
libsigar-x86-solaris.so
sigar-amd64-winnt.dll
sigar-x86-winnt.dll
```

我试着将这些文件放在classpath下（src/main/resources）或者通过 `sigar-dist` 依赖的方式加载都以失败告终。网上有篇[博客](http://arviarya.wordpress.com/2013/09/22/sigar-access-operating-system-and-hardware-level-information/) 讲如何通过解压 `sigar-dist` 依赖的方式，来组织 `java.library.path`，但是整个配置太过复杂。

最终我想到个办法是:

1. 将 sigar 的本地库文件放在 `src/main/resources/sigar` 目录下，还是的 classpath 下
2. 通过 java api 读取 `sigar` 路径，并将路径追加到 `java.library.path`中。 

代码如下，详见[gists](https://gist.github.com/bastengao/7853455#file-sigarutil-java)。

```java
import com.google.common.io.Resources;
import org.hyperic.sigar.Sigar;

import java.io.File;
import java.io.IOException;

/**
 * @author gaohui
 * @date 13-11-27 19:43
 */
public class SigarUtil {

    public final static Sigar sigar = initSigar();

    private static Sigar initSigar() {
        try {
            String file = Resources.getResource("sigar/.sigar_shellrc").getFile();
            File classPath = new File(file).getParentFile();

            String path = System.getProperty("java.library.path");
            if (OsCheck.getOperatingSystemType() == OsCheck.OSType.Windows) {
                path += ";" + classPath.getCanonicalPath();
            } else {
                path += ":" + classPath.getCanonicalPath();
            }
            System.setProperty("java.library.path", path);

            return new Sigar();
        } catch (Exception e) {
            return null;
        }
    }
}
```
