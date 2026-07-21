/**
 * Sub-Store Script Operator
 *
 * 删除订阅说明项、规范重复名称，并按地区排序：
 * 同一地区内，优质节点排在普通节点之前；同一等级保留订阅原顺序。
 */

const EXCLUDE_NAME =
  /流量|套餐|到期|剩余|重置|官网|网站|最新网址|防失联|失联|官网地址|公告|通知|电报|群|频道|说明|使用说明|QQ群|客服|工单|订阅|\b(?:TG|Telegram|Expire|Traffic|Reset|Remaining|Official|Website)\b/i;

// HK → TW → US → JP → SG → KR → CA → AR → UK → DE → FR
// → IN → MY → TR → RU → UA → IT → PK → EG → AU → ZA → 其他
const REGION_RULES = [
  /(?:🇭🇰|香港|hong\s*kong|\bHK\b)/i,
  /(?:🇹🇼|台湾|台灣|taiwan|taipei|hinet|\bTW\b)/i,
  /(?:🇺🇸|美国|united\s*states|los\s*angeles|san\s*jose|seattle|new\s*york|\bUS\b)/i,
  /(?:🇯🇵|日本|tokyo|osaka|\bJP\b)/i,
  /(?:🇸🇬|新加坡|singapore|\bSG\b)/i,
  /(?:🇰🇷|韩国|韓國|korea|seoul|\bKR\b)/i,
  /(?:🇨🇦|加拿大|canada|toronto|vancouver|\bCA\b)/i,
  /(?:🇦🇷|阿根廷|argentina|buenos\s*aires|\bAR\b)/i,
  /(?:🇬🇧|英国|英國|united\s*kingdom|london|manchester|\bUK\b|\bGB\b)/i,
  /(?:🇩🇪|德国|德國|germany|frankfurt|berlin|\bDE\b)/i,
  /(?:🇫🇷|法国|法國|france|paris|\bFR\b)/i,
  /(?:🇮🇳|印度(?:[ -]|$)|india|\bIN\b)/i,
  /(?:🇲🇾|马来西亚|馬來西亞|malaysia|kuala\s*lumpur|\bMY\b)/i,
  /(?:🇹🇷|土耳其|turkey|istanbul|\bTR\b)/i,
  /(?:🇷🇺|俄罗斯|俄羅斯|russia|moscow|\bRU\b)/i,
  /(?:🇺🇦|乌克兰|烏克蘭|ukraine|kyiv|\bUA\b)/i,
  /(?:🇮🇹|意大利|義大利|italy|milan|rome|\bIT\b)/i,
  /(?:🇵🇰|巴基斯坦|pakistan|karachi|\bPK\b)/i,
  /(?:🇪🇬|埃及|egypt|cairo|\bEG\b)/i,
  /(?:🇦🇺|澳大利亚|澳大利亞|澳洲|australia|sydney|melbourne|\bAU\b)/i,
  /(?:🇿🇦|南非|south\s*africa|johannesburg|\bZA\b)/i,
];

// 与现有 OpenClash 优质节点定义一致。
// 不会把 0.5x、1.5x、15x 误判为优质。
const PREMIUM_QUALITY_PATTERN =
  /(?:进阶IEPL|专线|原生|家宽|星链|(?:^|[^0-9.])(?:2x|3x|4x|5x)(?![0-9]))/i;

function getRegionRank(name) {
  const rank = REGION_RULES.findIndex((rule) => rule.test(name));
  return rank === -1 ? REGION_RULES.length : rank;
}

function getQualityRank(name) {
  return PREMIUM_QUALITY_PATTERN.test(name) ? 0 : 1;
}

async function operator(proxies, targetPlatform, context) {
  if (!Array.isArray(proxies)) return proxies;

  const usedNames = new Set();
  const result = [];

  for (const [index, proxy] of proxies.entries()) {
    const originalName = String(proxy?.name ?? '').trim();

    if (!originalName || EXCLUDE_NAME.test(originalName)) {
      continue;
    }

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
      qualityRank: getQualityRank(originalName),
      originalIndex: index,
    });
  }

  return result
    .sort(
      (a, b) =>
        a.regionRank - b.regionRank ||
        a.qualityRank - b.qualityRank ||
        a.originalIndex - b.originalIndex,
    )
    .map(({ proxy }) => proxy);
}
