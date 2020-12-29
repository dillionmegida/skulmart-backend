import Seller from "models/Seller";
import sendMail from "mails";
import { FREE_PLAN } from "constants/subscriptionTypes";
import { siteName } from "config/siteDetails";
import SellerNotificationMessage from "models/SellerNotificationMessage";
import Product from "models/Product";
import { Schema } from "mongoose";
import ProductInterface from "interfaces/Product";

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
  // const products: any = await Product.find();

  // for (let i = 0; i < products.length; i++) {
  //   // console.log(products[i], products[i]._id, products[i].seller_id);
  //   // console.log(products[i].seller_id);
  //   await Product.findByIdAndUpdate(products[i]._id, {
  //     $set: {
  //       seller: products[i].seller_id,
  //     },
  //   });
  // }
  // const sellers = await Seller.find()
  // console.log({sellers})
  // await changeSubToNullForUnverified();
  // await tellSubscribedItIsFree();
  // await tellUnsubscribedItIsFree();
  // await SellerNotificationMessage.insertMany([
  //   {
  //     title: "This is the first notification",
  //     message: "Do the needful",
  //     viewedIds: [],
  //   },
  //   {
  //     title: "This is the second notification",
  //     message: "Do the needful I say again",
  //     viewedIds: [],
  //   },
  // ]);
  //     await SellerNotificationMessage.insertMany([
  //       {
  //         title: "🎉🎉 The Notifications Feature",
  //         message: `We want to reduce the communication barrier between us and you. So now we have the <b>Notifications Feature</b>.

  // With this, we can easily inform you of the new features we're including on our platform so you can start using them.

  // If we also notice issues on your account, this will be a fast way to reach out to you so you can resolve them.

  // Keep enjoying our platform : )

  // We hope to serve you the best.
  // `,
  //       },
  //     ]);
  // const notifications = await SellerNotificationMessage.find();
  // console.log({notifications})
  // await SellerNotificationMessage.deleteMany();

  // const products = await Product.find({ _id: "7MWw9wo5h" });

  // for (let i = 0; i < products.length; i++) {
  //   await Product.updateOne(
  //     { _id: "7MWw9wo5h" },
  //     {
  //       $set: {
  //         _id: new Schema.Types.ObjectId("7MWw9wo5h"),
  //       },
  //     }
  //   );
  // }

  console.log("ended cleanup");
};

export default cleanups;
