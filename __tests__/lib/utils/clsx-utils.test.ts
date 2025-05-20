import { cn } from "@/lib/utils/clsx-utils";

describe("cn", () => {
  it("merges valid Tailwind classes", () => {
    expect(cn("bg-red-500", "text-white")).toBe("bg-red-500 text-white");
  });

  it("removes conflicting Tailwind classes using twMerge", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("filters out falsy values", () => {
    expect(cn("text-sm", null, undefined, false, "", "font-bold")).toBe(
      "text-sm font-bold"
    );
  });

  it("handles conditional expressions", () => {
    const condition = true;

    expect(cn("p-4", condition && "m-2")).toBe("p-4 m-2");
  });

  it("handles class arrays", () => {
    expect(cn(["text-lg", "leading-none"], "font-medium")).toBe(
      "text-lg leading-none font-medium"
    );
  });
});
