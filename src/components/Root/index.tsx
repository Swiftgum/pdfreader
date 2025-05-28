/* ------------------------------------------------------------------
   src/components/Root/index.tsx
   ------------------------------------------------------------------ */

   import {
    /* document helpers */
    usePDFDocumentParams,
    usePDFDocumentContext,
    PDFDocumentContext,
  } from "@/lib/pdf/document";
  import {
    /* link-service helpers */
    useCreatePDFLinkService,
    PDFLinkServiceContext,
  } from "@/lib/pdf/links";
  import {
    /* viewport helpers */
    useViewportContext,
    ViewportContext,
  } from "@/lib/viewport";
  
  import type { ForwardedRef, HTMLProps, ReactNode } from "react";
  import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
  import { Primitive } from "../Primitive";
  
  /* ─── public types ──────────────────────────────────────────────── */
  export interface PDFReaderProps
    extends HTMLProps<HTMLDivElement>,
      usePDFDocumentParams {
    loader?: ReactNode;               // optional custom loader
    initialPage?: number;             // 1-based; default = 1
    onReady?: () => void;             // fires once when first page shown
  }
  
  export interface PDFReaderHandle {
    scrollToPage(page: number, opts?: { smooth?: boolean }): void;
  }
  
  /* ─── component ─────────────────────────────────────────────────── */
  export const Root = forwardRef<PDFReaderHandle, PDFReaderProps>(
    (
      {
        children,
        fileURL,
        loader,
        initialPage = 1,
        onReady,
        ...divProps
      },
      ref: ForwardedRef<PDFReaderHandle>,
    ) => {
      /* load the document ------------------------------------------- */
      const { ready, context, pdfDocumentProxy } = usePDFDocumentContext({
        fileURL,
      });
  
      /* viewport & link services ------------------------------------ */
      const viewportContext = useViewportContext({});          // ↺ hook
      const linkService = useCreatePDFLinkService(
        pdfDocumentProxy,
        viewportContext,
      );
  
      /* expose imperative API --------------------------------------- */
      useImperativeHandle(
        ref,
        () => ({
          scrollToPage: (page, opts = { smooth: true }) =>
            viewportContext.goToPage?.(page, opts),
        }),
        [viewportContext],
      );
  
      /* jump to the requested page once, then signal ready ---------- */
      useEffect(() => {
        if (!ready) return;
  
        const safePage =
          initialPage < 1
            ? 1
            : initialPage > pdfDocumentProxy!.numPages
            ? pdfDocumentProxy!.numPages
            : initialPage;
  
        viewportContext.goToPage?.(safePage, { smooth: false });
        onReady?.();                         // notify parent exactly once
        // ↓ intentionally *not* listing viewportContext here
      }, [ready, initialPage, pdfDocumentProxy, onReady]);
  
      /* render ------------------------------------------------------- */
      const divRef = useRef<HTMLDivElement>(null);
  
      if (!ready) {
        return loader ? (
          <Primitive.div ref={divRef} {...divProps}>
            {loader}
          </Primitive.div>
        ) : null;
      }
  
      return (
        <Primitive.div ref={divRef} {...divProps}>
          <PDFDocumentContext.Provider value={context}>
            <ViewportContext.Provider value={viewportContext}>
              <PDFLinkServiceContext.Provider value={linkService}>
                {children}
              </PDFLinkServiceContext.Provider>
            </ViewportContext.Provider>
          </PDFDocumentContext.Provider>
        </Primitive.div>
      );
    },
  );
  
  Root.displayName = "PDFReader.Root";
  