/** Legal content configuration for Terms & Conditions and Privacy Policy pages */

export interface LegalSection {
  heading: string;
  content: string | string[];
}

export interface LegalContent {
  title: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export const termsContent: LegalContent = {
  title: "Terms & Conditions",
  lastUpdated: "January 2026",
  sections: [
    {
      heading: "1. Introduction",
      content: "Welcome to HIR Industries. These Terms and Conditions govern your use of our website and the purchase of our products. By accessing or using our website, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our website."
    },
    {
      heading: "2. Use of Website",
      content: [
        "You must be at least 18 years old to use this website and place orders",
        "You agree to provide accurate, current, and complete information when using our website",
        "You agree not to misuse the website or help anyone else do so",
        "You are responsible for keeping your access credentials secure",
        "You may not use our website for any illegal or unauthorized purpose"
      ]
    },
    {
      heading: "3. Product Information",
      content: "We strive to provide accurate product descriptions, specifications, and images. However, we do not warrant that product descriptions, pricing, or other content on our website is accurate, complete, reliable, current, or error-free. Colors and measurements may vary slightly from images shown. Technical specifications are subject to change without notice. Please verify product details with our team before making critical purchasing decisions."
    },
    {
      heading: "4. Pricing and Payment",
      content: [
        "All prices are listed in Indian Rupees (INR) unless otherwise specified",
        "Prices are subject to change without notice",
        "We reserve the right to refuse or cancel any order at any time",
        "Payment terms will be communicated at the time of order confirmation",
        "All applicable taxes and duties are the responsibility of the buyer"
      ]
    },
    {
      heading: "5. Shipping and Delivery",
      content: "Delivery timelines and shipping costs will be communicated at the time of order confirmation. HIR Industries will make reasonable efforts to meet agreed delivery schedules but is not liable for delays caused by circumstances beyond our control, including but not limited to natural disasters, transportation issues, or material shortages. Risk of loss and title pass to the buyer upon delivery."
    },
    {
      heading: "6. Returns and Refunds",
      content: [
        "Products must be inspected upon delivery. Damages or defects must be reported within 48 hours",
        "Returns are accepted only for manufacturing defects or incorrect products shipped",
        "Custom orders, special mixes, or products used on site are not eligible for return",
        "Return shipping costs may apply as per company policy",
        "Refunds will be processed within 7-14 business days after return approval"
      ]
    },
    {
      heading: "7. Intellectual Property",
      content: "All content on this website, including text, graphics, logos, images, product names, and technical data, is the property of HIR Industries or its licensors and is protected by Indian and international copyright, trademark, and other intellectual property laws. You may not reproduce, distribute, modify, or create derivative works from any content without our prior written consent."
    },
    {
      heading: "8. Limitation of Liability",
      content: "To the fullest extent permitted by law, HIR Industries shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or goodwill, arising from your use of our website or products. Our total liability shall not exceed the amount paid by you for the specific product giving rise to the claim."
    },
    {
      heading: "9. Warranty and Technical Support",
      content: "Our products come with a limited warranty against manufacturing defects. Warranty terms vary by product and will be communicated at the time of purchase. Technical support and application guidance are provided as a service but do not constitute a warranty. Proper surface preparation, mixing, application, and curing as per product guidelines are the responsibility of the applicator."
    },
    {
      heading: "10. Governing Law",
      content: "These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising from these Terms or your use of our website shall be subject to the exclusive jurisdiction of the courts in Sabarkantha, Gujarat, India."
    },
    {
      heading: "11. Changes to Terms",
      content: "HIR Industries reserves the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting to the website. Your continued use of the website after any such changes constitutes your acceptance of the new Terms."
    },
    {
      heading: "12. Contact Information",
      content: "If you have any questions about these Terms and Conditions, please contact us at HIR Industries, C/O Gauri ceramics compound, opp sahkari jin, on National Highway 48, Kanknol, Himatnagar, Sabarkantha, Gujarat-383001-INDIA. Phone: 18005722779"
    }
  ]
};

export const privacyContent: LegalContent = {
  title: "Privacy Policy",
  lastUpdated: "January 2026",
  sections: [
    {
      heading: "1. Introduction",
      content: "HIR Industries respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or interact with our business. Please read this policy carefully to understand our practices regarding your personal data."
    },
    {
      heading: "2. Information Collection",
      content: [
        "Contact information: name, email address, phone number, company name",
        "Delivery information: shipping address, billing address",
        "Order information: products purchased, quantities, prices",
        "Technical information: IP address, browser type, device information, pages visited",
        "Communications: emails, chat messages, inquiry forms, newsletter subscriptions"
      ]
    },
    {
      heading: "3. Use of Information",
      content: "We use the information we collect to process your orders, provide customer service, send order confirmations and updates, respond to your inquiries and requests, send marketing communications (with your consent), improve our website and products, analyze usage patterns and trends, prevent fraud and maintain security, and comply with legal obligations."
    },
    {
      heading: "4. Data Storage and Security",
      content: "We implement appropriate technical and organizational security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is completely secure, and we cannot guarantee absolute security. Your data is stored on secure servers and retained only as long as necessary for the purposes outlined in this policy or as required by law."
    },
    {
      heading: "5. Cookies and Tracking",
      content: [
        "Essential cookies: required for website functionality and security",
        "Analytics cookies: help us understand how visitors use our website",
        "Marketing cookies: used to deliver relevant advertisements",
        "You can control cookies through your browser settings, but disabling cookies may affect website functionality"
      ]
    },
    {
      heading: "6. User Rights",
      content: [
        "Access: request a copy of your personal data we hold",
        "Correction: request correction of inaccurate or incomplete data",
        "Deletion: request deletion of your personal data (subject to legal requirements)",
        "Objection: object to processing of your data for marketing purposes",
        "Portability: request transfer of your data to another service provider",
        "Withdrawal: withdraw consent for data processing at any time"
      ]
    },
    {
      heading: "7. Data Sharing",
      content: "We do not sell, trade, or rent your personal data to third parties. We may share your information with service providers who assist us in operating our website, conducting our business, or servicing you (e.g., payment processors, shipping companies, email service providers), legal authorities when required by law or to protect our rights, and business partners with your explicit consent."
    },
    {
      heading: "8. Marketing Communications",
      content: "With your consent, we may send you marketing emails about our products, special offers, and industry news. You can opt out of marketing communications at any time by clicking the unsubscribe link in our emails or contacting us directly. Please note that you will continue to receive transactional emails related to your orders and account."
    },
    {
      heading: "9. Third-Party Links",
      content: "Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review the privacy policies of any third-party sites you visit."
    },
    {
      heading: "10. Children's Privacy",
      content: "Our website is not intended for individuals under the age of 18. We do not knowingly collect personal data from children. If you believe we have collected data from a child, please contact us immediately, and we will take steps to delete such information."
    },
    {
      heading: "11. International Data Transfers",
      content: "Your information may be transferred to and processed in countries other than India. We ensure that appropriate safeguards are in place to protect your data in accordance with this Privacy Policy and applicable data protection laws."
    },
    {
      heading: "12. Changes to Privacy Policy",
      content: "We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. The updated policy will be posted on this page with a revised 'Last Updated' date. We encourage you to review this policy periodically."
    },
    {
      heading: "13. Contact Us",
      content: "If you have questions about this Privacy Policy, wish to exercise your data rights, or have concerns about how we handle your personal data, please contact us at: HIR Industries, C/O Gauri ceramics compound, opp sahkari jin, on National Highway 48, Kanknol, Himatnagar, Sabarkantha, Gujarat-383001-INDIA. Phone: 18005722779. Email: info@hirindustries.com"
    }
  ]
};
