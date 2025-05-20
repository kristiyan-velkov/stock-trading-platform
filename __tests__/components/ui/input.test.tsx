import { render, screen } from "@testing-library/react";
import { Input } from "@/components/ui/input";
import "@testing-library/jest-dom";
import React, { createRef } from "react";

describe("Input", () => {
  it("renders an input field", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("applies the default classes", () => {
    render(<Input />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("flex", "h-9", "w-full", "rounded-md");
  });

  it("merges custom className", () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveClass("custom-class");
  });

  it("accepts type and placeholder props", () => {
    render(<Input type="email" placeholder="Enter your email" />);
    const input = screen.getByPlaceholderText("Enter your email");
    expect(input).toHaveAttribute("type", "email");
  });

  it("forwards ref to input element", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
