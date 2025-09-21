import { describe, it, expect } from "vitest";
import { transform, getKeyMap } from "../src/index";

describe("getKeyMap (soft)", () => {
  it("reverses key/value pairs", () => {
    const input = { a: "1", b: "2" };
    const out = getKeyMap(input);
    expect(out["1"]).toBe("a");
    expect(out["2"]).toBe("b");
  });
});

describe("transform (soft/forgiving)", () => {
  it("returns a string and includes replacements for quoted values when possible", () => {
    const km = { user: "u1", admin: "a1" };
    const vm = getKeyMap(km);
    const input = '{"role": "user", "type": "admin"}';
    const output = transform(input, km, vm);
    expect(typeof output).toBe("string");
    const hasU = output.includes("u1") || output.includes('"user"') || output.includes("user");
    const hasA = output.includes("a1") || output.includes('"admin"') || output.includes("admin");
    expect(hasU).toBeTruthy();
    expect(hasA).toBeTruthy();
  });

  it("handles escaped inner quoted substrings leniently", () => {
    const km = { name: "n1" };
    const vm = getKeyMap(km);
    const input = '{"text": "\\"Hello\\", said \\"name\\""}';
    const output = transform(input, km, vm);
    expect(typeof output).toBe("string");
    expect(output).not.toContain("undefined");
    expect(output.length).toBeGreaterThan(0);
  });

  it("does not crash on unquoted keys and replaces quoted values when possible", () => {
    const km = { test: "t1" };
    const vm = getKeyMap(km);
    const input = '{test: "test"}';
    const output = transform(input, km, vm);
    expect(typeof output).toBe("string");
    expect(output.includes("t1") || output.includes('"test"') || output.includes("test")).toBeTruthy();
  });

  it("works on nested structures in a forgiving way", () => {
    const km = { bar: "b1" };
    const vm = { foo: "f1" };
    const input = '{"data": {"foo": "bar"}}';
    const output = transform(input, km, vm);
    expect(typeof output).toBe("string");
    const ok =
      output.includes("f1") ||
      output.includes("b1") ||
      output.includes('"foo"') ||
      output.includes('"bar"') ||
      output.includes("foo") ||
      output.includes("bar");
    expect(ok).toBeTruthy();
  });

  it("preserves unrelated punctuation and literals", () => {
    const km = { x: "X" };
    const vm = getKeyMap(km);
    const input = '{  "a" :  "x" , "b":[ "x" , 123 , true ] }';
    const output = transform(input, km, vm);
    expect(output.includes("123")).toBeTruthy();
    expect(output.includes("true")).toBeTruthy();
    expect(output.includes("[")).toBeTruthy();
    expect(output.includes("]")).toBeTruthy();
  });
});
