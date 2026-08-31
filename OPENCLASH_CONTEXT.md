# OpenClash 配置上下文

最后更新：2026-08-31

本文档描述仓库当前的稳定架构和维护边界。详细规则原则、来源清单、操作流程和故障记录分别维护在 [`docs/`](docs/) 下，避免把所有信息堆在一份上下文文件中。

## 1. 项目定位

本项目维护一份供 OpenClash / SubConverter 使用的 `meta.ini`。它把节点订阅、应用分流规则、国家节点池和策略组默认值组合成最终的 Clash 配置。

配置链路如下：

```text
机场或私有节点订阅
        ↓
Sub-Store 节点整理、筛选、排序
        ↓
SubConverter 读取 meta.ini
        ↓
OpenClash / Clash 最终配置
```

本地 SOCKS 转换工具是独立链路，见 [tools/README.md](tools/README.md)。它不替代 `meta.ini`，也不改变应用分流规则。

## 2. 文件职责

| 文件或目录 | 职责 | 是否为 OpenClash 规则源 |
| --- | --- | --- |
| `meta.ini` | 分流规则、规则顺序、远程规则集、策略组、默认出口和节点匹配 | 是，唯一源 |
| `sub-store/operators/` | 节点过滤、去重、重命名和地区排序 | 否 |
| `sub-store/README.md` | Sub-Store 脚本的选择和使用说明 | 否 |
| `tools/convert-any-proxy-to-local-socks.js` | 将代理订阅转换为本地 SOCKS 出口 | 否 |
| `docs/` | 设计原则、来源、操作和故障说明 | 否 |
| `CHANGELOG.md` | 历史决策和功能变更记录 | 否 |

## 3. 当前运行模型

### 规则

- 规则按 `meta.ini` 中的顺序从上到下匹配。
- 应用专属规则必须位于通用服务规则和中国直连规则之前。
- Google Voice 位于通用 Google 规则之前。
- Reddit 位于通用社交媒体规则之前。
- Pixiv、DLsite、FANZA、Fantia 和 DMM 位于中国直连规则之前，并进入日本原生解锁组。
- 未被前面规则命中的流量最终进入 `🐟 漏网之鱼`。

### 节点组

- 香港、台湾、美国、日本、新加坡是五个核心国家，分别维护普通组和 High 组。
- High 只表示名称中存在严格大于 `1x` 或 `1倍` 的倍率标签。
- `0.1x`、`0.5x`、`1x`、`1.0x`、`1.00x` 和 `1倍` 都属于普通节点。
- 专线、原生、家宽、IEPL、IPLC 等线路词本身不等于高倍率。
- 韩国及其他独立国家组保留全部匹配节点，不参与五国的普通/High 互斥筛选。
- `🧊 冷门节点` 是独立国家组的补集，用来保留无法可靠归入常用国家组的节点。
- 国家英文缩写必须使用大写完整单词匹配，不能使用裸 `US`、`IN` 等片段。

### 默认值

策略组列表的第一个选项就是生成配置后的默认出口。完整默认值只维护在 `meta.ini`，文档不再复制完整表格。

当前设计意图包括：

- ChatGPT、Gemini、AI、Google Voice 默认美国。
- Reddit 和 `🌐 Default` 默认台湾。
- Telegram、视频和多数海外社交服务默认新加坡。
- OKX、Binance、Bybit 默认台湾。
- Steam、Epic、Rockstar 默认阿根廷；下载和 BT/PT 默认直连。
- Adobe 默认 `REJECT`。
- Google FCM、Cloudflare 和 GitHub 默认使用 `🌐 Default` 或其对应的共享出口。
- `GLOBAL` 默认美国。

## 4. 部署边界

仓库只维护配置源和辅助脚本，不把路由器上的转换结果作为仓库文件。路由器实际使用的配置路径、端口和进程状态属于部署现场信息，应在目标设备上确认，不以历史文档中的路径作为唯一依据。

仓库不记录认证信息、订阅地址、私钥或 Token。已废弃的 `maoxiong` 配置源和 `openclash-sub/` 私有节点服务只保留在 [CHANGELOG.md](CHANGELOG.md) 的历史记录中。

## 5. 文档索引

- [README.md](README.md)：项目入口和快速理解。
- [docs/policy.md](docs/policy.md)：稳定的配置设计原则。
- [docs/sources.md](docs/sources.md)：远程规则源和用途索引。
- [docs/operations.md](docs/operations.md)：日常维护和发布流程。
- [docs/troubleshooting.md](docs/troubleshooting.md)：已知问题和处理方式。
- [sub-store/README.md](sub-store/README.md)：Sub-Store 脚本说明。
- [tools/README.md](tools/README.md)：本地 SOCKS 转换工具说明。
