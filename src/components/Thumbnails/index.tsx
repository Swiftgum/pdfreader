import { usePDFDocument } from "@/lib/pdf/document";
import { useThumbnail } from "@/lib/pdf/thumbnail";
import { useViewport } from "@/lib/viewport";
import {
  cloneElement,
  HTMLProps,
  ReactElement,
  RefObject,
  useEffect,
  useState,
} from "react";
import { Primitive } from "../Primitive";
import clsx from "clsx";

/* ------------------------------------------------------------------ */
/*  Single thumbnail                                                   */
/* ------------------------------------------------------------------ */
export const Thumbnail = ({
  pageNumber = 1,
  className,
  style,
  ...props
}: HTMLProps<HTMLCanvasElement> & { pageNumber?: number }) => {
  const { canvasRef } = useThumbnail(pageNumber);          // <RefObject<HTMLCanvasElement>>
  const { goToPage } = useViewport();
  const [ready, setReady] = useState(false);               // becomes true after PDF.js draws

  /* detect first paint ------------------------------------------------ */
  useEffect(() => {
    const node = (canvasRef as RefObject<HTMLCanvasElement>).current;
    if (!node || ready) return;

    const mo = new MutationObserver(() => {
      setReady(true);                                      // shimmer → real bitmap
      mo.disconnect();
    });
    mo.observe(node, { childList: true, subtree: true });

    return () => mo.disconnect();
  }, [canvasRef, ready]);

  /* fallback size for the skeleton — you can tweak these numbers */
  const thumbW = 96;
  const thumbH = 136; // ≈ A-series aspect (1.414)

  return (
    <Primitive.canvas
      {...props}
      ref={canvasRef as RefObject<HTMLCanvasElement>}       // real ref for PDF.js
      role="button"
      tabIndex={0}
      className={clsx(className, !ready && "pdf-skeleton rounded-[2px]")}
      style={{
        width: !ready ? thumbW : undefined,
        height: !ready ? thumbH : undefined,
        ...style,
      }}
      onClick={(e: React.MouseEvent<HTMLCanvasElement>) => {
        props.onClick?.(e);
        goToPage(pageNumber, { smooth: false });
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLCanvasElement>) => {
        props.onKeyDown?.(e);
        e.key === "Enter" && goToPage(pageNumber, { smooth: false });
      }}
    />
  );
};

/* ------------------------------------------------------------------ */
/*  Sidebar list of thumbnails                                         */
/* ------------------------------------------------------------------ */
export const Thumbnails = ({
  children,
  ...props
}: HTMLProps<HTMLDivElement> & {
  children: ReactElement<
    HTMLProps<HTMLCanvasElement> & { pageNumber?: number }
  >;
}) => {
  const { pdfDocumentProxy } = usePDFDocument();
  const [pageCount, setPageCount] = useState<number>(0);

  /* update count when the document arrives */
  useEffect(() => {
    if (pdfDocumentProxy) {
      setPageCount(pdfDocumentProxy.numPages);
    }
  }, [pdfDocumentProxy]);

  return (
    <Primitive.div {...props}>
      {Array.from({ length: pageCount }).map((_, index) =>
        cloneElement(children, { key: index, pageNumber: index + 1 }),
      )}
    </Primitive.div>
  );
};
