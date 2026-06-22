// Kills only processes on ports 3000 and 5000 before dev starts.
// Safe — does not touch any other node processes.
const { execSync } = require('child_process');

const PORTS = [3000, 5000];

PORTS.forEach((port) => {
  try {
    const result = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
    const lines = result.split('\n').filter((l) => l.includes('LISTENING'));
    lines.forEach((line) => {
      const pid = line.trim().split(/\s+/).pop();
      if (pid && pid !== '0') {
        try {
          execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
          console.log(`Freed port ${port} (PID ${pid})`);
        } catch (_) {}
      }
    });
  } catch (_) {
    // Port is not in use — nothing to kill
  }
});
