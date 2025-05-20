import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "@/app/page";

jest.mock("@/components/stock-dashboard-wrapper", () => () => (
  <div data-testid="stock-dashboard-wrapper">Dashboard</div>
));

jest.mock("@/components/ui/loading-fallback", () => () => (
  <div data-testid="loading-fallback">Loading...</div>
));

describe("HomePage", () => {
  it("renders the StockDashboardWrapper inside Suspense", async () => {
    render(<HomePage />);

    const dashboard = await screen.findByTestId("stock-dashboard-wrapper");
    expect(dashboard).toBeInTheDocument();
  });
});
