import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { StockLogo } from "@/components/ui/stock-logo";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    return <img {...props} />;
  },
}));

describe("StockLogo", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_STOCK_LOGO_URL = "https://logo.clearbit.com";
  });

  it("renders image with correct src", () => {
    render(<StockLogo name="Tesla" />);
    const img = screen.getByRole("img", { hidden: true });
    expect(img).toHaveAttribute("src", "https://logo.clearbit.com/tesla.com");
    expect(img).toHaveAttribute("alt", "Tesla logo");
  });

  it("applies custom width and height", () => {
    render(<StockLogo name="Amazon" width={40} height={40} />);
    const img = screen.getByRole("img", { hidden: true });
    expect(img).toHaveAttribute("width", "40");
    expect(img).toHaveAttribute("height", "40");
  });

  it("applies custom alt text", () => {
    render(<StockLogo name="Google" alt="Google Inc." />);
    const img = screen.getByRole("img", { hidden: true });
    expect(img).toHaveAttribute("alt", "Google Inc.");
  });

  it("renders fallback image on error", () => {
    render(<StockLogo name="NonExistent" />);
    const img = screen.getByRole("img", { hidden: true });

    img.onerror?.({ currentTarget: img } as any);

    expect(img).toHaveAttribute(
      "src",
      "https://logo.clearbit.com/nonexistent.com"
    );
  });
});
