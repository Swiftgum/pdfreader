import { useGesture } from "@use-gesture/react";
import {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePDFPageContext } from "../pdf/page";

export const useDPR = () => {
  const [dpr, setDPR] = useState(
    !window ? 1 : Math.min(window.devicePixelRatio, 2),
  );

  useEffect(() => {
    if (!window) {
      return;
    }

    const handleDPRChange = () => {
      setDPR(window.devicePixelRatio);
    };

    const windowMatch = window.matchMedia(
      `screen and (min-resolution: ${dpr}dppx)`,
    );

    windowMatch.addEventListener("change", handleDPRChange);

    return () => {
      windowMatch.removeEventListener("change", handleDPRChange);
    };
  }, []);

  return dpr;
};

export const useVisibility = <T extends HTMLElement>({
  elementRef,
}: {
  elementRef: RefObject<T | null>;
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!elementRef.current) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    });

    observer.observe(elementRef.current);

    return () => {
      observer.disconnect();
    };
  }, [elementRef]);

  return { visible };
};

export interface ViewportContextType {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  setZoom: (zoom: number | ((prevZoom: number) => number)) => void;
  translateX: number;
  setTranslateX: (
    translateX: number | ((prevTranslateX: number) => number),
  ) => void;
  translateY: number;
  setTranslateY: (
    translateY: number | ((prevTranslateY: number) => number),
  ) => void;
  pages: Map<number, { containerRef: RefObject<HTMLDivElement> }>;
  visiblePages: Map<number, number>;
  setPageRef: (
    pageNumber: number,
    containerRef: RefObject<HTMLDivElement>,
  ) => void;
  setPageVisible: (pageNumber: number, percentageVisible: number) => void;
  currentPage: number;
  goToPage: (
    pageNumber: number,
    options?: {
      smooth?: boolean;
    },
  ) => boolean;
  setViewportRef: (ref: RefObject<HTMLDivElement>) => void;
}

export const defaultViewportContext = {
  zoom: 1,
  minZoom: 0.5,
  maxZoom: 10,
  setZoom: () => {
    throw new Error("Viewport context not initialized");
  },
  translateX: 0,
  setTranslateX: () => {
    throw new Error("Viewport context not initialized");
  },
  translateY: 0,
  setTranslateY: () => {
    throw new Error("Viewport context not initialized");
  },
  pages: new Map(),
  visiblePages: new Map(),
  currentPage: 1,
  setPageRef() {
    throw new Error("Viewport context not initialized");
  },
  setPageVisible() {
    throw new Error("Viewport context not initialized");
  },
  goToPage() {
    throw new Error("Viewport context not initialized");
  },
  setViewportRef() {
    throw new Error("Viewport context not initialized");
  },
} satisfies ViewportContextType;

export const ViewportContext = createContext<ViewportContextType>(
  defaultViewportContext,
);

interface ViewportProps {
  minZoom?: number;
  maxZoom?: number;
  defaultZoom?: number;
}

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const useViewportContext = ({
  minZoom = 0.5,
  maxZoom = 5,
  defaultZoom = 1,
}: ViewportProps): ViewportContextType => {
  /* ─── reactive state ─────────────────────────────────────────── */
  const [zoom, _setZoom]         = useState(defaultZoom);
  const [translateX, setTX]      = useState(0);
  const [translateY, setTY]      = useState(0);
  const [visiblePages, setVis]   = useState<Map<number, number>>(new Map());
  const [currentPage, setPage]   = useState(1);

  /* refs that never change after mount --------------------------- */
  const pagesRef     = useRef(
    new Map<number, { containerRef: RefObject<HTMLDivElement> }>(),
  );
  const viewportRef  = useRef<HTMLDivElement | null>(null);

  /* ─── helpers that update state -------------------------------- */
const setZoom = (z: number | ((p: number) => number)) =>
  _setZoom(prev => {
    const next = clamp(typeof z === "function" ? z(prev) : z, minZoom, maxZoom);
    return next === prev ? prev : next;
  });

  const setPageRef = (n: number, containerRef: RefObject<HTMLDivElement>) =>
    pagesRef.current.set(n, { containerRef });

/* ────── viewport hook (only the changed snippet) ────────────────── */
const setPageVisible = (n: number, percent: number) =>
  setVis(prev => {
    // 👉 nothing changed for that page
    if (prev.get(n) === percent) return prev;

    const next = new Map(prev).set(n, percent);

    const firstVisible = Math.min(
      ...[...next].filter(([, v]) => v > 0).map(([p]) => p),
    );

    if (firstVisible !== currentPage && firstVisible !== Infinity) {
      setPage(firstVisible);
    }

    return next;
  });


  const goToPage = (
    n: number,
    { smooth = true }: { smooth?: boolean } = {},
  ): boolean => {
    const page = pagesRef.current.get(n);
    const vp   = viewportRef.current;
    if (!page || !vp) return false;

    const vpRect   = vp.getBoundingClientRect();
    const pgRect   = page.containerRef.current!.getBoundingClientRect();

    vp.scrollTo({
      top:  Math.ceil(vp.scrollTop  + pgRect.top  - vpRect.top),
      left: Math.ceil(vp.scrollLeft + pgRect.left - vpRect.left),
      behavior: smooth ? "smooth" : "auto",
    });
    return true;
  };

  /* ─── stable context object (never re-created) ───────────────── */
  const ctx = useRef<ViewportContextType>({
    zoom, minZoom, maxZoom,
    setZoom,
    translateX, setTranslateX: setTX,
    translateY, setTranslateY: setTY,
    pages: pagesRef.current,
    visiblePages,
    setPageRef,
    setPageVisible,
    currentPage,
    goToPage,
    setViewportRef: (ref) => { viewportRef.current = ref.current; },
  }).current;

  /* ─── keep mutable fields up-to-date on every render ─────────── */
  ctx.zoom          = zoom;
  ctx.translateX    = translateX;
  ctx.translateY    = translateY;
  ctx.visiblePages  = visiblePages;
  ctx.currentPage   = currentPage;

  return ctx;
};


export const useViewport = () => {
  return useContext(ViewportContext);
};

export const useSize = () => {
  const [, setReady] = useState(false);
  const [size, setSize] = useState({
    width: 0,
    height: 0,
  });

  const ref = useRef<HTMLDivElement>(null);

  const updateSize = useCallback(() => {
    if (!ref.current) {
      return;
    }

    const { width, height } = ref.current.getBoundingClientRect();

    setSize({ width, height });
    setReady(true);
  }, [ref, setSize, setReady]);

  useEffect(() => {
    updateSize();

    const observer = new ResizeObserver(updateSize);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return {
    ref,
    size,
  };
};

const firstMemo = <T>(
  first: boolean,
  memo: unknown,
  initializer: () => T,
): T => {
  if (!first && !memo) {
    throw new Error(
      "Missing memo initialization. You likely forgot to return the result of `firstMemo` in the event function",
    );
  }

  if (first) {
    return initializer();
  }

  return memo! as T;
};

export const useViewportContainer = ({
  containerRef,
  elementWrapperRef,
  elementRef,
}: {
  containerRef: RefObject<HTMLDivElement>;
  elementWrapperRef: RefObject<HTMLDivElement>;
  elementRef: RefObject<HTMLDivElement>;
}) => {
  const [origin, setOrigin] = useState<[number, number]>([0, 0]);

  const { minZoom, maxZoom, setZoom, setViewportRef, zoom } = useViewport();

  useEffect(() => {
    setViewportRef(containerRef);
  }, []);

  const transformations = useRef<{
    translateX: number;
    translateY: number;
    zoom: number;
  }>({
    translateX: 0,
    translateY: 0,
    zoom: 1,
  });

  const updateTransform = useCallback(() => {
    if (
      !elementRef.current ||
      !containerRef.current ||
      !elementWrapperRef.current
    ) {
      return;
    }

    const { zoom, translateX, translateY } = transformations.current;

    elementRef.current.style.transform = `scale3d(${zoom}, ${zoom}, 1)`;

    const elementBoundingBox = elementRef.current.getBoundingClientRect();

    elementWrapperRef.current.style.width = `${elementBoundingBox.width}px`;
    elementWrapperRef.current.style.height = `${elementBoundingBox.height}px`;

    containerRef.current.scrollTop = translateY;
    containerRef.current.scrollLeft = translateX;

    setZoom(() => transformations.current.zoom);
  }, [containerRef, elementRef, setZoom, zoom, elementWrapperRef]);

  useEffect(() => {
    if (transformations.current.zoom === zoom || !containerRef.current) {
      return;
    }

    const dZoom = zoom / transformations.current.zoom;

    transformations.current = {
      translateX: containerRef.current.scrollLeft * dZoom,
      translateY: containerRef.current.scrollTop * dZoom,
      zoom,
    };

    updateTransform();
  }, [zoom, containerRef]);

  useEffect(() => {
    if (!elementRef.current || !elementWrapperRef.current) {
      return;
    }

    const callback = (entries: ResizeObserverEntry[]) => {
      if (!elementRef.current || !elementWrapperRef.current) {
        return;
      }

      const elementBoundingBox = entries[0];

      elementWrapperRef.current.style.width = `${elementBoundingBox.contentRect.width}px`;
      elementWrapperRef.current.style.height = `${elementBoundingBox.contentRect.height}px`;
    };

    const resizeObserver = new ResizeObserver(callback);

    resizeObserver.observe(elementRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [elementRef, elementWrapperRef]);

  useEffect(() => {
    updateTransform();
  }, []);

  useEffect(() => {
    const preventDefault = (e: TouchEvent) => e.preventDefault();

    // @ts-expect-error Could be null
    document.addEventListener("gesturestart", preventDefault);
    // @ts-expect-error Could be null
    document.addEventListener("gesturechange", preventDefault);

    return () => {
      // @ts-expect-error Could be null
      document.removeEventListener("gesturestart", preventDefault);
      // @ts-expect-error Could be null
      document.removeEventListener("gesturechange", preventDefault);
    };
  });

  useGesture(
    {
      onPinch: ({ origin, first, movement: [ms], memo }) => {
        const newMemo = firstMemo(first, memo, () => {
          const elementRect = elementRef.current!.getBoundingClientRect();
          const containerRect = containerRef.current!.getBoundingClientRect();

          const contentPosition: [number, number] = [
            origin[0] - elementRect.left,
            origin[1] - elementRect.top,
          ];

          const containerPosition: [number, number] = [
            origin[0] - containerRect.left,
            origin[1] - containerRect.top,
          ];

          setOrigin([
            contentPosition[0] / transformations.current.zoom,
            contentPosition[1] / transformations.current.zoom,
          ]);

          return {
            contentPosition,
            containerPosition,
            originZoom: transformations.current.zoom,
            originTranslate: transformations.current.translateY,
          };
        });

        const newZoom = clamp(ms * newMemo.originZoom, minZoom, maxZoom);

        const realMs = newZoom / newMemo.originZoom;

        const newTranslateX =
          newMemo.contentPosition[0] * realMs - newMemo.containerPosition[0];
        const newTranslateY =
          newMemo.contentPosition[1] * realMs - newMemo.containerPosition[1];

        transformations.current = {
          zoom: newZoom,
          translateX: newTranslateX,
          translateY: newTranslateY,
        };

        updateTransform();

        return newMemo;
      },
    },
    {
      target: containerRef,
    },
  );

  return {
    origin,
  };
};

export const usePageViewport = ({
  pageContainerRef,
  pageNumber,
}: {
  pageContainerRef: RefObject<HTMLDivElement>;
  pageNumber: number;
}) => {
  const { ready } = usePDFPageContext(pageNumber);
  const { visible } = useVisibility({ elementRef: pageContainerRef });
  const { setPageRef, setPageVisible } = useViewport();

  /* -------------------------------------------------------------
     1. Register the ref as soon as we have one (independent of ready)
     -------------------------------------------------------------*/
  useEffect(() => {
    if (!pageContainerRef.current) return;
    setPageRef(pageNumber, pageContainerRef);
  }, [pageNumber, pageContainerRef, setPageRef]);

  /* -------------------------------------------------------------
     2. Update visibility only when the page is decoded AND visible
     -------------------------------------------------------------*/
  useEffect(() => {
    if (!ready) return;                   // guard INSIDE the hook
    setPageVisible(pageNumber, visible ? 1 : 0);
  }, [ready, visible, pageNumber, setPageVisible]);
};
