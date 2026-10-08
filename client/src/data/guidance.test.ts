import { describe, expect, it } from "vitest";
import { products } from "@/data/products";
import { SHOP_SYSTEMS, getSystem, productInSystem, SYSTEM_HELP_LINE } from "@/data/systems";
import { DOCTOR_QUESTIONS } from "@/data/doctorQuestions";
import {
  PROTOCOLS,
  getPublicProtocol,
  goalsWithData,
  hasSexSpecific,
  scheduleFor,
  type ProductProtocol,
} from "@/data/protocols";
import {
  doctorQuestionsMessage,
  parsePeppyParams,
  peppyPrefill,
  peppySchedule,
} from "@/lib/peppyContext";

describe("shop by system", () => {
  it("has the four approved systems with intros", () => {
    expect(SHOP_SYSTEMS.map((s) => s.name)).toEqual([
      "Brain & Cognitive Vitality",
      "Recovery & Resilience",
      "Longevity & Healthy Aging",
      "Organ & Foundational Support",
    ]);
    expect(getSystem("organ")?.intro).toBe(
      "For people who want targeted support for one specific organ or system, like liver, kidney, thyroid, or immune."
    );
    expect(
      `${SYSTEM_HELP_LINE.before} ${SYSTEM_HELP_LINE.askPeppy}${SYSTEM_HELP_LINE.middle} ${SYSTEM_HELP_LINE.doctorQuestions} ${SYSTEM_HELP_LINE.after}`
    ).toBe("Not sure which one fits? Ask Peppy, or bring the doctor questions to your next appointment.");
  });

  it("only lists product ids that exist in the catalog", () => {
    const ids = new Set(products.map((p) => p.id));
    for (const s of SHOP_SYSTEMS) for (const id of s.listed) expect(ids.has(id), `${s.id}:${id}`).toBe(true);
  });

  it("every system has products; derived rules use existing category data", () => {
    for (const s of SHOP_SYSTEMS) expect(products.filter((p) => productInSystem(p, s)).length).toBeGreaterThan(0);
    const longevity = getSystem("longevity")!;
    for (const p of products.filter((x) => x.category === "ANTI AGING-LONGEVITY"))
      expect(productInSystem(p, longevity)).toBe(true);
    const organ = getSystem("organ")!;
    expect(productInSystem(products.find((p) => p.id === "bonomarlot")!, organ)).toBe(true);
    expect(getSystem("nope")).toBeUndefined();
  });
});

describe("doctor questions", () => {
  it("uses the exact four default questions", () => {
    expect(DOCTOR_QUESTIONS).toEqual([
      "Is this appropriate with my current medications or conditions?",
      "Should I take this preventively or restoratively?",
      "How long should one cycle be for me?",
      "What labs, if any, should we check?",
    ]);
    const msg = doctorQuestionsMessage("Bonomarlot");
    expect(msg).toContain("about Bonomarlot");
    expect(msg).toContain("4. What labs, if any, should we check?");
    expect(msg).toContain("not been evaluated by the FDA");
  });
});

const sample: Record<string, ProductProtocol> = {
  a: {
    protocolReviewed: true,
    preventive: { all: { rows: [{ label: "Dose", value: "X" }] } },
  },
  b: {
    protocolReviewed: false,
    preventive: { all: { rows: [{ label: "Dose", value: "X" }] } },
  },
  c: {
    protocolReviewed: true,
    restorative: {
      men: { rows: [{ label: "Dose", value: "M" }] },
      women: { rows: [{ label: "Dose", value: "W" }] },
    },
  },
  d: { protocolReviewed: true, preventive: { all: { rows: [{ label: " ", value: "" }] } } },
};

describe("protocols", () => {
  it("ships with no protocol data (nothing invented)", () => {
    expect(Object.keys(PROTOCOLS)).toHaveLength(0);
  });

  it("gates on protocolReviewed and on real rows", () => {
    expect(getPublicProtocol("a", sample)).not.toBeNull();
    expect(getPublicProtocol("b", sample)).toBeNull();
    expect(getPublicProtocol("d", sample)).toBeNull();
    expect(getPublicProtocol("missing", sample)).toBeNull();
  });

  it("detects sex-specific schedules only when distinct", () => {
    expect(goalsWithData(sample.c)).toEqual(["restorative"]);
    expect(hasSexSpecific(sample.c, "restorative")).toBe(true);
    expect(hasSexSpecific(sample.a, "preventive")).toBe(false);
    expect(scheduleFor(sample.c, "restorative", "men")?.rows[0].value).toBe("M");
    expect(scheduleFor(sample.c, "restorative", "women")?.rows[0].value).toBe("W");
  });
});

describe("Peppy hand-off params", () => {
  const exists = (id: string) => id === "bonomarlot";
  it("parses known product, goal and sex; ignores junk", () => {
    expect(parsePeppyParams("?product=bonomarlot&goal=restorative&sex=men", exists)).toEqual({
      productId: "bonomarlot",
      goal: "restorative",
      sex: "men",
    });
    expect(parsePeppyParams("product=unknown&goal=cure&sex=x", exists)).toEqual({});
    expect(parsePeppyParams("", exists)).toEqual({});
  });

  it("prefills a structure/function question", () => {
    expect(peppyPrefill("Bonomarlot", "preventive")).toBe(
      "Tell me about Bonomarlot for preventive (maintenance) use."
    );
    expect(peppyPrefill("Bonomarlot")).toBe("Tell me about Bonomarlot.");
  });

  it("shows a schedule only when reviewed", () => {
    expect(peppySchedule("a", "preventive", undefined, sample)?.rows).toHaveLength(1);
    expect(peppySchedule("b", "preventive", undefined, sample)).toBeNull();
    expect(peppySchedule("c", "restorative", "men", sample)?.rows[0].value).toBe("M");
    expect(peppySchedule("a", undefined, undefined, sample)).toBeNull();
  });
});
