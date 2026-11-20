import { describe, expect, it } from "vitest";
import { formatUSD, formatUSDCents, savingsPercentLabel } from "./format-price";

describe("formatUSD", () => {
  it("drops cents on whole dollars and keeps them otherwise", () => {
    expect(formatUSD(180)).toBe("$180");
    expect(formatUSD(180.0)).toBe("$180");
    expect(formatUSD(11.98)).toBe("$11.98");
    expect(formatUSD(64.99)).toBe("$64.99");
    expect(formatUSD(157.5)).toBe("$157.50");
    expect(formatUSD(0)).toBe("$0");
    expect(formatUSDCents(51300)).toBe("$513");
    expect(formatUSDCents(8398)).toBe("$83.98");
  });
});

describe("savingsPercentLabel (floored to 0.1, never rounded up)", () => {
  it("matches Julia's examples", () => {
    expect(savingsPercentLabel(36000, 35100)).toBe("2.5%");
    expect(savingsPercentLabel(54000, 51300)).toBe("5%");
    expect(savingsPercentLabel(28800, 27900)).toBe("3.1%");
    expect(savingsPercentLabel(43200, 40500)).toBe("6.2%");
  });
  it("floors Bonomarlot and Endoluten packs", () => {
    expect(savingsPercentLabel(46800, 45600)).toBe("2.5%"); // 2.564
    expect(savingsPercentLabel(70200, 66700)).toBe("4.9%"); // 4.986
    expect(savingsPercentLabel(57600, 56200)).toBe("2.4%"); // 2.43
    expect(savingsPercentLabel(86400, 82100)).toBe("4.9%"); // 4.977
  });
  it("returns null when there is no saving", () => {
    expect(savingsPercentLabel(10000, 10000)).toBeNull();
    expect(savingsPercentLabel(10000, 10001)).toBeNull();
    expect(savingsPercentLabel(0, 0)).toBeNull();
    expect(savingsPercentLabel(100000, 99999)).toBeNull(); // 0.001% floors to 0
  });
});
