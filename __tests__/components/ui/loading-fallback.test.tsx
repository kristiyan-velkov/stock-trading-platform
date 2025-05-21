import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoadingFallback } from "@/components/ui/loading-fallback";

describe("LoadingFallback", () => {
  it("renders default message", () => {
    render(<LoadingFallback message="Loading..." />);
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders custom message", () => {
    render(<LoadingFallback message="Fetching data..." />);
    expect(screen.getByText("Fetching data...")).toBeInTheDocument();
  });

  it("has full screen height when fullScreen is true", () => {
    const { container } = render(
      <LoadingFallback message="Testing..." fullScreen />
    );
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className.includes("h-screen")).toBe(true);
  });

  it("has full height when fullScreen is false", () => {
    const { container } = render(
      <LoadingFallback message="Testing..." fullScreen={false} />
    );
    const outerDiv = container.firstChild as HTMLElement;
    expect(outerDiv.className.includes("h-full")).toBe(true);
  });
});
