export default interface Card {
  authorization_code: string;
  card_type: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  bin: string;
  bank_name: string;
  channel: "card";
  signature: string;
  reusable: true;
  country_code: "NG";
  account_name: string;
}
