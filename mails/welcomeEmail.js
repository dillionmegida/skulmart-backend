const sendMail = require("./index");
const { siteName } = require("../config/siteDetails");
const {FREE_PLAN} = require('../constants/subscriptionTypes')

const welcomeEmail = async (email, name, store) => {
  const subject = `Welcome to ${siteName}`;
  const html = `
        <div style='width: 100%; margin: auto'>
          <h2>Welcome ${name} 🙌</h2>
          <p>Your email has been confirmed successfully.
            <br/>
            You have registered for ${store} store - 
              <a href='http://${store}.skulmart.com'>${store}.skulmart.com</a>.
          </p>
          <h3>Next Steps</h3>
          <p>You have automatically received a free plan. This plan supports uploading a maximum of ${FREE_PLAN.max_products} products.
          So, head over to your dashboard and start managing your products on ${siteName} 🎉.</p>
        </div>
            `;
            
  const mailResponse = await sendMail({
    html,
    receiver: email,
    subject,
  });

  if (mailResponse.err) {
    // then email couldn't send
    return {
      error: err,
    };
  }

  return {
    message: mailResponse.message,
  };
};

module.exports = welcomeEmail;
