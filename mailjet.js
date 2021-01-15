const mailjet = require ('node-mailjet')
.connect('582ab495f7cf3287c64e939d9bbc60f9', '1e74b73cf7ee9c4e6fd08262b64ea1b0')
const request = mailjet
.post("send", {'version': 'v3.1'})
.request({
  "Messages":[
    {
      "From": {
        "Email": "support@skulmart.com",
        "Name": "Dillion"
      },
      "To": [
        {
          "Email": "dillionmegida@gmail.com",
          "Name": "Dillion"
        }
      ],
      "Subject": "Greetings from Mailjet.",
      "TextPart": "My first Mailjet email",
      "HTMLPart": "<h3>Dear passenger 1, welcome to <a href='https://www.mailjet.com/'>Mailjet</a>!</h3><br />May the delivery force be with you!",
      "CustomID": "AppGettingStartedTest"
    }
  ]
})
request
  .then((result) => {
    console.log(result.body)
  })
  .catch((err) => {
    console.log(err.statusCode)
  })
