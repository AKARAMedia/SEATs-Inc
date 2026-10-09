// Contact page copy — mirrors the live custom HTML widget (EN + TranslatePress JA).
export const CONTACT = {
  title: { en: "CONTACT", ja: "CONTACT" },
  // Values (phone, emails, address, hours, map) come from admin Settings → Company
  businessDays: { label: { en: "Business days", ja: "営業日" } },
  phone: { label: { en: "Phone", ja: "本社電話番号" } },
  email: {
    label: { en: "Email", ja: "Email" },
    inquiry: { en: "Inquiry", ja: "お問合せ全般" },
    recruit: { en: "Recruit", ja: "Recruit" },
  },
  address: { label: { en: "Address", ja: "本社住所" }, mapLabel: "Google Maps" },
  form: {
    title: { en: "Contact Us", ja: "お問い合わせ" },
    name: { en: "Name *", ja: "名前" },
    email: { en: "Email *", ja: "メールアドレス" },
    company: { en: "Company", ja: "Company" },
    message: { en: "Message", ja: "メッセージ" },
    submit: { en: "Submit", ja: "送信" },
    sending: { en: "Sending...", ja: "送信中..." },
    success: {
      en: "Thank you for your message. It has been sent.",
      ja: "お問い合わせありがとうございます。メッセージは送信されました。",
    },
    error: {
      en: "There was an error trying to send your message. Please try again later.",
      ja: "メッセージの送信に失敗しました。しばらくしてから再度お試しください。",
    },
    invalid: {
      en: "One or more fields have an error. Please check and try again.",
      ja: "入力内容に問題があります。確認して再度お試しください。",
    },
    required: { en: "Please fill out this field.", ja: "この項目は必須です。" },
    badEmail: { en: "Please enter a valid email address.", ja: "有効なメールアドレスを入力してください。" },
  },
} as const;
