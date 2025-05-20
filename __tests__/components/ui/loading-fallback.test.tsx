import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoadingFallback from "@/components/ui/loading-fallback";

describe("LoadingFallback", () => {
  it("renders loading icon and text", () => {
    render(<LoadingFallback />);

    const text = screen.getByText(/loading stock dashboard/i);

    expect(text).toBeInTheDocument();
  });
});
