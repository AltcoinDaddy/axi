import dotenv from "dotenv";
import { exec } from "child_process";

dotenv.config();

function checkAndRun() {
  console.log(`[${new Date().toLocaleTimeString()}] 🔍 Daemon checking for pending intents...`);
  
  exec("npx ts-node scripts/runRelayer.ts", (error, stdout, stderr) => {
    if (stdout.includes("Insufficient intents for batch")) {
      console.log(`[${new Date().toLocaleTimeString()}] ⏳ No valid pending intents found. Waiting...`);
    } else if (stdout.includes("Formed new Batch")) {
      console.log(`[${new Date().toLocaleTimeString()}] 🚀 SUCCESS! Relayer automatically formed and executed a batch!`);
      // Print the success output
      const successLines = stdout.split('\n').filter(line => line.includes("Formed new Batch") || line.includes("Batch Executed"));
      console.log(successLines.join('\n'));
    } else if (error) {
      console.error(`[${new Date().toLocaleTimeString()}] ⚠️ Relayer encountered an issue:`, stderr || error.message);
    }
  });
}

console.log("==========================================");
console.log("🤖 Axi Relayer Daemon Started");
console.log("Polling for new intents every 15 seconds...");
console.log("==========================================");

// Run immediately, then every 15 seconds
checkAndRun();
setInterval(checkAndRun, 15000);
