const { spawn, execSync } = require("child_process");

function stopDockerServices() {
  console.log('\n🛑 Executando "npm run services:stop"...');
  try {
    execSync("npm run services:stop", { stdio: "inherit" });
  } catch (error) {
    console.error("Erro ao parar os serviços do Docker:", error.message);
  }
}

function runPreRequisite(command) {
  try {
    console.log(`\n⚙️ Executando: ${command}...`);
    execSync(command, { stdio: "inherit" });
    return true;
  } catch (error) {
    console.error(`\n❌ Falha ao executar: ${command}`);
    return false;
  }
}

if (!runPreRequisite("npm run services:up")) {
  stopDockerServices();
  process.exit(1);
}

console.log(
  "\n🚀 Serviços prontos! Inicializando Next.js e Jest em modo WATCH...",
);

const testCommand =
  'concurrently --n next,jest --hide next --k --s command-jest "next dev" "jest --watchAll --runInBand --watchman=false"';

const testProcess = spawn(testCommand, {
  stdio: "inherit",
  shell: true,
});

let isShuttingDown = false;

function handleExit(exitCode) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  stopDockerServices();
  process.exit(exitCode);
}

testProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(
      `\n❌ A suíte de testes falhou ou fechou inesperadamente com código: ${code}`,
    );
    handleExit(code);
  } else {
    console.log("\n✅ Processo finalizado.");
    handleExit(0);
  }
});

process.on("SIGINT", () => {
  console.log("\n[Ctrl+C] Interrupção detectada pelo usuário.");
  handleExit(130);
});

process.on("SIGTERM", () => {
  handleExit(1);
});
