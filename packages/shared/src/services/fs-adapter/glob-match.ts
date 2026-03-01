/** glob パターンにファイルパスがマッチするか判定する */
export function matchGlob(pattern: string, filePath: string): boolean {
  let regexStr = "";
  let i = 0;
  while (i < pattern.length) {
    if (pattern[i] === "*" && pattern[i + 1] === "*") {
      if (pattern[i + 2] === "/") {
        regexStr += "(?:.*/)?";
        i += 3;
      } else {
        regexStr += ".*";
        i += 2;
      }
    } else if (pattern[i] === "*") {
      regexStr += "[^/]*";
      i += 1;
    } else if (".+^${}()|[\\]".includes(pattern[i])) {
      regexStr += `\\${pattern[i]}`;
      i += 1;
    } else {
      regexStr += pattern[i];
      i += 1;
    }
  }
  return new RegExp(`^${regexStr}$`).test(filePath);
}
