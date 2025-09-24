export interface UuidPort {
  generate(): string;
}

export const uuidFromCrypto: UuidPort = {
  generate: () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : selfCryptoFallback()),
};

const selfCryptoFallback = (): string => {
  const random = Math.random().toString(16).slice(2, 10);
  const timestamp = Date.now().toString(16);
  return `${timestamp}-${random}`;
};
