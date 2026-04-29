"use strict";
/**
 * Transforma nomes de arquivos complexos em nomes seguros para a nuvem.
 * Remove acentos, caracteres especiais e substitui espaços por underscores.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFileName = sanitizeFileName;
//src/comon/utils/file-utils.ts
function sanitizeFileName(originalName) {
    return originalName
        .normalize('NFD') // Decompõe caracteres acentuados
        .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
        .replace(/[^\w\s.-]/g, '') // Remove caracteres especiais (parênteses, etc)
        .replace(/\s+/g, '_') // Substitui espaços por _
        .toLowerCase(); // Opcional: mantém tudo em minúsculo para padrão de URL
}
