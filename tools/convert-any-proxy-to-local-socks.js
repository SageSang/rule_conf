/**
 * 将任意 Mihomo/Clash 代理节点列表转换为“一个本地 mixed(SOCKS/HTTP) 端口对应一个节点”的完整配置。
 *
 * 浏览器：先加载 js-yaml，再调用 LocalSocksConverter.convertYaml(inputYaml, 42000)。
 * Node.js：const converter = require('./convert-any-proxy-to-local-socks');
 *          const output = converter.convertYaml(inputYaml, 42000, require('js-yaml'));
 */
(function attachConverter(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LocalSocksConverter = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createConverter() {
  const DEFAULT_START_PORT = 42000;
  const MAX_PORT = 65535;

  function normalizeStartPort(startPort) {
    const port = Number(startPort);
    if (!Number.isInteger(port) || port < 1 || port > MAX_PORT) {
      throw new Error(`起始端口必须是 1 至 ${MAX_PORT} 的整数`);
    }
    return port;
  }

  function validateProxies(proxies) {
    if (!Array.isArray(proxies) || proxies.length === 0) {
      throw new Error('输入配置中没有 proxies 节点列表');
    }

    const names = new Set();
    proxies.forEach((proxy, index) => {
      if (!proxy || typeof proxy.name !== 'string' || !proxy.name.trim()) {
        throw new Error(`第 ${index + 1} 个节点缺少有效 name`);
      }
      if (names.has(proxy.name)) {
        throw new Error(`节点名称重复，无法创建唯一映射：${proxy.name}`);
      }
      names.add(proxy.name);
    });
  }

  /**
   * 从已经解析的 Clash/Mihomo 配置对象生成本地多端口配置。
   * 原代理节点的 server/port 等连接信息保持不变；新增的 listeners 才使用递增端口。
   */
  function convertConfig(sourceConfig, startPort = DEFAULT_START_PORT) {
    const proxies = sourceConfig && sourceConfig.proxies;
    validateProxies(proxies);

    const firstPort = normalizeStartPort(startPort);
    const lastPort = firstPort + proxies.length - 1;
    if (lastPort > MAX_PORT) {
      throw new Error(`节点数量过多：端口范围会超过 ${MAX_PORT}`);
    }

    return {
      'global-client-fingerprint': 'chrome',
      'global-ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'allow-lan': true,
      'bind-address': '*',
      mode: 'global',
      dns: {
        enable: false,
      },
      listeners: proxies.map((proxy, index) => ({
        name: `mixed${index}`,
        type: 'mixed',
        port: firstPort + index,
        proxy: proxy.name,
      })),
      proxies,
    };
  }

  /**
   * 将 YAML 文本转换为 YAML 文本。第三个参数传入浏览器全局 jsyaml 或 Node 的 js-yaml 模块。
   */
  function convertYaml(inputYaml, startPort = DEFAULT_START_PORT, yaml) {
    const codec = yaml || (typeof globalThis !== 'undefined' && globalThis.jsyaml);
    if (!codec || typeof codec.load !== 'function' || typeof codec.dump !== 'function') {
      throw new Error('需要提供 js-yaml（浏览器全局 jsyaml 或第三个参数）');
    }

    return codec.dump(convertConfig(codec.load(inputYaml), startPort));
  }

  return Object.freeze({
    DEFAULT_START_PORT,
    convertConfig,
    convertYaml,
  });
});
