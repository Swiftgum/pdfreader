/* ------------------------------------------------------------------
   src/components/Root/index.tsx
   ------------------------------------------------------------------ */
   import {
    usePDFDocumentParams,
    usePDFDocumentContext,
    PDFDocumentContext,
  } from "@/lib/pdf/document";
  import {
    useCreatePDFLinkService,
    PDFLinkServiceContext,
  } from "@/lib/pdf/links";
  import {
    useViewportContext,
    ViewportContext,
  } from "@/lib/viewport";
  
  import type { ForwardedRef, HTMLProps, ReactNode } from "react";
  import { forwardRef, useEffect } from "react";
  import { Primitive } from "../Primitive";
  
  /* ------------------------------------------------------------------ */
  /*  Public props                                                      */
  /* ------------------------------------------------------------------ */
  export interface PDFReaderProps
    extends HTMLProps<HTMLDivElement>,
      usePDFDocumentParams {
    /** Replace the default "Loading…" markup while the file is fetched  */
    loader?: ReactNode;
    /** Page to show as soon as the PDF is ready (1-based, default = 1)  */
    initialPage?: number;
  }
  
  /* ------------------------------------------------------------------ */
  /*  Component                                                         */
  /* ------------------------------------------------------------------ */
  export const Root = forwardRef<HTMLDivElement, PDFReaderProps>(
    (
      {
        children,
        fileURL,
        loader,
        initialPage = 1,
        ...props
      },
      ref: ForwardedRef<HTMLDivElement>,
    ) => {
      /* ---------- load the document ---------------------------------- */
      const { ready, context, pdfDocumentProxy } = usePDFDocumentContext({
        fileURL,
      });
  
      /* ---------- viewport & links services -------------------------- */
      const viewportContext = useViewportContext({});
      const linkService = useCreatePDFLinkService(
        pdfDocumentProxy,
        viewportContext,
      );
  
      /* ---------- once ready → jump to requested page ---------------- */
      useEffect(() => {
        if (!ready) return;
  
        // guard against out-of-range values
        const safePage =
          initialPage < 1
            ? 1
            : initialPage > pdfDocumentProxy!.numPages
              ? pdfDocumentProxy!.numPages
              : initialPage;
  
        viewportContext.goToPage?.(safePage, { smooth: false });
      }, [ready, initialPage, viewportContext, pdfDocumentProxy]);
  
      /* ---------- render --------------------------------------------- */
      return (
        <Primitive.div ref={ref} {...props}>
          {ready ? (
            <PDFDocumentContext.Provider value={context}>
              <ViewportContext.Provider value={viewportContext}>
                <PDFLinkServiceContext.Provider value={linkService}>
                  {children}
                </PDFLinkServiceContext.Provider>
              </ViewportContext.Provider>
            </PDFDocumentContext.Provider>
          ) : (
            /* fallback skeleton if caller didn't supply one ------------- */
            loader ?? (
              <div className="grid place-items-center h-full">
                <div
                  className="pdf-skeleton rounded-[2px]"
                  style={{ width: 240, height: 240 * 1.414 }}
                />
              </div>
            )
          )}
        </Primitive.div>
      );
    },
  );
  
  Root.displayName = "PDFReader.Root";
  