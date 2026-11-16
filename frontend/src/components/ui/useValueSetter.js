// A "set this field's value" function that stays the same between renders (Batch 5). The Listen /
// Speak row uses it to write a spoken value through the control's own onChange, and because it does
// not change on every keystroke, the rows of the other fields do not re-render while someone types.
import { useCallback, useEffect, useRef } from 'react';

export function useValueSetter(onChange, name) {
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });
  return useCallback((value) => latest.current?.({ target: { name, value }, currentTarget: { name, value } }), [name]);
}
