const fs = require("fs");
const path = require("path");

// Nome do arquivo final de saída
const ARQUIVO_SAIDA = path.join(__dirname, "contexto-sismob.txt");

// Pastas que queremos mapear no Monorepo
const DIRETORIOS_ALVO = [
  "packages/database", // Seus schemas do Drizzle
  "apps/api/src", // Seu backend NestJS 11
  // 'apps/web/src'    // Descomente se quiser enviar o Next.js 15 junto
];

// Extensões de arquivos de código permitidas
const EXTENSOES_PERMITIDAS = [".ts", ".tsx", ".js", ".jsx", ".json", ".md"];

// Pastas que o script DEVE ignorar completamente
const PASTAS_IGNORADAS = ["node_modules", ".turbo", "dist", ".next", "build"];

let conteudoFinal = `=== CONTEXTO DE ARQUITETURA SISMOB v2.0 ===\n\n`;

function lerDiretorio(diretorioAtual) {
  if (!fs.existsSync(diretorioAtual)) return;

  const arquivos = fs.readdirSync(diretorioAtual);

  arquivos.forEach((arquivo) => {
    const caminhoCompleto = path.join(diretorioAtual, arquivo);
    const estatisticas = fs.statSync(caminhoCompleto);
    const nomeBase = path.basename(caminhoCompleto);

    if (estatisticas.isDirectory()) {
      if (!PASTAS_IGNORADAS.includes(nomeBase)) {
        lerDiretorio(caminhoCompleto);
      }
    } else {
      const extensao = path.extname(caminhoCompleto);
      if (EXTENSOES_PERMITIDAS.includes(extensao)) {
        // Caminho relativo para a IA entender onde o arquivo mora no Monorepo
        const caminhoRelativo = path.relative(__dirname, caminhoCompleto);

        conteudoFinal += `\n\n/* =========================================================================\n`;
        conteudoFinal += `   ARQUIVO: ${caminhoRelativo}\n`;
        conteudoFinal += `   ========================================================================= */\n\n`;

        conteudoFinal += fs.readFileSync(caminhoCompleto, "utf-8");
      }
    }
  });
}

console.log("⏳ Analisando a estrutura do Sismob...");
DIRETORIOS_ALVO.forEach((diretorio) => {
  const caminhoAbsoluto = path.join(__dirname, diretorio);
  lerDiretorio(caminhoAbsoluto);
});

fs.writeFileSync(ARQUIVO_SAIDA, conteudoFinal, "utf-8");
console.log(`✅ Sucesso! Arquivo gerado em: ${ARQUIVO_SAIDA}`);
