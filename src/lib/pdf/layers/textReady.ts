// src/lib/pdf/layers/textReady.ts
import { useEffect, useState, RefObject } from "react";

export const useTextReady = (ref: RefObject<HTMLDivElement>) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* Text layer is empty at first; PDF.js inserts many <span>s */
     const mo = new MutationObserver(() => {
         if (node.childElementCount === 0) return;
     
         /* <span> elements arrived – wait 300 ms so the user sees the shimmer */
         const id = setTimeout(() => setReady(true), 300);
         mo.disconnect();
     return () => clearTimeout(id);
     });
    mo.observe(node, { childList: true });

    return () => mo.disconnect();
  }, [ref]);

  return ready;
};
