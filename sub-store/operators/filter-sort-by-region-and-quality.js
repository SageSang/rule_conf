/**
 * Sub-Store Script Operator
 *
 * 删除订阅说明项、合并连接参数完全相同的别名、规范重复名称，并按地区排序：
 * 同一地区内，普通节点排在高倍率节点之前；同一等级保留订阅原顺序。
 */

const EXCLUDE_NAME =
  /流量|套餐|到期|剩余|重置|官网|网站|最新网址|防失联|失联|官网地址|公告|通知|电报|群|频道|说明|使用说明|QQ群|客服|工单|订阅|倍率提示|请使用.*(?:代理|工具)|\b(?:TG|Telegram|Expire|Traffic|Reset|Remaining|Official|Website)\b/i;

// HK → TW → US → JP → SG → KR → CA → AR → UK → DE → FR
// → IN → MY → TR → RU → UA → IT → PK → EG → AU → ZA → 冷门 → 其他
//
// 名称别名可忽略大小写；ISO 两位代码必须是大写且位于单词边界，
// 避免将普通英文单词或国家全称内部片段误判为国家代码。
const REGION_RULES = [
  { names: /(?:🇭🇰|香港|hong\s*kong)/i, code: /\bHK\b/ },
  { names: /(?:🇹🇼|台湾|台灣|taiwan|taipei|hinet)/i, code: /\bTW\b/ },
  { names: /(?:🇺🇸|美国|美國|united\s*states|los\s*angeles|san\s*francisco|seattle|new\s*york)/i, code: /\bUS\b/ },
  { names: /(?:🇯🇵|日本|japan|tokyo|osaka)/i, code: /\bJP\b/ },
  { names: /(?:🇸🇬|新加坡|singapore)/i, code: /\bSG\b/ },
  { names: /(?:🇰🇷|韩国|韓國|south\s*korea|korea|seoul)/i, code: /\bKR\b/ },
  { names: /(?:🇨🇦|加拿大|canada|toronto|vancouver)/i, code: /\bCA\b/ },
  { names: /(?:🇦🇷|阿根廷|argentina|buenos\s*aires)/i, code: /\bAR\b/ },
  { names: /(?:🇬🇧|英国|英國|united\s*kingdom|great\s*britain|britain|england|london|manchester)/i, code: /\bUK\b/ },
  { names: /(?:🇩🇪|德国|德國|germany|deutschland|frankfurt|berlin)/i, code: /\bDE\b/ },
  { names: /(?:🇫🇷|法国|法國|france|paris)/i, code: /\bFR\b/ },
  { names: /(?:🇮🇳|印度(?!尼西亚|尼西亞)|india|mumbai|delhi|bangalore)/i, code: /\bIN\b/ },
  { names: /(?:🇲🇾|马来西亚|馬來西亞|malaysia|kuala\s*lumpur)/i, code: /\bMY\b/ },
  { names: /(?:🇹🇷|土耳其|turkey|türkiye|turkiye|istanbul)/i, code: /\bTR\b/ },
  { names: /(?:🇷🇺|俄罗斯|俄羅斯|russia|russian\s*federation|moscow)/i, code: /\bRU\b/ },
  { names: /(?:🇺🇦|乌克兰|烏克蘭|ukraine|kyiv|kiev)/i, code: /\bUA\b/ },
  { names: /(?:🇮🇹|意大利|義大利|italy|italia|milan|rome)/i, code: /\bIT\b/ },
  { names: /(?:🇵🇰|巴基斯坦|pakistan|karachi|lahore)/i, code: /\bPK\b/ },
  { names: /(?:🇪🇬|埃及|egypt|cairo)/i, code: /\bEG\b/ },
  { names: /(?:🇦🇺|澳大利亚|澳大利亞|澳洲|australia|sydney|melbourne|perth|brisbane)/i, code: /\bAU\b/ },
  { names: /(?:🇿🇦|南非|south\s*africa|johannesburg|cape\s*town|durban)/i, code: /\bZA\b/ },
];

const RARE_COUNTRY_NAMES =
  /(?:🇲🇴|澳门|澳門|maca[ou]|🇹🇭|泰国|泰國|thailand|bangkok|🇮🇩|印度尼西亚|印度尼西亞|indonesia|jakarta|🇻🇳|越南|vietnam|hanoi|🇵🇭|菲律宾|菲律賓|philippines|manila|🇳🇿|新西兰|新西蘭|new\s*zealand|auckland|🇧🇷|巴西|brazil|sao\s*paulo|🇲🇽|墨西哥|mexico|🇨🇱|智利|chile|🇳🇱|荷兰|荷蘭|netherlands|amsterdam|🇳🇴|挪威|norway|oslo|🇦🇪|阿联酋|阿聯酋|uae|dubai|🇸🇦|沙特(?:阿拉伯)?|saudi|riyadh|🇳🇬|尼日利亚|尼日利亞|nigeria|lagos|🇮🇪|爱尔兰|愛爾蘭|ireland|dublin|🇧🇪|比利时|比利時|belgium|brussels|🇫🇮|芬兰|芬蘭|finland|helsinki|🇸🇪|瑞典|sweden|stockholm|🇪🇸|西班牙|spain|madrid|barcelona|🇭🇺|匈牙利|hungary|budapest|🇷🇴|罗马尼亚|羅馬尼亞|romania|bucharest)/i;

const RARE_COUNTRY_CODES =
  /\b(?:MO|TH|ID|VN|PH|NZ|BR|MX|CL|NL|NO|AE|SA|NG|IE|BE|FI|SE|ES|HU|RO)\b/;

// 与现有 OpenClash 高倍率节点定义一致：严格匹配数值大于 1x / 1倍的倍率。
// 不会把 0.1x、0.5x、1x、1.0x 或 1倍归为高倍率。
const HIGH_MULTIPLIER_PATTERN =
  /(?:^|[^0-9.])(?:1\.0*[1-9][0-9]*|(?:[2-9][0-9]*|1[0-9]+)(?:\.[0-9]+)?)(?:x|倍)(?![0-9.])/i;

function getRegionRank(name) {
  const rank = REGION_RULES.findIndex(
    ({ names, code }) => names.test(name) || code.test(name),
  );

  if (rank !== -1) return rank;
  if (RARE_COUNTRY_NAMES.test(name) || RARE_COUNTRY_CODES.test(name)) {
    return REGION_RULES.length;
  }

  return REGION_RULES.length + 1;
}

function getMultiplierRank(name) {
  return HIGH_MULTIPLIER_PATTERN.test(name) ? 1 : 0;
}

function compareCodePoints(left, right) {
  const a = Array.from(left);
  const b = Array.from(right);
  const length = Math.min(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const difference = a[index].codePointAt(0) - b[index].codePointAt(0);
    if (difference !== 0) return difference;
  }

  return a.length - b.length;
}

function canonicalConnectionJson(value, topLevel = false) {
  if (value === null) return 'null';

  if (Array.isArray(value)) {
    return `[${value
      .map((item) =>
        item === undefined || typeof item === 'function' || typeof item === 'symbol'
          ? 'null'
          : canonicalConnectionJson(item, false),
      )
      .join(',')}]`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value)
      .filter((key) => {
        if (
          topLevel &&
          (key === 'name' || key.startsWith('_') || (key === 'port' && value.ports))
        ) {
          return false;
        }
        const item = value[key];
        return item !== undefined && typeof item !== 'function' && typeof item !== 'symbol';
      })
      .sort(compareCodePoints);

    return `{${keys
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonicalConnectionJson(value[key], false)}`,
      )
      .join(',')}}`;
  }

  const serialized = JSON.stringify(value);
  return serialized === undefined ? 'null' : serialized;
}

async function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;

  const usedNames = new Set();
  const usedConnections = new Set();
  const result = [];

  for (const [index, proxy] of proxies.entries()) {
    const originalName = String(proxy?.name ?? '').trim();

    if (!originalName || EXCLUDE_NAME.test(originalName)) {
      continue;
    }

    const connectionKey = canonicalConnectionJson(proxy, true);
    if (usedConnections.has(connectionKey)) {
      continue;
    }
    usedConnections.add(connectionKey);

    let uniqueName = originalName;
    let number = 2;

    while (usedNames.has(uniqueName)) {
      uniqueName = `${originalName} #${number}`;
      number += 1;
    }

    usedNames.add(uniqueName);

    result.push({
      proxy: {
        ...proxy,
        name: uniqueName,
      },
      regionRank: getRegionRank(originalName),
      multiplierRank: getMultiplierRank(originalName),
      originalIndex: index,
    });
  }

  return result
    .sort(
      (a, b) =>
        a.regionRank - b.regionRank ||
        a.multiplierRank - b.multiplierRank ||
        a.originalIndex - b.originalIndex,
    )
    .map(({ proxy }) => proxy);
}

if (typeof module === 'object' && module.exports) {
  module.exports = { canonicalConnectionJson, operator };
}
