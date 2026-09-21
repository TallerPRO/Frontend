// UUID determinístico (v5-like, SHA-1 sobre un namespace fijo) para derivar el
// clienteId que exige ms-tallerpro-jobs a partir del correo del cliente: el mismo
// correo siempre produce el mismo id, sin necesidad de un maestro de clientes.
const NAMESPACE = 'tallerpro-cliente:';

export async function uuidFromString(value: string): Promise<string> {
  const data = new TextEncoder().encode(NAMESPACE + value.trim().toLowerCase());
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-1', data));
  hash[6] = (hash[6] & 0x0f) | 0x50; // versión 5
  hash[8] = (hash[8] & 0x3f) | 0x80; // variante RFC 4122
  const hex = Array.from(hash.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
