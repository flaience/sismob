/**
 * Transforma nomes de arquivos complexos em nomes seguros para a nuvem.
 * Remove acentos, caracteres especiais e substitui espaços por underscores.
 */
export function sanitizeFileName(originalName: string): string {
  return originalName
    .normalize('NFD') // Decompõe caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remove os acentos
    .replace(/[^\w\s.-]/g, '') // Remove caracteres especiais (parênteses, etc)
    .replace(/\s+/g, '_') // Substitui espaços por _
    .toLowerCase(); // Opcional: mantém tudo em minúsculo para padrão de URL
}
