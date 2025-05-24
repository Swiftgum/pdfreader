import { useDebounce } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

import { useDPR, useViewport, useVisibility } from "@/lib/viewport";

import { usePDFPage } from "../page";

export const useCanvasLayer = () => {
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

    /** `render()` has finished – return the canvas to the caller */
  const onRenderSuccess = (cb?: (canvas: HTMLCanvasElement) => void) => {
    if (!cb) return;
    const canvas = canvasRef.current;
    if (canvas) cb(canvas);
  };

  return { canvasRef, onRenderSuccess };
};
