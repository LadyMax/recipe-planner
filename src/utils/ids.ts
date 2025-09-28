export function uuid() {
  const g = (globalThis as any);
  return g.crypto?.randomUUID ? g.crypto.randomUUID() : Math.random().toString(36).slice(2);
}
