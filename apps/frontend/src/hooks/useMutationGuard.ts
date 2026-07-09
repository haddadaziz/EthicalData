"use client";

import { useRef, useCallback } from 'react';

export function useMutationGuard(cooldownMs: number = 1000) {
  const lockedRef = useRef(false);

  const guard = useCallback(async <T>(fn: () => Promise<T>): Promise<T | undefined> => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    try {
      return await fn();
    } finally {
      setTimeout(() => { lockedRef.current = false; }, cooldownMs);
    }
  }, [cooldownMs]);

  return { guard, isLocked: lockedRef };
}
