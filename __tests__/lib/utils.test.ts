import { cn, formatCurrency, formatPercentage } from "@/lib/utils/clsx-utils";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("combines class names correctly", () => {
      // Act & Assert
      expect(cn("class1", "class2")).toBe("class1 class2");
      expect(cn("class1", null, undefined, "class2")).toBe("class1 class2");
      expect(cn("class1", false && "class2", true && "class3")).toBe(
        "class1 class3"
      );
    });

    it("handles conditional classes", () => {
      // Act & Assert
      expect(cn("base", { conditional: true })).toBe("base conditional");
      expect(cn("base", { conditional: false })).toBe("base");
    });

    it("merges Tailwind classes correctly", () => {
      // Act & Assert
      expect(cn("p-4 text-red-500", "p-6")).toBe("text-red-500 p-6");
      expect(cn("text-sm text-gray-500", "text-lg")).toBe(
        "text-gray-500 text-lg"
      );
    });
  });

  describe("formatCurrency", () => {
    it("formats numbers with two decimal places", () => {
      // Act & Assert
      expect(formatCurrency(123.456)).toBe("123.46");
      expect(formatCurrency(123)).toBe("123.00");
      expect(formatCurrency(0)).toBe("0.00");
    });

    it("handles negative numbers", () => {
      // Act & Assert
      expect(formatCurrency(-123.456)).toBe("-123.46");
      expect(formatCurrency(-0.5)).toBe("-0.50");
    });

    it("handles NaN values", () => {
      // Act & Assert
      expect(formatCurrency(Number.NaN)).toBe("0.00");
    });
  });

  describe("formatPercentage", () => {
    it("formats numbers as percentages with two decimal places", () => {
      // Act & Assert
      expect(formatPercentage(12.345)).toBe("12.35%");
      expect(formatPercentage(0)).toBe("0.00%");
    });

    it("returns absolute values for percentages", () => {
      // Act & Assert
      expect(formatPercentage(-12.345)).toBe("12.35%");
      expect(formatPercentage(-0.5)).toBe("0.50%");
    });

    it("handles NaN values", () => {
      // Act & Assert
      expect(formatPercentage(Number.NaN)).toBe("0.00%");
    });
  });
});
