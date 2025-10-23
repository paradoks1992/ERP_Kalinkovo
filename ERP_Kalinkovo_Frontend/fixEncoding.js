// fixEncoding.js — безопасная починка "кракозябр" (моджибака)
function looksGarbled(str) {
  if (typeof str !== "string" || !str) return false;
  const hasReplacement = /�{2,}/.test(str);
  const tooManyQuestion = (str.match(/\?/g) || []).length >= 3;
  return hasReplacement || tooManyQuestion;
}

function fromLatin1ToUtf8(str) {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  try {
    return new TextDecoder("windows-1251", { fatal: false }).decode(bytes);
  } catch {
    try {
      return new TextDecoder("latin1", { fatal: false }).decode(bytes);
    } catch {
      return str;
    }
  }
}

export function fixStringMaybe(str) {
  if (typeof str !== "string") return str;
  if (/[А-Яа-яЁё]/.test(str)) return str;
  if (looksGarbled(str)) {
    const fixed = fromLatin1ToUtf8(str);
    if (/[А-Яа-яЁё]/.test(fixed)) return fixed;
  }
  return str;
}

export function fixDeep(data) {
  if (data == null) return data;
  if (typeof data === "string") return fixStringMaybe(data);
  if (Array.isArray(data)) return data.map(fixDeep);
  if (typeof data === "object") {
    const out = {};
    for (const k of Object.keys(data)) out[k] = fixDeep(data[k]);
    return out;
  }
  return data;
}
