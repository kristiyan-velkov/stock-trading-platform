import { render } from "@testing-library/react";
import { MiniChart } from "@/components/mini-chart";
import jest from "jest";

// Mock canvas context
const mockContext = {
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  strokeStyle: "",
  lineWidth: 0,
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  stroke: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  fillStyle: "",
  fill: jest.fn(),
};

// Mock canvas element
const mockCanvas = {
  getContext: jest.fn(() => mockContext),
  width: 200,
  height: 30,
};

// Mock useRef to return our mock canvas
jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useRef: jest.fn(() => ({ current: mockCanvas })),
  useEffect: jest.fn((fn) => fn()),
}));

describe("MiniChart", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders a canvas element", () => {
    // Act
    const { container } = render(
      <MiniChart data={[100, 105, 103, 110]} color="#22c55e" />
    );

    // Assert
    expect(container.querySelector("canvas")).toBeInTheDocument();
  });

  it("draws the chart with the correct color", () => {
    // Arrange
    const chartData = [100, 105, 103, 110];
    const chartColor = "#22c55e";

    // Act
    render(<MiniChart data={chartData} color={chartColor} />);

    // Assert
    expect(mockContext.clearRect).toHaveBeenCalled();
    expect(mockContext.beginPath).toHaveBeenCalled();
    expect(mockContext.strokeStyle).toBe(chartColor);
    expect(mockContext.stroke).toHaveBeenCalled();
    expect(mockContext.fill).toHaveBeenCalled();
  });

  it("handles empty data gracefully", () => {
    // Act
    render(<MiniChart data={[]} color="#22c55e" />);

    // Assert
    // Should not attempt to draw with empty data
    expect(mockContext.beginPath).not.toHaveBeenCalled();
    expect(mockContext.stroke).not.toHaveBeenCalled();
  });

  it("respects custom height", () => {
    // Arrange
    const customHeight = 50;

    // Act
    const { container } = render(
      <MiniChart
        data={[100, 105, 103, 110]}
        color="#22c55e"
        height={customHeight}
      />
    );

    // Assert
    const canvas = container.querySelector("canvas");
    expect(canvas).toHaveAttribute("height", customHeight.toString());
  });
});
