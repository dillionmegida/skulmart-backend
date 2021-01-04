export const shareTwitter = (str: string): string =>
  `https://twitter.com/intent/tweet?text=${str}`;

export const shareWhatsApp = (str: string): string =>
  `https://web.whatsapp.com/send?text=${str}`;
