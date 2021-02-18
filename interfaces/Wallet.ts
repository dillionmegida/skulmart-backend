export default interface Wallet {
  balance: number;
  last_income?: Date;
  last_withdraw?: Date;
}
