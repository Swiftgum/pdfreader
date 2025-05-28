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
  
  /* ------------------------------------------------------------------ */
  /*  Public types & props                                              */
  /* ------------------------------------------------------------------ */
  
  /** External props (unchanged) */
  export interface PDFReaderProps
    extends HTMLProps<HTMLDivElement>,
      usePDFDocumentParams {
    /** Replace the default loader while the file is fetched.            */
    /** If omitted, nothing at all is rendered until the document is ready. */
    loader?: ReactNode;
    /** Page to show as soon as the PDF is ready (1-based, default = 1) */
    initialPage?: number;
    onReady?: () => void;
  }
  
  /** What callers can do with `ref` */
  export interface PDFReaderHandle {
    /**
     * Scroll to a 1-based page.
     * @param page  1 … numPages
     * @param opts  `{ smooth?: boolean }`  (default = `true`)
     */
    scrollToPage(page: number, opts?: { smooth?: boolean }): void;
  }
  
  /* ------------------------------------------------------------------ */
  /*  Component                                                         */
  /* ------------------------------------------------------------------ */
  
  export const Root = forwardRef<PDFReaderHandle, PDFReaderProps>(
    (
      {
        children,
        fileURL,
        loader,
        initialPage = 1,
        ...props
      },
      ref: ForwardedRef<PDFReaderHandle>,
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
  
      /* ---------- DOM ref (for styling, not exposed) ----------------- */
      const divRef = useRef<HTMLDivElement>(null);
  
      /* ---------- imperative handle ---------------------------------- */
      useImperativeHandle(
        ref,
        () => ({
          scrollToPage: (page: number, opts = { smooth: true }) => {
            viewportContext.goToPage?.(page, opts);
          },
        }),
        [viewportContext],
      );
  
      /* ---------- once ready → jump to requested page ---------------- */
      useEffect(() => {
        if (!ready) return;
  
        // clamp to valid range
        const safePage =
          initialPage < 1
            ? 1
            : initialPage > pdfDocumentProxy!.numPages
            ? pdfDocumentProxy!.numPages
            : initialPage;
  
        viewportContext.goToPage?.(safePage, { smooth: false });
        props.onReady?.();
      }, [ready, initialPage, viewportContext, pdfDocumentProxy]);
  
      /* ---------- render --------------------------------------------- */
      // 1 ▸ Still loading and caller provided a loader ➜ wrap it
      if (!ready) {
        return loader ? (
          <Primitive.div ref={divRef} {...props}>
            {loader}
          </Primitive.div>
        ) : null; // 2 ▸ Still loading & *no* loader ➜ render nothing
      }
  
      // 3 ▸ Document ready ➜ normal render path
      return (
        <Primitive.div ref={divRef} {...props}>
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
  