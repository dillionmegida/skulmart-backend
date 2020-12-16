const { capitalize } = require("../strings");
const { isTokenValid } = require("../token");

describe("string utils", () => {
  it("should capitalize first letter", () => {
    expect(capitalize("this is a string")).toBe("This Is A String");
  });
});
