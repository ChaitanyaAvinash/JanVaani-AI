export type Lang = "en" | "hi" | "te";

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "te", label: "తెలుగు" },
];

export const STRINGS: Record<Lang, Record<string, string>> = {
  en: {
    appName: "JanVaani",
    tagline: "Voice of the People",
    heroTitle: "Tell your MP what your area needs",
    heroSubtitle:
      "Speak, type, or attach a photo — in English, Hindi, or Telugu. Your submission is read by AI and added to your area's development priorities.",
    selectWard: "Your area",
    selectWardPlaceholder: "Choose your ward",
    yourName: "Your name (optional)",
    yourNamePlaceholder: "Leave blank to stay anonymous",
    textPlaceholder: "Describe the issue…",
    send: "Send",
    sending: "Sending…",
    record: "Record voice",
    recording: "Recording… tap to stop",
    attachPhoto: "Attach photo",
    removeAttachment: "Remove",
    assistantGreeting:
      "Namaste! Tell me about a development issue in your area — a school, road, water supply, anything. You can type, speak, or send a photo.",
    thanksHeading: "Received — thank you.",
    addedTo: "Added to the",
    priorityListFor: "priority list for",
    detectedLanguage: "Detected language",
    recentInArea: "Recently reported near you",
    noRecent: "No submissions from this area yet — be the first.",
    viewDashboard: "MP dashboard →",
    errorGeneric: "Something went wrong. Please try again.",
    errorNeedContent: "Please add some text, a recording, or a photo first.",
    errorNeedWard: "Please select your area first.",
  },
  hi: {
    appName: "जनवाणी",
    tagline: "जनता की आवाज़",
    heroTitle: "अपने सांसद को बताएं आपके क्षेत्र को क्या चाहिए",
    heroSubtitle:
      "बोलें, लिखें, या फोटो भेजें — हिंदी, अंग्रेज़ी या तेलुगु में। आपका सुझाव AI द्वारा पढ़ा जाएगा और आपके क्षेत्र की प्राथमिकता सूची में जोड़ा जाएगा।",
    selectWard: "आपका क्षेत्र",
    selectWardPlaceholder: "अपना वार्ड चुनें",
    yourName: "आपका नाम (वैकल्पिक)",
    yourNamePlaceholder: "गुमनाम रहने के लिए खाली छोड़ें",
    textPlaceholder: "समस्या बताएं…",
    send: "भेजें",
    sending: "भेजा जा रहा है…",
    record: "आवाज़ रिकॉर्ड करें",
    recording: "रिकॉर्डिंग हो रही है… रोकने के लिए टैप करें",
    attachPhoto: "फोटो जोड़ें",
    removeAttachment: "हटाएं",
    assistantGreeting:
      "नमस्ते! अपने क्षेत्र की किसी समस्या के बारे में बताएं — स्कूल, सड़क, पानी, कुछ भी। आप लिख सकते हैं, बोल सकते हैं, या फोटो भेज सकते हैं।",
    thanksHeading: "प्राप्त हुआ — धन्यवाद।",
    addedTo: "इसे जोड़ दिया गया है",
    priorityListFor: "की प्राथमिकता सूची में",
    detectedLanguage: "पहचानी गई भाषा",
    recentInArea: "आपके क्षेत्र में हाल की शिकायतें",
    noRecent: "इस क्षेत्र से अभी तक कोई सुझाव नहीं — पहला आप हो सकते हैं।",
    viewDashboard: "सांसद डैशबोर्ड →",
    errorGeneric: "कुछ गड़बड़ हो गई। कृपया फिर से प्रयास करें।",
    errorNeedContent: "कृपया पहले कुछ टेक्स्ट, रिकॉर्डिंग या फोटो जोड़ें।",
    errorNeedWard: "कृपया पहले अपना क्षेत्र चुनें।",
  },
  te: {
    appName: "జనవాణి",
    tagline: "ప్రజల స్వరం",
    heroTitle: "మీ ప్రాంతానికి ఏమి కావాలో మీ ఎంపీకి చెప్పండి",
    heroSubtitle:
      "మాట్లాడండి, టైప్ చేయండి, లేదా ఫోటో పంపండి — తెలుగు, హిందీ లేదా ఇంగ్లీష్‌లో. మీ విన్నపాన్ని AI చదివి మీ ప్రాంత ప్రాధాన్యతల జాబితాలో చేరుస్తుంది.",
    selectWard: "మీ ప్రాంతం",
    selectWardPlaceholder: "మీ వార్డు ఎంచుకోండి",
    yourName: "మీ పేరు (ఐచ్ఛికం)",
    yourNamePlaceholder: "అనామకంగా ఉండటానికి ఖాళీగా వదలండి",
    textPlaceholder: "సమస్యను వివరించండి…",
    send: "పంపండి",
    sending: "పంపుతోంది…",
    record: "వాయిస్ రికార్డ్ చేయండి",
    recording: "రికార్డింగ్ జరుగుతోంది… ఆపడానికి నొక్కండి",
    attachPhoto: "ఫోటో జోడించండి",
    removeAttachment: "తీసివేయండి",
    assistantGreeting:
      "నమస్తే! మీ ప్రాంతంలోని ఒక అభివృద్ధి సమస్య గురించి చెప్పండి — పాఠశాల, రోడ్డు, నీరు, ఏదైనా. మీరు టైప్ చేయవచ్చు, మాట్లాడవచ్చు, లేదా ఫోటో పంపవచ్చు.",
    thanksHeading: "అందింది — ధన్యవాదాలు.",
    addedTo: "దీనిని జోడించారు",
    priorityListFor: "ప్రాధాన్యతల జాబితాలో",
    detectedLanguage: "గుర్తించిన భాష",
    recentInArea: "మీ ప్రాంతంలో ఇటీవలి ఫిర్యాదులు",
    noRecent: "ఈ ప్రాంతం నుండి ఇంకా విన్నపాలు లేవు — మొదటిది మీరే కండి.",
    viewDashboard: "ఎంపీ డాష్‌బోర్డ్ →",
    errorGeneric: "ఏదో పొరపాటు జరిగింది. దయచేసి మళ్ళీ ప్రయత్నించండి.",
    errorNeedContent: "దయచేసి ముందుగా టెక్స్ట్, రికార్డింగ్ లేదా ఫోటో జోడించండి.",
    errorNeedWard: "దయచేసి ముందుగా మీ ప్రాంతం ఎంచుకోండి.",
  },
};

export function t(lang: Lang, key: string): string {
  return STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
}

export function wardLabel(
  ward: { name: string; nameHi: string | null; nameTe: string | null },
  lang: Lang
): string {
  if (lang === "hi") return ward.nameHi || ward.name;
  if (lang === "te") return ward.nameTe || ward.name;
  return ward.name;
}
