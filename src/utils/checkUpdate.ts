import { check } from "@tauri-apps/plugin-updater";

export async function checkForUpdate() {
  try {
    const update = await check();

    if (!update) {
      // 可选：不提示，保持安静
      console.log("No update available");
      return;
    }

    const ok = window.confirm(
      `发现新版本 ${update.version}，现在更新吗？\n\nUpdate now?`
    );

    if (!ok) return;

    await update.downloadAndInstall();

    // 方案1：提示用户手动重启
    window.alert("更新已安装，请重启应用 / Update installed. Please restart the app.");

    // 方案2（可选）：直接自动重启（体验更好）
    // await relaunch();
  } catch (err) {
    console.error("Update check failed:", err);
    window.alert("检查更新失败（可能未联网或 Release 资源不可用）。");
  }
}