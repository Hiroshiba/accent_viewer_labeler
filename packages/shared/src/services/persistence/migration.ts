export const CURRENT_APP_VERSION = 1;

/** データマイグレーションが必要な場合に実行する（プロトタイプ段階では中身を書かない） */
export async function migrateIfNeeded(
  storedVersion: number,
): Promise<"success" | "failed"> {
  if (storedVersion >= CURRENT_APP_VERSION) {
    return "success";
  }
  return "failed";
}
