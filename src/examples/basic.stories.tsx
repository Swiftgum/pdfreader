// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/react";

import {
  AnnotationLayer,
  CanvasLayer,
  CurrentPage,
  CustomLayer,
  Outline,
  OutlineChildItems,
  OutlineItem,
  Page,
  Pages,
  Root,
  TextLayer,
  Thumbnail,
  Thumbnails,
  Viewport,
} from "@/components";
import { CurrentZoom, ZoomIn, ZoomOut } from "@/components/Controls/Zoom";
import { useCallback, useEffect, useState } from "react";
import clsx from "clsx";
import { usePDFDocumentParams } from "@/lib/pdf/document";
import { HTMLProps, ReactNode } from "react";

type RootComponentProps = HTMLProps<HTMLDivElement> & usePDFDocumentParams & {
  loader?: ReactNode;
};

const meta = {
  title: "Viewer",
  component: Root,
} satisfies Meta<typeof Root>;

export default meta;

type Story = StoryObj<typeof Root>;

export const Basic: Story = {
  render: () => (
    <Root
      fileURL="brochure.pdf"
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  )
};

export const WithTextLayer: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithInternalLinks: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithAnnotationLayer: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithFormControls: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "form.pdf",
  },
};

export const WithPageControl: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px] flex flex-col justify-stretch"

    >
      <div className="bg-gray-100 border-b p-1 flex items-center justify-center text-sm text-gray-600 gap-2">
        Page
        <CurrentPage className="bg-white rounded-full px-3 py-1 border text-center" />
      </div>
      <Viewport className="p-4">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithZoomControl: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px] flex flex-col justify-stretch"

    >
      <div className="bg-gray-100 border-b p-1 flex items-center justify-center text-sm text-gray-600 gap-2">
        Zoom
        <ZoomOut className="px-3 py-1 -mr-2 text-gray-900">-</ZoomOut>
        <CurrentZoom className="bg-white rounded-full px-3 py-1 border text-center w-16" />
        <ZoomIn className="px-3 py-1 -ml-2 text-gray-900">+</ZoomIn>
      </div>
      <Viewport className="p-4">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <TextLayer />
            <AnnotationLayer />
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithOutline: Story = {
  render: ({ fileURL }: { fileURL: string }) => {
    const [showOutline, setShowOutline] = useState(true);

    return (
      <Root
        fileURL={fileURL}
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px] flex flex-col justify-stretch"
  
      >
        <div className="bg-gray-100 border-b p-1 flex items-center justify-center text-sm text-gray-600 gap-2">
          <button
            onClick={() => setShowOutline((showOutline) => !showOutline)}
            className="px-2 hover:bg-gray-300 hover:text-gray-900 py-1 rounded-full"
          >
            {showOutline ? "Hide" : "Show"} Outline
          </button>
          <span className="flex-grow" />
          Page
          <CurrentPage className="bg-white rounded-full px-3 py-1 border text-center" />
          Zoom
          <ZoomOut className="px-3 py-1 -mr-2 text-gray-900">-</ZoomOut>
          <CurrentZoom className="bg-white rounded-full px-3 py-1 border text-center w-16" />
          <ZoomIn className="px-3 py-1 -ml-2 text-gray-900">+</ZoomIn>
          <span className="flex-grow" />
        </div>
        <div
          className={clsx(
            "basis-0 grow min-h-0 relative grid",
            "transition-all duration-300",
            showOutline ? "grid-cols-[24rem,1fr]" : "grid-cols-[0,1fr]",
          )}
        >
          <div className="overflow-y-auto">
            <div className="w-96 overflow-x-auto">
              <Outline className="border-r overflow-auto p-3">
                <OutlineItem className="text-sm [&>a]:py-1 [&>a]:block [&>a:hover]:underline">
                  <OutlineChildItems className="pl-4" />
                </OutlineItem>
              </Outline>
            </div>
          </div>
          <Viewport className="p-4 h-full">
            <Pages>
              <Page className="my-4">
                <CanvasLayer />
                <TextLayer />
                <AnnotationLayer />
              </Page>
            </Pages>
          </Viewport>
        </div>
      </Root>
    );
  },
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithThumbnails: Story = {
  render: ({ fileURL }: { fileURL: string }) => {
    const [showThumbnails, setShowThumbnails] = useState(true);

    return (
      <Root
        fileURL={fileURL}
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px] flex flex-col justify-stretch"
  
      >
        <div className="bg-gray-100 border-b p-1 flex items-center justify-center text-sm text-gray-600 gap-2">
          <button
            onClick={() => setShowThumbnails((showOutline) => !showOutline)}
            className="px-2 hover:bg-gray-300 hover:text-gray-900 py-1 rounded-full"
          >
            {showThumbnails ? "Hide" : "Show"} Thumbnails
          </button>
          <span className="flex-grow" />
          Page
          <CurrentPage className="bg-white rounded-full px-3 py-1 border text-center" />
          Zoom
          <ZoomOut className="px-3 py-1 -mr-2 text-gray-900">-</ZoomOut>
          <CurrentZoom className="bg-white rounded-full px-3 py-1 border text-center w-16" />
          <ZoomIn className="px-3 py-1 -ml-2 text-gray-900">+</ZoomIn>
          <span className="flex-grow" />
        </div>
        <div
          className={clsx(
            "basis-0 grow min-h-0 relative grid",
            "transition-all duration-300",
            showThumbnails ? "grid-cols-[24rem,1fr]" : "grid-cols-[0,1fr]",
          )}
        >
          <div className="overflow-y-auto overflow-x-hidden">
            <div className="w-96 overflow-x-hidden">
              <Thumbnails className="flex flex-col gap-4 items-center py-4">
                <Thumbnail className="transition-all w-48 hover:shadow-lg hover:outline hover:outline-gray-300" />
              </Thumbnails>
            </div>
          </div>
          <Viewport className="p-4 h-full">
            <Pages>
              <Page className="my-4">
                <CanvasLayer />
                <TextLayer />
                <AnnotationLayer />
              </Page>
            </Pages>
          </Viewport>
        </div>
      </Root>
    );
  },
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithCustomLayer: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <Root
      fileURL={fileURL}
      className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"

    >
      <Viewport className="p-4 h-full">
        <Pages>
          <Page className="my-4">
            <CanvasLayer />
            <CustomLayer>
              {(pageNumber) => {
                return (
                  <div className="relative">
                    <p className="bg-white border p-2">
                      This is page {pageNumber}
                    </p>
                  </div>
                );
              }}
            </CustomLayer>
          </Page>
        </Pages>
      </Viewport>
    </Root>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithCustomFormLayer: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as any);
        const values = Object.fromEntries(formData.entries());

        alert(`Form values:\n${JSON.stringify(values, null, 2)}`);
      }}
    >
      <button type="submit">Get form values</button>
      <Root
        fileURL={fileURL}
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"
  
      >
        <Viewport className="p-4 h-full">
          <Pages>
            <Page className="my-4">
              <CanvasLayer />
              <CustomLayer>
                {(pageNumber) => {
                  return (
                    <div className="relative">
                      <input
                        name={`${pageNumber}-input`}
                        className="p-2 border rounded-md m-2"
                        placeholder={`Input for page ${pageNumber}`}
                        type="text"
                      />
                    </div>
                  );
                }}
              </CustomLayer>
            </Page>
          </Pages>
        </Viewport>
      </Root>
    </form>
  ),
  args: {
    fileURL: "brochure.pdf",
  },
};

export const WithPDFFormValues: Story = {
  render: ({ fileURL }: { fileURL: string }) => (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target as any);
        const values = Object.fromEntries(formData.entries());

        alert(`Form values:\n${JSON.stringify(values, null, 2)}`);
      }}
    >
      <button type="submit">Get form values</button>
      <Root
        fileURL={fileURL}
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"
  
      >
        <Viewport className="p-4 h-full">
          <Pages>
            <Page className="my-4">
              <CanvasLayer />
              <TextLayer />
              <AnnotationLayer />
            </Page>
          </Pages>
        </Viewport>
      </Root>
    </form>
  ),
  args: {
    fileURL: "form.pdf",
  },
};

export const WithCanvasMetrics: Story = {
  render: ({ fileURL }: { fileURL: string }) => {
    const [size, setSize] = useState<{ w: number; h: number } | null>(null);

    const handleRender = useCallback((canvas: HTMLCanvasElement) => {
      setSize({ w: canvas.clientWidth, h: canvas.clientHeight });
    }, []);

    return (
      <Root
        fileURL={fileURL}
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px] flex flex-col"
        loader={<div className="p-4">Loading…</div>}
      >
        {/* --- Toolbar -------------------------------------------------- */}
        <div className="text-xs text-gray-700 bg-white/70 border-b px-3 py-1 flex items-center gap-2">
          Canvas&nbsp;size:&nbsp;
          {size ? `${size.w}px × ${size.h}px` : "—"}
          <span className="flex-grow" />
          <ZoomOut className="px-2 select-none">−</ZoomOut>
          <CurrentZoom className="w-14 text-center bg-white border rounded-md px-1 py-0.5" />
          <ZoomIn className="px-2 select-none">+</ZoomIn>
        </div>

        {/* --- CLEAR DEBUG READ-OUT ------------------------------------ */}
        <div className="text-center text-sm py-1 bg-yellow-100 border-b">
          <strong>Current canvas size:</strong>{" "}
          {size ? (
            <>
              <span className="font-mono">{size.w}</span> px&nbsp;×&nbsp;
              <span className="font-mono">{size.h}</span> px
            </>
          ) : (
            "— awaiting first render —"
          )}
        </div>

        {/* --- Viewer --------------------------------------------------- */}
        <Viewport className="flex-1 p-4 overflow-auto">
          <Pages>
            <Page className="shadow-md my-4">
              <CanvasLayer onRenderSuccess={handleRender} />
              <TextLayer />
            </Page>
          </Pages>
        </Viewport>
      </Root>
    );
  },

  args: { fileURL: "brochure.pdf" },
};


export const SkeletonPlaceholder: Story = {
  name: "With skeleton (1.5 s delay)",
  argTypes: {
    delay: { control: { type: "number", min: 0, max: 5000, step: 250 } },
  },
  args: { delay: 150000, fileURL: "brochure.pdf" },

  render: ({ delay, fileURL }: { delay: number; fileURL: string }) => {
    const [url, setUrl] = useState<string>("data:,");

    useEffect(() => {
      const id = setTimeout(() => setUrl(fileURL), delay);
      return () => clearTimeout(id);
    }, [delay, fileURL]);

    return (
      <Root
        fileURL={url}
        /* 👇 use the same skeleton in Root’s loader */
        loader={
          <div
            role="status"
            className="pdf-skeleton rounded-[2px]"
            style={{ width: 240, height: 240 * 1.414 }}
          />
        }
        className="bg-gray-100 border rounded-md overflow-hidden relative h-[500px]"
      >
        <Viewport className="p-4 h-full">
          <Pages>
            <Page className="my-4">
              <CanvasLayer />
            </Page>
          </Pages>
        </Viewport>
      </Root>
    );
  },
};


export const CanvasLoaded_TextDelayed: Story = {
  name: "Canvas ready · text 2 s later",
  render: ({ fileURL }) => {
    const [delayDone, setDelayDone] = useState(false);
    useEffect(() => {
      const id = setTimeout(() => setDelayDone(true), 20000);
      return () => clearTimeout(id);
    }, []);

    return (
      <Root fileURL={fileURL} className="bg-gray-100 border rounded-md h-[500px]">
        <Viewport className="p-4">
          <Pages>
            <Page className="shadow-md">
              <CanvasLayer />
              {delayDone && <TextLayer />}   {/* mount text layer 2 s later */}
            </Page>
          </Pages>
        </Viewport>
      </Root>
    );
  },
  args: { fileURL: "brochure.pdf" },
};
