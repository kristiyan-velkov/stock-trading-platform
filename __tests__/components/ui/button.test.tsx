import { render, screen } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";
import "@testing-library/jest-dom";
import React, { createRef } from "react";

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole("button", { name: /click me/i });
    const expectedClasses = buttonVariants({
      variant: "default",
      size: "default",
    }).split(" ");
    expectedClasses.forEach((cls) => {
      expect(btn).toHaveClass(cls);
    });
  });

  it("applies destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole("button", { name: /delete/i });
    expect(btn).toHaveClass("bg-destructive");
  });

  it("applies icon size", () => {
    render(<Button size="icon">Icon</Button>);
    const btn = screen.getByRole("button", { name: /icon/i });
    expect(btn).toHaveClass("w-9");
    expect(btn).toHaveClass("h-9");
  });

  it("merges custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    const btn = screen.getByRole("button", { name: /custom/i });
    expect(btn).toHaveClass("custom-class");
  });

  it("renders as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="#" data-testid="child-link">
          Link
        </a>
      </Button>
    );
    const link = screen.getByTestId("child-link");
    expect(link).toBeInTheDocument();
    expect(link.tagName.toLowerCase()).toBe("a");
    expect(link).toHaveClass("inline-flex"); // correct usage
  });

  it("passes through native props like disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole("button", { name: /disabled/i });
    expect(btn).toBeDisabled();
  });

  it("forwards ref to button element", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>With Ref</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
