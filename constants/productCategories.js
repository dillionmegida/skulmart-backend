// similar to the one in client store

// Be careful changing this, because this is what the database uses
// to group products...you can add, but try your best not to remove.
const productCategories = [
  { key: "phone-and-laptops", name: "Phone and Laptops" },
  { key: "female-wears", name: "Female Wears" },
  { key: "male-wears", name: "Male Wears" },
];

const getCategoryName = (key) => {
  const category = productCategories.find((cat) => cat.key === key);

  if (category === undefined) return "";

  return category.name;
};

module.exports = { productCategories, getCategoryName };
