const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: "base",
});

/** 自然順ソート比較関数 */
export function naturalCompare(a: string, b: string): number {
  return collator.compare(a, b);
}

/** 文字列配列を自然順ソートした新しい配列を返す */
export function naturalSort(items: Array<string>): Array<string> {
  return [...items].sort(naturalCompare);
}
