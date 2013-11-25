---
layout: post
title: maven webapp 读取代码版本号
tags: [maven, scm-version]
last_modified: 2013-11-25 22:15
---

一直以来在项目部署后出现问题，很难知道当初打包时候的版本号，除非人肉记录各环境的版本号。如果你的项目是 maven 项目，可以通过以下方式解决。

1. 利用 [buildnumber-maven-plugin](http://mojo.codehaus.org/buildnumber-maven-plugin) 获取 scm(如 svn 或者 git) 版本号，
会输出 `${buildNumber}` 在 pom.xml 上下文里，以备后面使用

    ```xml
    <build>
        <plugins>
            <plugin>
                <groupId>org.codehaus.mojo</groupId>
                <artifactId>buildnumber-maven-plugin</artifactId>
                <version>1.2</version>
                <executions>
                    <execution>
                        <phase>validate</phase>
                        <goals>
                            <goal>create</goal>
                        </goals>
                    </execution>
                </executions>
                <configuration>
                    <doCheck>true</doCheck>
                    <doUpdate>true</doUpdate>
                </configuration>
            </plugin>
        </plugins>
    </build>
     ```

2. 利用 maven-war-plugin 将版本号写入 `MANIFEST.MF` 文件中

    ```xml
    <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <configuration>
            <archive>
                <manifest>
                    <addDefaultImplementationEntries>true</addDefaultImplementationEntries>
                </manifest>
                <manifestEntries>
                    <App-Version>${project.version}</App-Version>
                    <App-Svn-Revision>${buildNumber}</App-Svn>
                </manifestEntries>
            </archive>
        </configuration>
    </plugin>
    ```

3. 通过 [jcabi-manifests](http://www.jcabi.com/jcabi-manifests/) 读取版本号

    ```java
    // 因为项目是 web 项目，所以需要这行代码
    Manifests.append(servletContext);

    String revision = Manifests.read("App-Svn-Revision");
    ```

参考:

* http://mojo.codehaus.org/buildnumber-maven-plugin/usage.html
* http://www.jcabi.com/jcabi-manifests/versioning.html
* http://www.jcabi.com/jcabi-manifests/servlets.html