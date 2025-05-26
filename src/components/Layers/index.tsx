/* src/components/Layers/index.tsx */
import clsx from "clsx";
import type { HTMLProps, JSX } from "react";

import { useCanvasLayer } from "@/lib/pdf/layers/canvas";
import { useAnnotationLayer } from "@/lib/pdf/layers/annotation";
import { useTextLayer } from "@/lib/pdf/layers/text";
import { useTextReady } from "@/lib/pdf/layers/textReady";
import { usePDFPage } from "@/lib/pdf/page";

/* ------------------------------------------------------------------ */
/*  Canvas                                                            */
/* ------------------------------------------------------------------ */
export const CanvasLayer = ({
  onRenderSuccess,
  style,
  ...props
}: HTMLProps<HTMLCanvasElement> & {
  onRenderSuccess?: (canvas: HTMLCanvasElement) => void;
}) => {
  const { canvasRef } = useCanvasLayer(onRenderSuccess);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", top: 0, left: 0, ...style }}
      {...props}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Annotation                                                        */
/* ------------------------------------------------------------------ */
export const AnnotationLayer = ({
  renderForms = true,
  className,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & { renderForms?: boolean }) => {
  const { annotationLayerRef } = useAnnotationLayer({ renderForms });

  return (
    <div
      ref={annotationLayerRef}
      className={clsx("annotationLayer", className)}
      style={{ position: "absolute", inset: 0, ...style }}
      {...props}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Text with skeleton                                                */
/* ------------------------------------------------------------------ */
export const TextLayer = ({
  className,
  style,
  ...props
}: HTMLProps<HTMLDivElement>) => {
  const { textContainerRef } = useTextLayer();
  const ready = useTextReady(textContainerRef);

  return (
    <>
      {/* real selectable text */}
      <div
        ref={textContainerRef}
        className={clsx("textLayer", className)}
        style={{ position: "absolute", inset: 0, ...style }}
        {...props}
      />

      {/* shimmering lines until PDF.js populates the layer */}
      {!ready && (
        <div className="absolute inset-0 p-6 space-y-2 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="pdf-text-skeleton"
              style={{ width: `${90 - i * 5}%` }}
            />
          ))}
        </div>
      )}
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  CustomLayer helper                                                */
/* ------------------------------------------------------------------ */
export const CustomLayer = ({
  children,
}: {
  children: (pageNumber: number) => JSX.Element;
}) => {
  const { pageNumber } = usePDFPage();
  return children(pageNumber);
};
