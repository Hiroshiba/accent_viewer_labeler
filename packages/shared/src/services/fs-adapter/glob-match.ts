/** glob パターンにファイルパスがマッチするか判定する */
export function matchGlob(pattern: string, filePath: string): boolean {
  const parts = pattern.split("**");
  const regexParts = parts.map((part) =>
    part.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*"),
  );
  const regexStr = regexParts.join(".*");
  return new RegExp(`^${regexStr}$`).test(filePath);
}
