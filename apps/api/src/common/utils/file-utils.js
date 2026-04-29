"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeFileName = sanitizeFileName;
/**
 * Sanitiza nomes de arquivos para evitar erros no Supabase Storage
 */
function sanitizeFileName(originalName) {
    return originalName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s.-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '_') // Troca espaços por _
        .toLowerCase();
}
