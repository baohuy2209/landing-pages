"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cn } from "cn";

// shadcn/ui Base UI composition, adapted from the collection's local Slider.
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  thumbLabel,
  getAriaValueText,
  ...props
}: SliderPrimitive.Root.Props & {
  thumbLabel?: string;
  getAriaValueText?: SliderPrimitive.Thumb.Props["getAriaValueText"];
}) {
  const values = value ?? defaultValue ?? min;
  const thumbCount = Array.isArray(values) ? values.length : 1;

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      className={cn("ui-slider", className)}
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      thumbAlignment="edge"
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="ui-slider-control"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className="ui-slider-track"
        >
          <SliderPrimitive.Indicator
            data-slot="slider-range"
            className="ui-slider-indicator"
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbCount }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            className="ui-slider-thumb"
            key={index}
            index={index}
            aria-label={thumbLabel}
            getAriaValueText={getAriaValueText}
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
