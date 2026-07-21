/**
 * 将任意 Mihomo/Clash 代理节点列表转换为“一个本地 mixed(SOCKS/HTTP) 端口对应一个节点”的完整配置。
 *
 * 浏览器：先加载 js-yaml，再调用 LocalSocksConverter.convertYaml(inputYaml, 62000)。
 * Node.js：const converter = require('./convert-any-proxy-to-local-socks');
 *          const output = converter.convertYaml(inputYaml, 62000, require('js-yaml'));
 */
(function attachConverter(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LocalSocksConverter = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function createConverter() {
  const DEFAULT_START_PORT = 62000;
  const MAX_PORT = 65535;
  const REGION_PORT_BLOCK_SIZE = 200;

  // 顺序与本地 TXT 导出保持一致。固定地区各占 200 个端口，
  // 这样端口本身就能表达节点所属地区，而不会因订阅节点增减发生漂移。
  const REGION_PORT_BLOCKS = [
    {
      key: 'hong-kong',
      label: '香港',
      matcher: /香港|hong\s*kong|(?:^|[\s_\-])hk(?:[\s_\-]|$)/i,
    },
    {
      key: 'taiwan',
      label: '台湾',
      matcher: /台湾|台灣|taiwan|(?:^|[\s_\-])tw(?:[\s_\-]|$)/i,
    },
    {
      key: 'japan',
      label: '日本',
      matcher: /日本|japan|(?:^|[\s_\-])jp(?:[\s_\-]|$)/i,
    },
    {
      key: 'singapore',
      label: '新加坡',
      matcher: /新加坡|singapore|(?:^|[\s_\-])sg(?:[\s_\-]|$)/i,
    },
    {
      key: 'united-states',
      label: '美国',
      matcher: /美国|美國|united\s*states|(?:^|[\s_\-])us(?:[\s_\-]|$)/i,
    },
    {
      key: 'south-korea',
      label: '韩国',
      matcher: /韩国|韓國|korea|(?:^|[\s_\-])kr(?:[\s_\-]|$)/i,
    },
    {
      key: 'united-kingdom',
      label: '英国',
      matcher: /英国|英國|united\s*kingdom|(?:^|[\s_\-])uk(?:[\s_\-]|$)/i,
    },
    {
      key: 'germany',
      label: '德国',
      matcher: /德国|德國|germany|(?:^|[\s_\-])de(?:[\s_\-]|$)/i,
    },
    {
      key: 'france',
      label: '法国',
      matcher: /法国|法國|france|(?:^|[\s_\-])fr(?:[\s_\-]|$)/i,
    },
    {
      key: 'canada',
      label: '加拿大',
      matcher: /加拿大|canada|(?:^|[\s_\-])ca(?:[\s_\-]|$)/i,
    },
    {
      key: 'australia',
      label: '澳大利亚',
      matcher: /澳大利亚|澳大利亞|australia|(?:^|[\s_\-])au(?:[\s_\-]|$)/i,
    },
    {
      key: 'other',
      label: '其他地区',
      matcher: null,
      unlimited: true,
    },
  ];

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

      const originalName = proxy.name;
      let uniqueName = originalName;
      let duplicateNumber = 2;
      while (names.has(uniqueName)) {
        uniqueName = `${originalName} #${duplicateNumber}`;
        duplicateNumber += 1;
      }
      proxy.name = uniqueName;
      names.add(uniqueName);
    });
  }

  function regionIndexForProxy(name) {
    const regionIndex = REGION_PORT_BLOCKS.findIndex(
      ({ matcher }) => matcher && matcher.test(name),
    );
    return regionIndex === -1 ? REGION_PORT_BLOCKS.length - 1 : regionIndex;
  }

  function buildRegionPortConfig(proxies, firstPort) {
    const proxiesByRegion = REGION_PORT_BLOCKS.map(() => []);
    const selectedProxies = [];
    const listeners = [];

    proxies.forEach((proxy) => {
      proxiesByRegion[regionIndexForProxy(proxy.name)].push(proxy);
    });

    proxiesByRegion.forEach((regionProxies, regionIndex) => {
      const region = REGION_PORT_BLOCKS[regionIndex];
      const selectedRegionProxies = region.unlimited
        ? regionProxies
        : regionProxies.slice(0, REGION_PORT_BLOCK_SIZE);

      const blockStartPort = firstPort + regionIndex * REGION_PORT_BLOCK_SIZE;
      const blockEndPort = blockStartPort + selectedRegionProxies.length - 1;
      if (selectedRegionProxies.length > 0 && blockEndPort > MAX_PORT) {
        throw new Error(
          `${region.label}端口范围会超过 ${MAX_PORT}；请使用更小的起始端口`,
        );
      }

      selectedRegionProxies.forEach((proxy, index) => {
        selectedProxies.push(proxy);
        listeners.push({
          name: `mixed-${region.key}-${index + 1}`,
          type: 'mixed',
          port: blockStartPort + index,
          proxy: proxy.name,
        });
      });
    });

    return { listeners, proxies: selectedProxies };
  }

  /**
   * 从已经解析的 Clash/Mihomo 配置对象生成本地多端口配置。
   * 原代理节点的 server/port 等连接信息保持不变；新增 listeners 使用固定地区端口段。
   */
  function convertConfig(sourceConfig, startPort = DEFAULT_START_PORT) {
    const proxies = sourceConfig && sourceConfig.proxies;
    validateProxies(proxies);

    const firstPort = normalizeStartPort(startPort);
    const regionPortConfig = buildRegionPortConfig(proxies, firstPort);

    return {
      'global-client-fingerprint': 'chrome',
      'global-ua': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'allow-lan': true,
      'bind-address': '*',
      mode: 'global',
      dns: {
        enable: false,
      },
      listeners: regionPortConfig.listeners,
      proxies: regionPortConfig.proxies,
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
