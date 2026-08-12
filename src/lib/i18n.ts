import { useSyncExternalStore } from "react";

export type Locale = "en" | "hi";

const en = {
  "nav.features": "Features",
  "nav.testimonials": "Testimonials",
  "nav.faq": "FAQ",
  "nav.signin": "Sign in",
  "nav.start": "Get started",
  "hero.badge": "Built for modern campuses",
  "hero.title1": "Campus life,",
  "hero.title2": "one platform",
  "hero.subtitle":
    "Attendance, assignments, events, placements and clubs — everything students, faculty and coordinators need, together in a fast, secure and beautiful app.",
  "hero.start": "Get started free",
  "hero.explore": "Explore features",
  "stats.roles": "Role-based portals",
  "stats.entities": "Data entities",
  "stats.remote": "Remote ready",
  "stats.available": "Always available",
  "features.title": "Everything your campus needs, in one place",
  "features.subtitle":
    "Stop juggling WhatsApp groups and spreadsheets. Smart Campus brings every workflow together on a single, secure platform.",
  "f1.title": "Role-based dashboards",
  "f1.desc":
    "Students, faculty, coordinators and admins each get a tailored dashboard with exactly what they need.",
  "f2.title": "Attendance tracking",
  "f2.desc":
    "Faculty can create sessions and mark attendance in seconds. Students get live subject-wise analytics.",
  "f3.title": "Assignments & grading",
  "f3.desc":
    "Publish assignments with deadlines and rubrics, accept submissions and grade with feedback.",
  "f4.title": "Events with QR passes",
  "f4.desc":
    "Organize campus events, manage seat limits and hand out scannable QR entry passes to registered students.",
  "f5.title": "Placement hub",
  "f5.desc":
    "List openings with eligibility and CTC, let students apply with one click and track every application.",
  "f6.title": "Clubs & notifications",
  "f6.desc":
    "Real-time notifications for deadlines, attendance, events and placements keep everyone in sync.",
  "faq.title": "Frequently asked questions",
  "faq.subtitle": "Still curious? Reach out and we will help you out.",
  "footer.tagline":
    "The modern platform that brings students, faculty and coordinators together for a smoother campus life.",
  "footer.product": "Product",
  "footer.campus": "Campus",
  "footer.company": "Company",
  "footer.rights": "All rights reserved.",
} as const;

export type MessageKey = keyof typeof en;

const hi: Record<MessageKey, string> = {
  "nav.features": "विशेषताएँ",
  "nav.testimonials": "प्रशंसापत्र",
  "nav.faq": "सवाल-जवाब",
  "nav.signin": "साइन इन",
  "nav.start": "शुरू करें",
  "hero.badge": "आधुनिक कैंपस के लिए बनाया गया",
  "hero.title1": "कैंपस जीवन,",
  "hero.title2": "एक ही प्लेटफॉर्म पर",
  "hero.subtitle":
    "उपस्थिति, असाइनमेंट, इवेंट, प्लेसमेंट और क्लब — स्टूडेंट्स, फैकल्टी और कोऑर्डिनेटर्स के लिए सब कुछ एक तेज़, सुरक्षित और सुंदर ऐप में।",
  "hero.start": "मुफ्त में शुरू करें",
  "hero.explore": "विशेषताएँ देखें",
  "stats.roles": "रोल-आधारित पोर्टल",
  "stats.entities": "डेटा इकाइयाँ",
  "stats.remote": "रिमोट रेडी",
  "stats.available": "हमेशा उपलब्ध",
  "features.title": "आपके कैंपस को जो चाहिए, एक जगह",
  "features.subtitle":
    "WhatsApp ग्रुप और स्प्रेडशीट्स से छुटकारा। Smart Campus हर वर्कफ्लो को एक सुरक्षित प्लेटफॉर्म पर लाता है।",
  "f1.title": "रोल-आधारित डैशबोर्ड",
  "f1.desc": "स्टूडेंट्स, फैकल्टी, कोऑर्डिनेटर्स और एडमिन — सबको उनकी ज़रूरत के हिसाब से डैशबोर्ड मिलता है।",
  "f2.title": "उपस्थिति ट्रैकिंग",
  "f2.desc": "फैकल्टी सेकंडों में सेशन बनाकर उपस्थिति दर्ज करते हैं। स्टूडेंट्स को लाइव विषय-वार एनालिटिक्स मिलते हैं।",
  "f3.title": "असाइनमेंट और ग्रेडिंग",
  "f3.desc": "डेडलाइन और रूब्रिक के साथ असाइनमेंट प्रकाशित करें, सबमिशन स्वीकार करें और फीडबैक के साथ ग्रेड दें।",
  "f4.title": "QR पास के साथ इवेंट",
  "f4.desc": "कैंपस इवेंट आयोजित करें, सीट सीमा संभालें और स्कैन करने योग्य QR एंट्री पास बांटें।",
  "f5.title": "प्लेसमेंट हब",
  "f5.desc": "योग्यता और CTC के साथ नौकरियाँ पोस्ट करें, एक क्लिक में आवेदन करें और हर आवेदन ट्रैक करें।",
  "f6.title": "क्लब और सूचनाएँ",
  "f6.desc": "डेडलाइन, उपस्थिति, इवेंट और प्लेसमेंट की रीयल-टाइम सूचनाएँ सबको सिंक रखती हैं।",
  "faq.title": "अक्सर पूछे जाने वाले सवाल",
  "faq.subtitle": "और जानना हो तो हमसे संपर्क करें, हम मदद करेंगे।",
  "footer.tagline": "आधुनिक प्लेटफॉर्म जो स्टूडेंट्स, फैकल्टी और कोऑर्डिनेटर्स को एक साथ लाता है।",
  "footer.product": "प्रोडक्ट",
  "footer.campus": "कैंपस",
  "footer.company": "कंपनी",
  "footer.rights": "सर्वाधिकार सुरक्षित।",
};

const messages: Record<Locale, Record<MessageKey, string>> = { en, hi };

function subscribeLocale(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function readLocale(): Locale {
  try {
    return window.localStorage.getItem("lang") === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

function readLocaleServer(): Locale {
  return "en";
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, readLocale, readLocaleServer);
  const t = (key: MessageKey) => messages[locale][key] ?? messages.en[key];
  const toggleLocale = () => {
    const next: Locale = locale === "en" ? "hi" : "en";
    try {
      window.localStorage.setItem("lang", next);
      window.dispatchEvent(new Event("storage"));
    } catch {
      return;
    }
  };
  return { locale, t, toggleLocale };
}
