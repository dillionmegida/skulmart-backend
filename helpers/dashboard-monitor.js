const { SharpDashBoard } = require("sharpdashboard-sdk-node");
const Sellers = require("../models/Seller");

const getSellers = async () => {
  try {
    const sellers = await Sellers.find({ email_confirm: true }).select(
      "-password"
    );
    return sellers;
  } catch (err) {
    console.log(err.message);
  }
};

let dashboard = null;

if (process.env.SHARPDASH_API_KEY) {
  // so that the dashboard is not updated on development mode

  const dashboard = new SharpDashBoard(process.env.SHARPDASH_API_KEY);

  dashboard.addModelHandler("sellers", getSellers);
}

module.exports = dashboard;
