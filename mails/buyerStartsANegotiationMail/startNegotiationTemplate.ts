import { anchorLinkText } from "utils/strings";

const negotiationsLink = "https://merchant.skulmart.com/negotiations";

type Args = {
  emailSubject: string;
};

export default function startNegotiationTemplate({ emailSubject }: Args) {
  return `
<div>
    <h2 style='font-size: 20px;'>${emailSubject}</h2>
    <div>
        <p>
            Go to ${anchorLinkText({
              link: negotiationsLink,
              text: "your negotiations page",
            })} in your dashboard to address this negotiation.
            <br/>
            Addressing this negotiation means calling the buyer via their contact (which you'll find in the negotiation's page)
            and selecting a price which the buyer will pay.
        </p>
    </div>
</div>
    `;
}
