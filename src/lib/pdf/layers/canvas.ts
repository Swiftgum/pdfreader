import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useLayoutEffect, useRef } from "react";

import { useDPR, useViewport, useVisibility } from "@/lib/viewport";

import { usePDFPage } from "../page";

export const useCanvasLayer = (onRendered?: (canvas: HTMLCanvasElement) => void) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { pdfPageProxy } = usePDFPage();
  const dpr = useDPR();
  const { visible } = useVisibility({ elementRef: canvasRef });
  const { zoom: bouncyZoom } = useViewport();
  const zoom = useDebounce(bouncyZoom, 100);
  const debouncedVisible = useDebounce(visible, 100);

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }

    const viewport = pdfPageProxy.getViewport({ scale: 1 });

    const canvas = canvasRef.current;

    const scale = debouncedVisible ? dpr * zoom : 0.5;

    canvas.height = viewport.height * scale;
    canvas.width = viewport.width * scale;

    canvas.style.height = `${viewport.height}px`;
    canvas.style.width = `${viewport.width}px`;

    const canvasContext = canvas.getContext("2d")!;
    canvasContext.scale(scale, scale);

    const renderingTask = pdfPageProxy.render({
      canvasContext: canvasContext,
      viewport,
    });

    renderingTask.promise.catch((error: Error) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.name === "RenderingCancelledException") {
        return;
      }

      throw error;
    });

    return () => {
      void renderingTask.cancel();
    };
  }, [pdfPageProxy, canvasRef.current, dpr, debouncedVisible, zoom]);


  /** ---------- callback handling ---------- */
  const cbRef = useRef<typeof onRendered>(() => {});
  // always keep the latest function in the ref
  useEffect(() => {
    cbRef.current = onRendered;
  }, [onRendered]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // fire once
    cbRef.current?.(canvas);

    // fire on every resize / zoom
    const ro = new ResizeObserver(() => cbRef.current?.(canvas));
    ro.observe(canvas);

    return () => ro.disconnect();
  }, []);                 // 👈 empty dependency array → runs once per canvas

  return { canvasRef };

  
    return { canvasRef };
};
