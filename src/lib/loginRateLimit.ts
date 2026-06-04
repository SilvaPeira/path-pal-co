// Bloqueio temporário client-side após 3 tentativas inválidas em 5 minutos.
// Observação: validação real de rate limit precisa de infra dedicada no servidor.
// Esta é uma proteção de UX/básica por email, armazenada em localStorage.

const WINDOW_MS = 5 * 60 * 1000; // 5 minutos
const MAX_ATTEMPTS = 3;

function key(email: string) {
  return `agiotec_login_attempts_${email.toLowerCase().trim()}`;
}

function read(email: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key(email));
    if (!raw) return [];
    const arr = JSON.parse(raw) as number[];
    return Array.isArray(arr) ? arr.filter((t) => Date.now() - t < WINDOW_MS) : [];
  } catch {
    return [];
  }
}

function write(email: string, attempts: number[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key(email), JSON.stringify(attempts));
}

export function getBlockInfo(email: string): { blocked: boolean; remainingSec: number; attempts: number } {
  const attempts = read(email);
  if (attempts.length < MAX_ATTEMPTS) {
    return { blocked: false, remainingSec: 0, attempts: attempts.length };
  }
  const oldest = Math.min(...attempts);
  const remainingMs = WINDOW_MS - (Date.now() - oldest);
  if (remainingMs <= 0) {
    write(email, []);
    return { blocked: false, remainingSec: 0, attempts: 0 };
  }
  return { blocked: true, remainingSec: Math.ceil(remainingMs / 1000), attempts: attempts.length };
}

export function recordFailedAttempt(email: string) {
  const attempts = read(email);
  attempts.push(Date.now());
  write(email, attempts);
}

export function clearAttempts(email: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key(email));
}
