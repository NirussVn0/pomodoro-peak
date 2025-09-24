export interface TimePort {
  now(): number;
}

export const systemTime: TimePort = {
  now: () => Date.now(),
};
