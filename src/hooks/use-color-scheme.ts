import { useState } from 'react';

let currentScheme: 'light' | 'dark' = 'light';
const listeners: Array<(scheme: 'light' | 'dark') => void> = [];

export function setColorScheme(scheme: 'light' | 'dark') {
  currentScheme = scheme;
  listeners.forEach((listener) => listener(scheme));
}

export function useColorScheme(): 'light' | 'dark' {
  const [scheme, setScheme] = useState<'light' | 'dark'>(currentScheme);

  if (!listeners.includes(setScheme)) {
    listeners.push(setScheme);
  }

  return scheme;
}
