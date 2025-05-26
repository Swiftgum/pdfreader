import { usePDFPageContext, PDFPageContext } from "@/lib/pdf/page";
import { usePageViewport } from "@/lib/viewport";
import { HTMLProps, ReactNode, useRef, RefObject } from "react";
import { Primitive } from "../Primitive";

export const Page = ({
  children,
  pageNumber = 1,
  style,
  ...props
}: HTMLProps<HTMLDivElement> & { children: ReactNode; pageNumber?: number }) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const { ready, context } = usePDFPageContext(pageNumber);

  usePageViewport({
    pageContainerRef: pageContainerRef as RefObject<HTMLDivElement>,
    pageNumber,
  });

  /* fallback A-series ratio for the shimmer */
  const fallbackW = 240;
  const fallbackH = Math.round(fallbackW * 1.414);

  /* only touch pdfPageProxy *after* it’s ready */
  const view = ready ? context.pdfPageProxy.view : [0, 0, fallbackW, fallbackH];
  const [x0, , x1, y1] = view;
  const pageWidth = x1 - x0;
  const pageHeight = y1;

  return (
    <PDFPageContext.Provider value={context}>
      <Primitive.div ref={pageContainerRef}
        className={!ready ? "flex items-center justify-center" : undefined}
>
        {/** ---------- LOADING ---------- */}
        {!ready && (
          <div
            className="pdf-skeleton rounded-[2px]"
            style={{ width: pageWidth, height: pageHeight }}
          />
        )}

        {/** ---------- REAL PAGE ---------- */}
        {ready && (
          <div
            {...props}
            style={{
              ...(style as React.CSSProperties),
              position: "relative",
              width: pageWidth,
              height: pageHeight,
              ["--scale-factor" as any]: 1,
            }}
          >
            {children}
          </div>
        )}
      </Primitive.div>
    </PDFPageContext.Provider>
  );
};

