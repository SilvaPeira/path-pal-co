// Validadores BR (CPF, CEP, telefone) e máscaras simples
export function onlyDigits(v: string) {
  return (v || "").replace(/\D/g, "");
}

export function isValidCPF(cpf: string): boolean {
  const s = onlyDigits(cpf);
  if (s.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(s[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(s[i]) * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  return d2 === parseInt(s[10]);
}

export function maskCPF(v: string) {
  const s = onlyDigits(v).slice(0, 11);
  return s
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

export function maskPhone(v: string) {
  const s = onlyDigits(v).slice(0, 11);
  if (s.length <= 10) {
    return s.replace(/^(\d{0,2})(\d{0,4})(\d{0,4}).*/, (_, a, b, c) =>
      [a && `(${a}`, a && a.length === 2 ? ") " : "", b, c && `-${c}`].filter(Boolean).join(""),
    );
  }
  return s.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
}

export function maskCEP(v: string) {
  const s = onlyDigits(v).slice(0, 8);
  return s.replace(/^(\d{5})(\d)/, "$1-$2");
}

export function isValidCEP(cep: string) {
  return onlyDigits(cep).length === 8;
}

export function isValidPhoneBR(phone: string) {
  const s = onlyDigits(phone);
  return s.length === 10 || s.length === 11;
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
