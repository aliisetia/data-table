import { useRef, useEffect } from "react";

export const usePreviousState = <T>(value: T): T => {
  const ref = useRef<T>(value);

  useEffect(() => {
    setTimeout(() => {
      ref.current = value;
    }, 500);
  });

  return ref.current;
};
