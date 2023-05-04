---
layout: post
title: 使用 AWS Global Accelerator 加速 EKS ingress 访问
tags: [AWS,Global-Accelerator,EKS,ingress]
published: true
---

先说下效果，使用 Global Accelerator 后，访问在 AWS us-west-2 的 ALB 基本都在 200ms 内，本地网络是西安电信。

场景：使用 https 方式通过 GA 访问 ingress 暴露的 API 接口。

下面说说我如何做的。首先添加一个 API ingress, 证书可以使用通配符或者限定域名都可以。
例如最终使用的 api.example.org 访问接口，那么就配置 `*.example.org` 或者 `api.example.org` 域名的证书。
`rules` 那里不配置 `host`。

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  namespace: dev
  name: api
  annotations:
    alb.ingress.kubernetes.io/scheme: internet-facing
    alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-west-2:xxxx:certificate/xxxx
spec:
  ingressClassName: alb
  rules:
    - http:
        paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: api
              port:
                number: 80
```

第二步，添加 Global Accelerator。加速器类型选标准，默认 ipv4。
侦听器端口选 443 (因为使用 https), 协议选 TCP。
端点组区域选择 us-west-2，端点选择上面 ingress 对应的 ALB 就好了。

第三步，配置 `api.example.org` CNAME 到 GA 分配的域名。稍等一段时间就可以测试访问了。
