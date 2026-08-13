// Crockford Base32, excluding the ambiguous I, L, O, U. Length 32 — a byte
// modulo 32 is therefore bias-free (256 is an exact multiple of 32).
export const TICKET_CODE_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
export const TICKET_CODE_LENGTH = 8;

/**
 * A short, human-readable ticket code: the QR payload and the manual
 * check-in fallback. Uppercase, no separator. Uniqueness is enforced by the
 * `ticket_code_uidx` index; callers dedupe within a batch.
 */
export function generateTicketCode(): string {
  const bytes = new Uint8Array(TICKET_CODE_LENGTH);
  crypto.getRandomValues(bytes);
  let code = '';
  for (let i = 0; i < TICKET_CODE_LENGTH; i++) {
    code += TICKET_CODE_ALPHABET[bytes[i]! % TICKET_CODE_ALPHABET.length];
  }
  return code;
}

/**
 * Normalizes user-typed input (lowercase, dashes, spaces) to the stored form
 * so `r7k2-9qx4` and `R7K2 9QX4` both resolve to `R7K29QX4`.
 */
export function normalizeTicketCode(input: string): string {
  return input.toUpperCase().replace(/[^0-9A-Z]/g, '');
}
