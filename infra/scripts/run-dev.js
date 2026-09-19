const { spawn, execSync } = require("child_process");

function stopDockerServices() {
  console.log('\n🔴 Executando "npm run services:stop"...');
  try {
    execSync("npm run services:stop", { stdio: "inherit" });
  } catch (error) {
    console.error("Erro ao parar os serviços do Docker: ", error.message);
  }
}

function runPreRequisite(command) {
  try {
    console.log(`\n⚙️  Executando: ${command}...`);
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`\n Falha ao executar: ${command}`);
    return false;
  }
}

if (!runPreRequisite("npm run services:up")) {
  stopDockerServices();
  process.exit(1);
}

if (!runPreRequisite("npm run services:wait:database")) {
  stopDockerServices();
  process.exit(1);
}

if (!runPreRequisite("npm run migrations:up")) {
  stopDockerServices();
  process.exit(1);
}

console.log("\n🚀 Inicializando o ambiente Next.js...");

const nextProcess = spawn("next dev", {
  stdio: "inherit",
  shell: true,
});

// Flag para evitar que o Docker seja desligado duas vezes
let isShuttingDown = false;

function handleExit(exitCode) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  stopDockerServices();
  process.exit(exitCode);
}

nextProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`\n❌ Next.js finalizou inesperadamente com código: ${code}`);
    handleExit(code);
  }
});

process.on("SIGINT", () => {
  console.log("\n[Ctrl+C] Interrupção detectada pelo usuário.");
  handleExit(130);
});

process.on("SIGTERM", () => {
  handleExit(1);
});
