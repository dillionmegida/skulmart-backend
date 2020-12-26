const { capitalize, replaceString } = require("../strings");
const { isTokenValid } = require("../token");

describe("string utils", () => {
  it("should capitalize first letter", () => {
    expect(capitalize("this is a string")).toBe("This Is A String");
  });
  it("should replace a string correctly", () => {
    expect(replaceString({ str: "hello", replace: "th", _with: "-" })).toBe(
      "hello"
    );
    expect(
      replaceString({ str: "Hello My Oga", replace: " ", _with: "-" })
    ).toBe("Hello-My-Oga");
  });
});
