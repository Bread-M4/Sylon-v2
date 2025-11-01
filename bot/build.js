// build-bot.js
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { encryptAll } = require("./encrypt.js");
const cfg = require("./scripts/cryptoConfig.js");
const jsObfuscator = require("javascript-obfuscator");
// === simple base64→hex key obfuscator ===
function obfuscateKey(value) {
  const b64 = Buffer.from(String(value), "utf8").toString("base64");
  const hex = Buffer.from(b64, "utf8").toString("hex");
  return hex;
}
const botPath = path.join(__dirname, "bot.js");
const outPath = path.join(__dirname, "bot-obfuscated.js");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
const { spawn, spawnSync } = require('child_process');
const os = require('os');

async function cleanup(filePath, obfuscatedPath) {
  const { promises: fsp } = require('fs');

  try {
    // read original file
    let content = await fsp.readFile(filePath, 'utf8');

    const START_MARKER = "// ====== Start block ======";
    const END_MARKER = "// ====== End block ======";
    const re = new RegExp(
      START_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") +
        "[\\s\\S]*?" +
        END_MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "m"
    );

    if (!re.test(content)) {
      console.log("ℹ️ No embedded decrypt block found in", filePath);
    } else {
      content = content.replace(re, "");
      content = content.replace(/\n{3,}/g, "\n\n");
      await fsp.writeFile(filePath, content, 'utf8');
      console.log("Removed embedded decrypt block from", filePath);
    }

    if (obfuscatedPath) {
      try {
        const stat = await fsp.stat(obfuscatedPath).catch(() => null);
        if (stat) {
          await fsp.unlink(obfuscatedPath);
          console.log("Deleted obfuscated file:", obfuscatedPath);
        } else {
          console.log("No obfuscated file to delete at:", obfuscatedPath, "whattt how is that possible maybe rerun this script???");
        }
      } catch (delErr) {
        console.error("❌ Failed to delete obfuscated file:", delErr && delErr.message ? delErr.message : delErr);
        // don't throw here unless you want the whole cleanup to fail
        // throw delErr;
      }
    }

    return true;
  } catch (err) {
    console.error("❌ cleanup failed:", err && err.message ? err.message : err);
    throw err;
  }
}

/**
 * Runs pkg to produce a standalone executable from the given JS file.
 *
 * @param {string} inputPath - path to input JS file (the obfuscated file)
 * @param {string} exeName - desired output exe filename
 * @param {string} targets - pkg target string (defaults to node18-win-x64)
 */
async function runPkgBuild(inputPath, exeName = 'omgexe.exe', targets = 'node18-win-x64') {
  // Try to locate pkg executable (Windows: where, Unix: which)
  const locator = (os.platform() === 'win32') ? 'where' : 'which';
  try {
    const found = spawnSync(locator, ['pkg'], { encoding: 'utf8' });
    if (found.status === 0 && found.stdout) {
      const pkgPath = found.stdout.split(/\r?\n/).find(Boolean).trim();
      if (pkgPath) {
        console.log('Found pkg at:', pkgPath);
        return await new Promise((resolve, reject) => {
          const args = [inputPath, '--targets', targets, '--output', exeName];
          console.log(`Spawning: ${pkgPath} ${args.join(' ')}`);
          const p = spawn(pkgPath, args, { stdio: 'inherit' });
          p.on('error', (err) => reject(err));
          p.on('close', (code, signal) => {
            if (code === 0) resolve(true);
            else reject(new Error(`pkg exited with ${code}${signal ? ` (signal ${signal})` : ''}`));
          });
        });
      }
    }
  } catch (e) {
    console.warn('pkg locator failed:', e && e.message ? e.message : e);
  }

  // Fallback to running via shell (if pkg is in PATH but 'which' failed)
  try {
    const command = `pkg "${inputPath}" --targets "${targets}" --output "${exeName}"`;
    console.log('Falling back to shell command:', command);
    return await new Promise((resolve, reject) => {
      const p = spawn(command, { shell: true, stdio: 'inherit' });
      p.on('error', (err) => reject(err));
      p.on('close', (code, signal) => {
        if (code === 0) resolve(true);
        else reject(new Error(`pkg (via shell) exited with ${code}${signal ? ` (signal ${signal})` : ''}`));
      });
    });
  } catch (err) {
    throw err;
  }
}

async function ObfuscateFile(params) {
  const { filePath, outputPath } = params;

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const obfuscationResult = jsObfuscator.obfuscate(fileContent, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    ignoreImports: true,
    numbersToExpressions: true,
    simplify: true,
    splitStrings: true,
    stringArray: true,
    stringArrayEncoding: [],
    stringArrayThreshold: 0.3,
    transformObjectKeys: true,
    unicodeEscapeSequence: true,
    });

    fs.writeFileSync(outputPath, obfuscationResult.getObfuscatedCode(), "utf8");
    console.log(`File obfuscated -> ${outputPath}`);
    try {
      // Build exe using pkg instead of bun
      await runPkgBuild(outputPath, 'omgexe.exe', 'node18-win-x64');
      console.log("pkg build finished successfully -> omgexe.exe");
    } catch (err) {
      console.error('pkg build failed:', err && err.message ? err.message : err);
      throw err; 
    }
    try {
      const removed =   await cleanup(botPath, outPath);
      if (removed) {
        console.log("Removed embedded decrypt block from bot.js");
      } else {
        console.log("Nothing removed (block not found).");
      }
    } catch (e) {
      console.error("Failed to remove embedded block:", e && e.message ? e.message : e);
    }

  } catch (error) {
    console.error("bfuscation error:", error);
  }
}
rl.question("Enter token to encrypt and embed into bot.js: ", (tokenInput) => {
  // first prompt done — now ask for guild id
  rl.question("Enter guild id to include in the embedded block (will NOT be obfuscated): ", (guildIdInput) => {
    try {
      const encrypted = encryptAll(tokenInput);

      // Encrypt key material
      const encAES = obfuscateKey(cfg.AES_PASSPHRASE);
      const encXOR = obfuscateKey(cfg.XOR_PASSPHRASE);
      const encShiftA = obfuscateKey(cfg.CAESAR_SHIFT_A.toString());
      const encShiftB = obfuscateKey(cfg.CAESAR_SHIFT_B.toString());

      console.log("✅ Token and key material encrypted.");

      // sanitize guild id for safe embedding (escape single quotes and backticks)
      const guildId = String(guildIdInput || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/`/g, "\\`");

      const embedCode = `

 // ====== Start block ======
 // --- key deobfuscation ---
 function deobfuscateKey(hex) {
   const b64 = Buffer.from(hex, 'hex').toString('utf8');
   return Buffer.from(b64, 'base64').toString('utf8');
 }

 const AES_PASSPHRASE = deobfuscateKey("${encAES}");
 const XOR_PASSPHRASE = deobfuscateKey("${encXOR}");
 const CAESAR_SHIFT_A = parseInt(deobfuscateKey("${encShiftA}"));
 const CAESAR_SHIFT_B = parseInt(deobfuscateKey("${encShiftB}"));

 // --- decryptor logic ---
 function deriveAesKey(p){return crypto.createHash('sha256').update(String(p),'utf8').digest();}
 function rotateBuffer(b,n){const o=Buffer.alloc(b.length),l=b.length;n=((n%l)+l)%l;for(let i=0;i<l;i++)o[i]=b[(i+n)%l];return o;}
 function makeRoundKeys(p,r=3){const base=crypto.createHash('sha256').update(String(p),'utf8').digest();const keys=[];for(let i=0;i<r;i++){const rot=rotateBuffer(base,i*7+(i%3));const rev=Buffer.from(rot).reverse();const mix=crypto.createHash('sha256').update(rev).update(Buffer.from([i])).digest();keys.push(mix);}return keys;}
 function convolutedXorDecode(b64){let out=Buffer.from(String(b64),'base64');const keys=makeRoundKeys(XOR_PASSPHRASE,3);const k2=Buffer.from(keys[2]).reverse();for(let i=0;i<out.length;i++){let v=out[i];v=((v&0x0f)<<4)|((v&0xf0)>>4);out[i]=v^k2[i%k2.length];}for(let i=0;i<out.length;i++){const t=(i*31)&0xff;out[i]^=keys[1][(i+13)%keys[1].length]^t;}for(let i=0;i<out.length;i++)out[i]^=keys[0][i%keys[0].length];return out.toString('utf8');}
 function caesarDecrypt(str,shift){return String(str).replace(/[a-zA-Z]/g,c=>{const b=c<='Z'?65:97;return String.fromCharCode(((c.charCodeAt(0)-b-shift+26)%26)+b);});}
 function aesDecrypt(payload,pass){const [ivB64,cipherB64]=payload.split(':');const iv=Buffer.from(ivB64,'base64');const cipherBuf=Buffer.from(cipherB64,'base64');const key=deriveAesKey(pass);const dec=crypto.createDecipheriv('aes-256-cbc',key,iv);const d=Buffer.concat([dec.update(cipherBuf),dec.final()]);return d.toString('utf8');}
 function decryptAll(enc){const s1=aesDecrypt(enc,AES_PASSPHRASE);const s2=convolutedXorDecode(s1);const s3=caesarDecrypt(s2,CAESAR_SHIFT_B);const s4=caesarDecrypt(s3,CAESAR_SHIFT_A);return s4;}

 // --- non-obfuscated guild id (in plain) ---
 const GUILD_ID = '${guildId}';

 const ENCRYPTED_TOKEN="${encrypted}";
 const TOKEN=decryptAll(ENCRYPTED_TOKEN);
 // ====== End block ======
 `;

      // --- insert into bot.js ---
      let lines = [];

      if (fs.existsSync(botPath)) {
        lines = fs.readFileSync(botPath, "utf8").split("\n");
        const startMarker = "// ====== AUTO-GENERATED EMBEDDED DECRYPT BLOCK ======";
        const idx = lines.findIndex((l) => l.includes(startMarker));
        if (idx !== -1) {
          // remove any existing auto-generated block (naively remove up to 500 lines after marker)
          lines.splice(idx, 500);
        }
      } else {
        // create a minimal placeholder bot file if none exists (so we can insert)
        lines = Array(30).fill("");
      }

      // insert embedCode at line 18 (0-based index 17) — unchanged from your original script
      lines.splice(28, 0, embedCode);

      fs.writeFileSync(botPath, lines.join("\n"), "utf8");
      console.log("✅ bot.js updated (decryptor + GUILD_ID inserted).");

      // --- obfuscate the newly-updated bot.js to bot-obfuscated.js ---
      ObfuscateFile({ filePath: botPath, outputPath: outPath })
        .then(() => {
          console.log("✅ Obfuscation step complete.");
        })
        .catch((e) => {
          console.error("❌ Obfuscation failed:", e);
        });
    } catch (err) {
      console.error("❌ Build error:", err && err.message ? err.message : err);
    } finally {
      rl.close();
    }
  }); // end guild id question
}); // end token question
