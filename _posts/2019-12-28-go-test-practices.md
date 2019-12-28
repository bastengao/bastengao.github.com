---
layout: post
title: 关于 Go 测试的一些实践
tags: [go,test]
---

Go `testing` 包提供了比较丰富的测试功能，包括普通测试、基准测试、main 测试。
很容易编写对现有代码的测试，这里分享一些平日里一些实践。

## testify

[testify](https://github.com/stretchr/testify) 提供了两个比较有用的包。一个是 assert 包，它提供了丰富断言方法，让你从大量的啰嗦的 if 中解脱出来。

```go
assert.NoError(t, err)
assert.Equal(t, 2019, year)
```

还有一个是 suite 包，它提供了测试生命周期管理，通俗讲就是它可以让一组测试复用准备前工作，测试后的清理工作。
`suite.Suite` 提供了一些钩子，可以按需使用。
钩子有这些 `SetupSuite`, `TearDownSuite`, `SetupTest`, `TearDownTest`, `BeforeTest(suiteName, methodName)`, `AfterTest(suiteName, methodName)`

```go
type ExampleSuite struct {
    suite.Suite
}

// 在执行所有测试前执行，只执行一次
func (s *ExampleSuite) SetupSuite() {
}

// 每次测试前都会被执行
func (s *ExampleSuite) SetupTest() {
}

// your test
func (s *ExampleSuite) TestExample() {
    year := 2019
    s.Assert().Equal(2019, year)
}

// 每次测试后会被执行
func (s *ExampleSuite) TearDownTest() {
}

// 在执行所有测试后执行，只执行一次
func (s *ExampleSuite) TearDownSuite() {
}

// 通过 testing 驱动 suite
func TestExampleSuite(t *testing.T) {
    suite.Run(t, new(ExampleSuite))
}
```

做一些与数据库有交互的测试就非常适合使用 suite，测试前准备测试数据，测试后清理数据，给下一个测试准备好干净的环境。

说道插入数据和清理数据，接下来介绍另外两个工具。

## dbcleaner

[dbcleaer](https://github.com/khaiql/dbcleaner) 提供数据库清理功能，而且他还能保证并行的运行测试时避免同时操作数据库导致测试失败。他底层是使用文件锁来做到多个测试之间同步执行的。

```go
// 默认文件锁目录是在 /tmp, 如果有多用户同时执行的情况，可以把锁目录改到项目里，tmp 加到 .gitignore 里不要提交就好了
option := dbcleaner.SetLockFileDir("./tmp/")
var cleaner = dbcleaner.New(option)

// 测试前获取 users 表的锁
cleaner.Acquire("users")

// 测试后清理数据，并释放锁
defer cleaner.Clean("users")

// 执行测试
...
```

因为他底层使用的是文件锁，只要锁目录一致 `dbcleaner.New` 可以多次执行，不会影响结果。

## testfixtures

[testfixtures](https://github.com/go-testfixtures/testfixtures) 提供了从 yml 导入数据到数据库的功能, 可以在测试前导入依赖的数据。

例如数据库有一个 `users` 表，加一个 `fixtures/users.yml` 文件，注意文件名要和表名一致。

```yaml
# fixtures/users.yml
- id: 1
  username: bastengao
  created_at: 2019-12-28 10:09:08
  updated_at: 2019-12-28 10:09:08
- id: 2
  username: gopher
  created_at: 2019-12-28 10:09:08
  updated_at: 2019-12-28 10:09:08
```

```go
import (
    "github.com/go-testfixtures/testfixtures/v3"
)

db, _ = sql.Open("postgres", "xxxx")
fixtures, _ := testfixtures.New(
    testfixtures.Database(db),
    testfixtures.Dialect("postgres"),
    testfixtures.Files("fixtures/users.yml"),
)

// 测试前导入数据
fixtures.Load()

// 执行测试
...
```

上面例子为了展示核心功能，没做错误处理，实际项目中一定要错误处理。
我个人比较喜欢按需导入数据, 也可以把整个数据导入, 将 `testfixtures.Files` 换成 `testfixtures.Directory("fixtures")` 就好了。

还有 `fixtures.Load()` 也会做数据库清理工作，但它不支持并发执行测试，所以可以配合 dbcleaner 来同步测试。

## mock

[mock](https://github.com/golang/mock) 顾名思义它提供了 mock 功能。当我们要测试的东西有其他依赖，例如第三方 API、还未完成的实现、或者依赖有副作用, 就可以使用 mock 对其进行替换，只测试我们关心的业务。

```go
type Mailer interface {
    Send(recipient, subject, content string) error
}

func registerUser(email string, mailer Mailer) error {
    err := createUser(email)
    if err != nil {
        return err
    }

    return mailer.Send(email, "Registration", "welcome")
}
```

例如要测试 `registerUser` 方法，我们只关心有没有创建用户，不关心邮件发送，或者邮件发送还没有实现或者有副作用, 这时候就可以使用 mock 对 Mailer 进行替换。

先通过 mockgen 命令成成 Mailer 接口的 mock 文件

    mockgen -destination mock/mailer.go -package mock your/package/name Mailer

然后在测试中使用 mock

```go
import (
    "github.com/golang/mock/gomock"

    // mock dir
    "mock"
)

func TestRegisterUser(t testing.T) {
    ctrl := gomock.NewController(s.T())
    mailer := mock.NewMockMailer(ctrl)
    mailer.
        EXPECT().
        Send(
            gomock.Eq(email),
            gomock.Any,
            gomock.Any,
        ).
        Return(nil)

    err := registerUser(email, mailer)
    assert.NoError(t, err)
    ...
}
```

## 最后

完整的例子在这里 [go-testexample](https://github.com/bastengao/go-test-example), 供大家参考。

PS: dbcleaner 和 testfixtures 都是从 Ruby 和 Rails 借鉴过来的，Rails 提供给了一个相当完整的测试体验，有很多地方值得学习。
db migration 就是 Rails 一个非常好用强大的功能，目前还没有找到和它相媲美的工具。
