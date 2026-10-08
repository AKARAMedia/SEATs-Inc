// Contact page copy — mirrors the live custom HTML widget (EN + TranslatePress JA).
export const CONTACT = {
  title: { en: "CONTACT", ja: "CONTACT" },
  businessDays: {
    label: { en: "Business days", ja: "営業日" },
    text: { en: "Monday to Saturday, excluding public holidays", ja: "月曜日から土曜日(祝日を除く)" },
  },
  phone: {
    label: { en: "Phone", ja: "本社電話番号" },
    number: "(+855) 023-966-313",
    tel: "tel:+85523966313",
    note: { en: "(English / Khmer / Japanese)", ja: "(日本語/英語/クメール語)" },
  },
  email: {
    label: { en: "Email", ja: "Email" },
    inquiry: { en: "Inquiry", ja: "お問合せ全般" },
    inquiryAddress: "general@seats-inc.com",
    recruit: { en: "Recruit", ja: "Recruit" },
    recruitAddress: "hr-recruiting@seats-inc.com",
  },
  address: {
    label: { en: "Address", ja: "本社住所" },
    lines: ["No.54 & 56, Street 388, Sangkat Toul Svay Prey 1,", "Khan Boeng Keng Kang, Phnom Penh, Cambodia."],
    mapLabel: "Google Maps",
    mapUrl:
      "https://www.google.com/maps/search/?api=1&query=No.54%20%26%2056%2C%20Street%20388%2C%20Sangkat%20Toul%20Svay%20Prey%201%2C%20Khan%20Boeng%20Keng%20Kang%2C%20Phnom%20Penh%2C%20Cambodia",
  },
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
