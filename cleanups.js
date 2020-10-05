const Seller = require("./models/Seller");
const sendMail = require("./mails");
const siteDetails = require("./config/siteDetails");
const { FREE_PLAN } = require("./constants/subscriptionTypes");
const { siteName } = require("./config/siteDetails");

// const changeSubToNullForUnverified = async () => {
//   const unverified = await Seller.find({
//     email_confirm: false,
//   });

//   if (unverified.length === 0) return;

//   await Promise.all(
//     unverified.map(async (seller) => {
//       const { _id: id } = seller;

//       await Seller.findByIdAndUpdate(id, {
//         $set: {
//           subscription_type: null,
//         },
//       });
//     })
//   );
// };

// const tellSellersToProvideWhatsapp = async () => {
//   const sellers = await Seller.find({
//     whatsapp: "undefined",
//   });
//   if (sellers.length === 0) return;

//   const subject = "Your whatsapp number is not provided in your profile";

//   await Promise.all(
//     sellers.map(async (seller) => {
//       const { email: receiver, fullname, store_name, username } = seller;

//       const html = `
//         <h2>Hi ${fullname} 👋</h2>
//         <p>
//           We noticed that your whatsapp number is '<b>undefined</b>'. This means
//           that it is not provided. You can confirm that by checking your profile here
//           - https://${store_name}.${siteName.toLowerCase()}.com/seller/${username}.
//         </p>
//         <p>
//           We advice you to rectify it so that buyers can easily reach out to you.
//           You can rectify this in your profile - https://${store_name}.${siteName.toLowerCase()}.com/profile/edit
//         </p>
//       `;

//       const emailRes = await sendMail({ receiver, subject, html });

//       if (emailRes.err) {
//         // then email couldn't send
//         return {
//           error: err,
//         };
//       }

//       return {
//         message: emailRes.message,
//       };
//     })
//   );
// };

const cleanups = async () => {
  console.log("started cleanup");
  // await changeSubToNullForUnverified();
  // await tellSubscribedItIsFree();
  // await tellUnsubscribedItIsFree();
  console.log("ended cleanup");
};

module.exports = cleanups;
