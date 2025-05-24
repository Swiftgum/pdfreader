import { useViewportContainer } from "@/lib/viewport";
import { HTMLProps, useRef, RefObject } from "react";
import { Primitive } from "../Primitive";

export const Viewport = ({ children, ...props }: HTMLProps<HTMLDivElement>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementWrapperRef = useRef<HTMLDivElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useViewportContainer({
    elementRef: elementRef as RefObject<HTMLDivElement>,
    elementWrapperRef: elementWrapperRef as RefObject<HTMLDivElement>,
    containerRef: containerRef as RefObject<HTMLDivElement>,
  });

  return (
    <Primitive.div
      ref={containerRef}
      {...props}
      style={{
        display: "flex",
        justifyContent: "center",
        ...props.style,
        position: "relative",
        overflow: "auto",
      }}
    >
      <div
        ref={elementWrapperRef}
        style={{
          width: "max-content",
        }}
      >
        <div
          ref={elementRef}
          style={{
            position: "absolute",
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            transformOrigin: "0 0",
            width: "max-content",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </div>
    </Primitive.div>
  );
};
