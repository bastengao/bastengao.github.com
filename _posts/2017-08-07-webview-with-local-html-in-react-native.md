---
layout: post
title: React Native 中使用 WebView 加载本地 html
tags: [react-native,webview]
---

ReactNative 中的 [WebView](https://facebook.github.io/react-native/docs/webview.html) 可以加载一个外部网页，例如下面官网的例子

```js
import React, { Component } from 'react';
import { WebView } from 'react-native';

class MyWeb extends Component {
  render() {
    let source = { uri: 'https://github.com/facebook/react-native' }
    let style = { marginTop: 20 }
    return (
      <WebView
        source={source}
        style={style}
      />
    );
  }
}
```
有时候可以使用 WebView 弥补一些 ReactNative 内置的组件实现不了的东西，我们可以借助 HTML 来完成，毕竟 HTML 有丰富的工具可以用。例如要想在 ReactNative 里展示图表，原生自带的组件则没办法实现，其他的图表组件都是基于 react-native-svg 实现的，展示效果目前还不足人意。这个时候 HTML 则有一大堆图表工具可以使用，echarts, highcharts 等等等。

接下来我们可以写一个网页，然后使用 uri 外部引用进来。但是把网页放在服务器上，然后 App 引用还是挺啰嗦的。能不能把网页放在应用内部，本地引用呢？当然可以，这个才是这篇博客的主题。

### WebView 加载本地 html

假设我们有一个 demo 项目

```
Demo/
    android/
    ios/
    index.android.js
    index.ios.js
    packege.json
    WebViewScreen.js
    pages/
      demo.html
    ...
```

新建一个文件 WebViewScreen.js

```js
import React from 'react';
import { WebView } from 'react-native';

export default class WebViewScreen extends React.Component {
  render() {
    return (
      <WebView source={require('./pages/demo.html')} />
    )
  }
}
```

然后在 index.android.js 和 index.ios.js 修改代码使用 WebViewScreen 展示

```js
...

import WebViewScreen from './WebViewScreen';

class Demo extends React.Component {
  render() {
    return (
      <View>
        <WebViewScreen />
      </View>
    )
  }
}

AppRegistry.registerComponent('Demo', () => Demo);
```

添加个 pages/demo.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    hello world
  </body>
</html>
```

然后就可以跑起来测试了，iOS 没问题，Android 则不会显示。这是一个已知的问题，目前 0.46 版本还没有解决。但是我们可以想办法绕过去，Android 需要先把静态资源放到 `android/app/src/main/assets` 目录下面，然后把 `require('./pages/demo.html')` 换成 `{uri: 'file:///android_asset/pages/demo.html'}`。WebViewScreen.js 会是下面这个样子

```js
export default class WebViewScreen extends React.Component {
  const source = (Platform.OS == 'ios') ? require('./pages/demo.html') : { uri: 'file:///android_asset/pages/demo.html' }
  render() {
    return (
      <WebView source={source} />
    )
  }
}
```

这样 Android 就没问题了，但是要记得同步 pages 目录到 android asset 目录下。

> 注意 HTML 中可以引用 javascript 但是不能引用 stylesheet, css 可以使用 `<style>` 内联写在 HTML 里。

### 传数据给 HTML

有时候不只是纯静态的页面，继续我们之前图表的的例子, 图表的数据是变化的，需要将数据传给 HTML。 借助 WebView `injectedJavaScript` 属性可以实现从应用传入数据给 HTML。

改造 pages/demo.html

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <div id="output"></div>
    <script>
      function init(data) {
        document.getElementById('output').innerHTML = JSON.stringify(data)
      }
    </script>
  </body>
</html>
```

改造 WebViewScreen.js

```js
export default class WebViewScreen extends React.Component {
  const source = (Platform.OS == 'ios') ? require('./pages/demo.html') : { uri: 'file:///android_asset/pages/demo.html' }
  render() {
    return (
      <WebView source={source} injectedJavaScript={this.bootstrapJS()} />
    )
  }

  bootstrapJS() {
    const data = { hello: 'world' }
    return `init(${JSON.stringify(data)})`
  }
}
```

`injectedJavaScript` 可以是一段 JavaScript 代码，当页面加载后注入并执行。

那么 HTML 如何给应用传出数据或者发消息呢？`onMessage` 属性将是打开大门的钥匙，有兴趣的可以自己研究。