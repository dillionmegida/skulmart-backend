const domain = "mg.skulmart.com";

import _mailgun from "mailgun-js";
const mailgun = _mailgun({
  apiKey: process.env.MAILGUN_API_KEY as string,
  domain,
});
import { siteName, email } from "config/siteDetails";
import { MAILGUN_EMAIL } from "constants/index";

type SendMailArgs = {
  receiver: string;
  subject: string;
  html: string;
};
const sendMail = ({ receiver, subject, html }: SendMailArgs): Promise<any> => {
  return new Promise((resolve, reject) => {
    const mailOptions = {
      from: `"${siteName}" <${MAILGUN_EMAIL}>`,
      to: receiver,
      subject,
      html: `
              <div style='
                  width: 350px;   
                  color: black;
                  font-size: 16px;
                  margin: auto    
              '>
                  ${html}
                  <br/>
                  <hr/>
                  <p>If you have any questions or need assistance doing anything, reach out to us
                  on <a href='mailto:${email}'>${email}</a>. We would so glad to help you.
                  <br/><br/>
                  <p>
                      The best market for you - <a style='color: rgb(18, 122, 61)' href='http://skulmart.com'>${siteName}</a>
                  </p>
                  <a href='http://skulmart.com' style='width: 100%'>
                      <img style='margin: 0 auto' src='https://www.skulmart.com/assets/img/logo.png' width='150px' />
                  </a>
              </div>
          `,
    };

    mailgun.messages().send(mailOptions, (error: any, body: any) => {
      if (error) {
        return reject({
          error,
        });
      } else {
        return resolve({
          message: "success",
        });
      }
    });
  });
};

export default sendMail;
