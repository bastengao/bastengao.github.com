---
layout: post
title: 利用 GitHub 托管 Maven 库
tags: [maven, github]
last_modified: 2013-03-18 22:38
published: true
---

Maven 仓库托管方式

* [OSSRH (OSS Repository Hosting Service)](https://docs.sonatype.org/display/Repository/Sonatype+OSS+Maven+Repository+Usage+Guide)

    如果你的项目是开源项目，且希望能够被同步到 [Maven 中央库](http://search.maven.org/)，可以使用这种方式

* [SonaType Nexus](http://www.sonatype.org/nexus/)

    可以使用SonaType Nexus 搭建自己的 Maven 仓库，比较适合公司内部的商业项目

* 静态 Maven 仓库

    使用手动组织 Maven 仓库的方式，并且提供http(s)访问

***

这里主要讲如何利用 [GitHub](https://github.com)结合静态 Maven 仓库的做法。

比如有 Maven 项目`mvn-example`，同时有 GitHub repository `mvn-repository`，目录结构如下

	.
	\__ mvn-example
            \__ src
            \__ pom.xml

	\__ mvn-repository
            \__ releases
            \__ snapshots

`releases` 目录放稳定版本的构件，`snapshots` 目录放快照版本的构件。

两中方式將构件部署(deploy)到 mvn-repository

* xml 中配置 distributionManage

    修改 mvn-example/pom.xml, 添加下面配置

        <distributionManagement>
          <repository>
            <id>my-maven-repository</id>
            <name>Internal Repository</name>
            <url>${project.basedir}../mvn-repository/releases</url>
          </repository>
        </distributionManagement>

    然后执行命令

        cd mvn-example
        mvn deploy

    或者嫌配置太多，直接输下面命令

* 直接命令参数

        cd mvn-example
        mvn -DaltDeploymentRepository=snapshot-repo::default::file:../mvn-repository/releases clean deploy

如果想加入source与api，可在 clean 命令后跟上 `source:jar javadoc:jar`。 deploy 完成后, push 到 github

    cd mvn-repository
    git add releases
    git commit -m "add mvn-example"
    git push origin master

然后可以在其他依赖 mvn-example 的项目通过下面配置引用

    <repositories>
        <repository>
            <id>your-mvn-repository</id>
            <url>https://raw.github.com/yourGitHubId/mvn-repository/master/releases</url>
        </repository>
    </repositories>

    <dependencies>
        <dependency>
            <groupId>yourGroupId</groupId>
            <artifactId>mvn-example</artifactId>
            <version>${version}</version>
        </dependency>
        <!-- ... -->
    </dependencies>

参见[示例](https://github.com/bastengao/mvn-repository)

参考：

* [Hosting Maven Repos on Github](http://cemerick.com/2010/08/24/hosting-maven-repos-on-github/)
* [Use github as maven remote repository](http://blog.rueedlinger.ch/2012/09/use-github-as-maven-remote-repository/)
