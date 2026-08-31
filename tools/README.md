# 本地 SOCKS 转换工具

[`convert-any-proxy-to-local-socks.js`](convert-any-proxy-to-local-socks.js) 用于将代理订阅转换为本地 SOCKS 出口，服务于独立的本地代理链路。

## 与 `meta.ini` 的关系

该工具不负责：

- OpenClash 应用域名分流；
- 策略组默认值；
- 国家节点 High / 普通判断；
- `meta.ini` 的规则优先级。

这些行为仍只维护在根目录的 [`meta.ini`](../meta.ini) 中。

## 维护边界

修改本工具时只关注：

- 输入订阅格式和代理协议解析；
- 地区识别与端口映射；
- 输出的本地 SOCKS 配置；
- 运行用户、监听地址和端口冲突。

不要为了修复本地 SOCKS 的问题去修改应用分流规则；也不要把本地 SOCKS 端口写入 `meta.ini` 的国家节点正则。

## 运维注意事项

- 本地 SOCKS 进程应与 OpenClash 的透明代理链路区分开。
- 切换 OpenClash、HomeProxy 或 sing-box 时，先确认是否争用透明代理、DNS 或监听端口。
- 运行时使用的订阅地址、认证信息和 Token 不写入仓库文档。
- 路由器上的实际部署路径和服务状态以目标设备为准，仓库只维护转换工具源代码。

遇到连接循环、端口冲突或代理栈切换问题时，参考 [../docs/troubleshooting.md](../docs/troubleshooting.md)。
