---
layout: post
title: 利用 GitHub 托管 Maven 库
tags: [maven, github]
last_modified: 2013-03-16 13:08
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

两中方式將构件部署(deploy)到mvn-repository

* xml 中配置 distributionManage

	<distributionManagement>
	  <repository>
	    <id>my-maven-repository</id>
	    <name>Internal Repository</name>
	    <url>${project.baseDir../mvn-repository/releases}</url>
	  </repository>
	</distributionManagement>


    mvn deploy

* 直接命令参数

	 mvn -DaltDeploymentRepository=snapshot-repo::default::file:../../cemerick-mvn-repo/snapshots clean deploy

[示例](https://github.com/bastengao/mvn-repository)

参考：

* [Hosting Maven Repos on Github](http://cemerick.com/2010/08/24/hosting-maven-repos-on-github/)
* [Use github as maven remote repository](http://blog.rueedlinger.ch/2012/09/use-github-as-maven-remote-repository/)
