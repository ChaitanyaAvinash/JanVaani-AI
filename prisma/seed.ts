/**
 * Seed data is entirely synthetic — a fictional constituency invented for
 * this demo, not a real place. Ward names/coordinates are illustrative only.
 */
import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { analyzeSubmission, isGeminiConfigured } from "@/lib/gemini";
import type { Channel } from "@/generated/prisma/enums";

const WARDS = [
  {
    key: "ramapuram-town",
    name: "Ramapuram Town",
    nameHi: "रामापुरम शहर",
    nameTe: "రామాపురం పట్టణం",
    lat: 16.99,
    lng: 81.78,
    population: 42000,
    literacyRate: 82,
    unemploymentRate: 10,
    schoolEnrollment: 3100,
    schoolCapacity: 3400,
    nearestSchoolKm: 0.6,
    nearestHospitalKm: 1.0,
    households: 9300,
    householdsNoPipedWater: 400,
    electricityGapPct: 4,
    roadGapScore: 15,
    housingGapPct: 8,
  },
  {
    key: "kondapalli",
    name: "Kondapalli",
    nameHi: "कोंडापल्ली",
    nameTe: "కొండపల్లి",
    lat: 17.05,
    lng: 81.7,
    population: 28000,
    literacyRate: 68,
    unemploymentRate: 16,
    schoolEnrollment: 2450,
    schoolCapacity: 1600,
    nearestSchoolKm: 2.8,
    nearestHospitalKm: 6.5,
    households: 6100,
    householdsNoPipedWater: 1500,
    electricityGapPct: 12,
    roadGapScore: 35,
    housingGapPct: 18,
  },
  {
    key: "yellareddy-peta",
    name: "Yellareddy Peta",
    nameHi: "येल्लारेड्डी पेटा",
    nameTe: "ఎల్లారెడ్డి పేట",
    lat: 16.88,
    lng: 81.65,
    population: 19500,
    literacyRate: 61,
    unemploymentRate: 19,
    schoolEnrollment: 1400,
    schoolCapacity: 1500,
    nearestSchoolKm: 3.5,
    nearestHospitalKm: 9.2,
    households: 4200,
    householdsNoPipedWater: 3100,
    electricityGapPct: 22,
    roadGapScore: 40,
    housingGapPct: 26,
  },
  {
    key: "machavaram",
    name: "Machavaram",
    nameHi: "मचावरम",
    nameTe: "మచావరం",
    lat: 17.1,
    lng: 81.9,
    population: 31000,
    literacyRate: 64,
    unemploymentRate: 27,
    schoolEnrollment: 2900,
    schoolCapacity: 1900,
    nearestSchoolKm: 4.1,
    nearestHospitalKm: 7.8,
    households: 6700,
    householdsNoPipedWater: 2000,
    electricityGapPct: 18,
    roadGapScore: 38,
    housingGapPct: 22,
  },
  {
    key: "sitanagaram",
    name: "Sitanagaram",
    nameHi: "सीतानगरम",
    nameTe: "సీతానగరం",
    lat: 16.82,
    lng: 81.88,
    population: 16800,
    literacyRate: 59,
    unemploymentRate: 21,
    schoolEnrollment: 1250,
    schoolCapacity: 1300,
    nearestSchoolKm: 2.9,
    nearestHospitalKm: 5.4,
    households: 3600,
    householdsNoPipedWater: 900,
    electricityGapPct: 46,
    roadGapScore: 30,
    housingGapPct: 20,
  },
  {
    key: "bandarupalli",
    name: "Bandarupalli",
    nameHi: "बंडारुपल्ली",
    nameTe: "బండారుపల్లి",
    lat: 17.15,
    lng: 81.68,
    population: 23400,
    literacyRate: 71,
    unemploymentRate: 38,
    schoolEnrollment: 1700,
    schoolCapacity: 1750,
    nearestSchoolKm: 1.9,
    nearestHospitalKm: 4.0,
    households: 5100,
    householdsNoPipedWater: 700,
    electricityGapPct: 15,
    roadGapScore: 25,
    housingGapPct: 16,
  },
  {
    key: "peddapuram",
    name: "Peddapuram",
    nameHi: "पेड्डापुरम",
    nameTe: "పెద్దాపురం",
    lat: 16.95,
    lng: 82.0,
    population: 27600,
    literacyRate: 66,
    unemploymentRate: 18,
    schoolEnrollment: 2000,
    schoolCapacity: 2100,
    nearestSchoolKm: 2.2,
    nearestHospitalKm: 5.0,
    households: 6000,
    householdsNoPipedWater: 1100,
    electricityGapPct: 20,
    roadGapScore: 62,
    housingGapPct: 34,
  },
] as const;

const PROPOSALS = [
  {
    title: "Government ITI (Vocational Training Centre) — Machavaram",
    description:
      "New Industrial Training Institute proposed under the local development plan to address youth unemployment in Machavaram.",
    category: "employment_vocational" as const,
    estCostLakh: 450,
    wardKey: "machavaram",
  },
  {
    title: "Government ITI (Vocational Training Centre) — Bandarupalli",
    description:
      "New Industrial Training Institute proposed for Bandarupalli, which has the constituency's highest youth unemployment rate.",
    category: "employment_vocational" as const,
    estCostLakh: 420,
    wardKey: "bandarupalli",
  },
  {
    title: "New Primary Health Sub-Centre — Yellareddy Peta",
    description:
      "Proposed sub-centre to reduce the ~9km average distance residents currently travel for basic healthcare.",
    category: "healthcare" as const,
    estCostLakh: 180,
    wardKey: "yellareddy-peta",
  },
  {
    title: "Overhead Water Tank & Pipeline Extension — Yellareddy Peta",
    description:
      "Elevated storage tank and pipeline extension to fix the ward's unreliable and unsafe drinking-water supply.",
    category: "water_sanitation" as const,
    estCostLakh: 220,
    wardKey: "yellareddy-peta",
  },
  {
    title: "Government High School — Additional Classroom Block, Kondapalli",
    description:
      "New classroom block proposed to relieve overcrowding at the Kondapalli Zilla Parishad High School.",
    category: "education" as const,
    estCostLakh: 160,
    wardKey: "kondapalli",
  },
  {
    title: "11kV Feeder Line Upgrade — Sitanagaram",
    description:
      "Transformer and feeder-line upgrade proposed to reduce Sitanagaram's frequent power outages.",
    category: "electricity" as const,
    estCostLakh: 95,
    wardKey: "sitanagaram",
  },
  {
    title: "Road Widening & BT Road — Peddapuram to Highway",
    description:
      "Resurfacing and widening of the Peddapuram–highway link road, currently in poor condition with frequent accidents.",
    category: "roads_transport" as const,
    estCostLakh: 310,
    wardKey: "peddapuram",
  },
  {
    title: "Housing Scheme Expansion — Peddapuram",
    description:
      "Additional allocation under the pucca-housing scheme for kutcha-house households in Peddapuram.",
    category: "housing" as const,
    estCostLakh: 275,
    wardKey: "peddapuram",
  },
] as const;

interface SeedSubmission {
  wardKey: string;
  channel: Channel;
  daysAgo: number;
  text: string;
  citizenName?: string;
}

const SUBMISSIONS: SeedSubmission[] = [
  // Ramapuram Town — relatively well-served baseline ward
  {
    wardKey: "ramapuram-town",
    channel: "text",
    daysAgo: 5,
    text: "The park near the Ramapuram bus stand needs new benches and lighting, otherwise it's in decent shape.",
  },
  {
    wardKey: "ramapuram-town",
    channel: "voice",
    daysAgo: 20,
    text: "रामापुरम मार्केट रोड पर स्ट्रीट लाइट रात में बंद रहती है, इससे असुरक्षा महसूस होती है।",
    citizenName: "Anita Devi",
  },
  {
    wardKey: "ramapuram-town",
    channel: "text",
    daysAgo: 40,
    text: "రామాపురం పట్టణంలో చెత్త సేకరణ వారానికి ఒక్కసారే వస్తుంది, ఇంకా తరచుగా రావాలి.",
  },
  {
    wardKey: "ramapuram-town",
    channel: "text",
    daysAgo: 28,
    text: "There have been a few chain-snatching incidents near Ramapuram market at night, more police patrolling is needed.",
    citizenName: "K. Srinivas",
  },

  // Kondapalli — school overcrowding
  {
    wardKey: "kondapalli",
    channel: "text",
    daysAgo: 3,
    text: "Kondapalli Zilla Parishad High School has over 60 students crammed into one classroom built for 35. We urgently need additional classrooms.",
    citizenName: "Ramesh Babu",
  },
  {
    wardKey: "kondapalli",
    channel: "voice",
    daysAgo: 8,
    text: "कोंडापल्ली के सरकारी स्कूल में बच्चों को बैठने के लिए जगह नहीं है, तीन बच्चे एक बेंच पर बैठते हैं।",
  },
  {
    wardKey: "kondapalli",
    channel: "text",
    daysAgo: 15,
    text: "కొండపల్లి ప్రభుత్వ పాఠశాలలో తరగతి గదులు సరిపోవడం లేదు, పిల్లలు నేలపై కూర్చుంటున్నారు.",
  },
  {
    wardKey: "kondapalli",
    channel: "photo",
    daysAgo: 22,
    text: "[Photo attached] Overcrowded classroom at Kondapalli Government High School — students sharing desks three to a bench.",
  },
  {
    wardKey: "kondapalli",
    channel: "text",
    daysAgo: 35,
    text: "Please sanction additional teachers and classrooms for Kondapalli high school, enrollment has grown a lot in the last two years.",
    citizenName: "P. Lakshmi",
  },
  {
    wardKey: "kondapalli",
    channel: "voice",
    daysAgo: 23,
    text: "కొండపల్లిలో పంటలకు గిట్టుబాటు ధర రావడం లేదు, రైతులు ఇబ్బంది పడుతున్నారు.",
  },

  // Yellareddy Peta — drinking water crisis
  {
    wardKey: "yellareddy-peta",
    channel: "voice",
    daysAgo: 2,
    text: "ఎల్లారెడ్డి పేటలో మూడు రోజులకు ఒకసారి మాత్రమే మంచినీళ్లు వస్తున్నాయి, మహిళలు దూరం నుండి నీళ్లు మోసుకురావాల్సి వస్తోంది.",
    citizenName: "Padma",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "text",
    daysAgo: 4,
    text: "येल्लारेड्डी पेटा में पीने के पानी की भारी कमी है, नल कई दिनों तक सूखे रहते हैं।",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "text",
    daysAgo: 6,
    text: "There has been no piped water supply in Yellareddy Peta for over a week. Families are relying on a single borewell that runs dry by 9am.",
    citizenName: "M. Venkateswarlu",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "photo",
    daysAgo: 9,
    text: "[Photo attached] Long queue of women and children waiting at the only working handpump in Yellareddy Peta since early morning.",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "voice",
    daysAgo: 12,
    text: "गर्मियों में यहाँ पानी की समस्या और बढ़ जाती है, बच्चे स्कूल छोड़कर पानी लाने जाते हैं।",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "text",
    daysAgo: 18,
    text: "మా వార్డులో మంచినీటి పైప్‌లైన్ లీక్ అవుతోంది, మురుగు నీరు కలుస్తోంది.",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "text",
    daysAgo: 27,
    text: "We request an overhead water tank for Yellareddy Peta — the current supply schedule is unreliable and unsafe.",
    citizenName: "S. Rajeswari",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "whatsapp",
    daysAgo: 33,
    text: "पानी की टंकी जल्द बनवाई जाए, यह हमारी सबसे बड़ी समस्या है।",
  },
  {
    wardKey: "yellareddy-peta",
    channel: "text",
    daysAgo: 17,
    text: "यहाँ खेती के लिए सिंचाई की सुविधा नहीं है, बारिश पर ही निर्भर रहना पड़ता है।",
  },

  // Machavaram — the headline example: overcrowded school vs a weakly-backed vocational centre proposal
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 2,
    text: "Machavaram Government High School has 55 students per classroom and no separate room for the science lab. We need new classroom blocks urgently.",
    citizenName: "D. Nageswara Rao",
  },
  {
    wardKey: "machavaram",
    channel: "voice",
    daysAgo: 5,
    text: "మా పిల్లలకు స్కూల్ దూరంగా ఉంది, 4 కిలోమీటర్లు నడవాలి, దగ్గరలో మంచి స్కూల్ కావాలి.",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 7,
    text: "मचावरम स्कूल में बच्चों की संख्या बहुत बढ़ गई है, नए कमरे और शिक्षक चाहिए।",
  },
  {
    wardKey: "machavaram",
    channel: "photo",
    daysAgo: 11,
    text: "[Photo attached] Students of Machavaram High School sitting on the floor due to lack of classroom space.",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 14,
    text: "మచావరం పాఠశాలలో మరుగుదొడ్ల సౌకర్యం సరిపోవడం లేదు, ఎక్కువ గదులు కావాలి.",
  },
  {
    wardKey: "machavaram",
    channel: "voice",
    daysAgo: 17,
    text: "गाँव के स्कूल की बिल्डिंग बहुत पुरानी हो गई है, नई कक्षाएँ बनवाई जाएं।",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 21,
    text: "Requesting the MP's office to sanction additional classrooms at Machavaram school — this has been pending for two years.",
    citizenName: "B. Anand Kumar",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 26,
    text: "మా ఊరి స్కూల్‌లో స్థలం సరిపోవడం లేదు, విస్తరణ చేయాలి.",
  },
  {
    wardKey: "machavaram",
    channel: "whatsapp",
    daysAgo: 31,
    text: "Second request — Machavaram school classrooms are overcrowded, please prioritize this in the development plan.",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 45,
    text: "Some youth in Machavaram have asked about vocational training options, could a small skill centre be considered eventually?",
  },
  {
    wardKey: "machavaram",
    channel: "text",
    daysAgo: 12,
    text: "The nearest government hospital from Machavaram is almost 8km away, we need at least a primary health sub-centre here.",
    citizenName: "Y. Sitamma",
  },

  // Sitanagaram — power outages
  {
    wardKey: "sitanagaram",
    channel: "voice",
    daysAgo: 3,
    text: "సీతానగరంలో రోజుకు 4-5 సార్లు కరెంట్ పోతుంది, ట్రాన్స్‌ఫార్మర్ మార్చాలి.",
  },
  {
    wardKey: "sitanagaram",
    channel: "text",
    daysAgo: 6,
    text: "सीतानगरम में बिजली बार-बार जाती है, ट्रांसफार्मर बहुत पुराना हो गया है।",
  },
  {
    wardKey: "sitanagaram",
    channel: "text",
    daysAgo: 10,
    text: "Frequent power cuts in Sitanagaram, sometimes 5-6 times a day, damaging household appliances. The transformer needs replacement.",
    citizenName: "Ch. Ramana",
  },
  {
    wardKey: "sitanagaram",
    channel: "photo",
    daysAgo: 16,
    text: "[Photo attached] Old, sparking transformer near the Sitanagaram main road that needs urgent replacement.",
  },
  {
    wardKey: "sitanagaram",
    channel: "text",
    daysAgo: 24,
    text: "సీతానగరంలో వీధి దీపాలు కూడా సరిగ్గా వెలగడం లేదు.",
  },
  {
    wardKey: "sitanagaram",
    channel: "voice",
    daysAgo: 29,
    text: "बिजली की समस्या से खेती को भी नुकसान हो रहा है, मोटर नहीं चल पाती।",
  },

  // Bandarupalli — unemployment / vocational demand
  {
    wardKey: "bandarupalli",
    channel: "text",
    daysAgo: 4,
    text: "Many young people in Bandarupalli are unemployed after finishing school. A vocational training centre (ITI) here would help them get skilled jobs.",
    citizenName: "T. Kiran Kumar",
  },
  {
    wardKey: "bandarupalli",
    channel: "voice",
    daysAgo: 9,
    text: "బండారుపల్లిలో యువకులకు ఉద్యోగాలు లేవు, ఒక నైపుణ్య శిక్షణ కేంద్రం పెడితే బాగుంటుంది.",
  },
  {
    wardKey: "bandarupalli",
    channel: "text",
    daysAgo: 13,
    text: "बंडारुपल्ली में बेरोजगारी बहुत ज्यादा है, यहाँ आईटीआई या स्किल सेंटर खोला जाए।",
  },
  {
    wardKey: "bandarupalli",
    channel: "text",
    daysAgo: 19,
    text: "Requesting a vocational/skill development centre in Bandarupalli — most youth have to travel 20km for any training institute.",
    citizenName: "G. Swathi",
  },
  {
    wardKey: "bandarupalli",
    channel: "photo",
    daysAgo: 25,
    text: "[Photo attached] Group of unemployed youth in Bandarupalli who have been asking about skill training programs.",
  },
  {
    wardKey: "bandarupalli",
    channel: "whatsapp",
    daysAgo: 38,
    text: "Following up on our request for an ITI in Bandarupalli, this would really help the local youth.",
  },

  // Peddapuram — roads and housing
  {
    wardKey: "peddapuram",
    channel: "text",
    daysAgo: 5,
    text: "The road connecting Peddapuram to the highway is full of large potholes, it's dangerous especially at night and during monsoon.",
    citizenName: "V. Appa Rao",
  },
  {
    wardKey: "peddapuram",
    channel: "voice",
    daysAgo: 8,
    text: "पेड्डापुरम की सड़क बहुत खराब है, बारिश में गड्ढों से एक्सीडेंट का डर रहता है।",
  },
  {
    wardKey: "peddapuram",
    channel: "photo",
    daysAgo: 14,
    text: "[Photo attached] Deep pothole on the Peddapuram main road that has been there for over 6 months.",
  },
  {
    wardKey: "peddapuram",
    channel: "text",
    daysAgo: 20,
    text: "పెద్దాపురంలో రోడ్డు పాడైపోయింది, బస్సులు కూడా సరిగ్గా రావడం లేదు.",
  },
  {
    wardKey: "peddapuram",
    channel: "text",
    daysAgo: 30,
    text: "Many houses in Peddapuram are still kutcha (temporary) structures. Requesting inclusion in the housing scheme.",
    citizenName: "N. Saraswathi",
  },
  {
    wardKey: "peddapuram",
    channel: "voice",
    daysAgo: 36,
    text: "పెద్దాపురంలో చాలా ఇళ్ళు పాత మట్టి ఇళ్ళే ఉన్నాయి, పక్కా ఇల్లు పథకంలో చేర్చాలి.",
  },
];

async function processInBatches<T, R>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log(
    isGeminiConfigured()
      ? "GEMINI_API_KEY detected — seeding with live Gemini analysis."
      : "No GEMINI_API_KEY set — seeding with the offline keyword fallback (set the key and re-run for full multilingual analysis)."
  );

  console.log("Clearing existing data...");
  await prisma.submission.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.ward.deleteMany();

  console.log(`Creating ${WARDS.length} wards...`);
  const wardIdByKey = new Map<string, string>();
  for (const w of WARDS) {
    const { key, ...data } = w;
    const created = await prisma.ward.create({ data });
    wardIdByKey.set(key, created.id);
  }

  console.log(`Creating ${PROPOSALS.length} development-plan proposals...`);
  for (const p of PROPOSALS) {
    const { wardKey, ...data } = p;
    await prisma.proposal.create({
      data: { ...data, wardId: wardIdByKey.get(wardKey) },
    });
  }

  console.log(
    `Analyzing and creating ${SUBMISSIONS.length} citizen submissions ` +
      (isGeminiConfigured()
        ? "one at a time (free-tier Gemini quotas are a few requests/minute — this will take a while)..."
        : "...")
  );
  const now = Date.now();
  let done = 0;
  await processInBatches(SUBMISSIONS, isGeminiConfigured() ? 1 : 5, async (s) => {
    const ward = WARDS.find((w) => w.key === s.wardKey)!;
    const createdAt = new Date(now - s.daysAgo * 86_400_000);
    try {
      const analysis = await analyzeSubmission(
        { text: s.text, wardName: ward.name },
        { patient: true }
      );
      await prisma.submission.create({
        data: {
          channel: s.channel,
          rawText: s.text,
          language: analysis.language,
          translatedText: analysis.translatedText,
          category: analysis.category,
          urgency: analysis.urgency,
          sentiment: analysis.sentiment,
          summary: analysis.summary,
          photoDescription: analysis.photoDescription,
          status: "analyzed",
          citizenName: s.citizenName,
          wardId: wardIdByKey.get(s.wardKey),
          lat: ward.lat,
          lng: ward.lng,
          createdAt,
        },
      });
    } catch (err) {
      console.error(`Failed to analyze submission (${s.wardKey}):`, err);
      await prisma.submission.create({
        data: {
          channel: s.channel,
          rawText: s.text,
          status: "error",
          errorMessage: String(err),
          citizenName: s.citizenName,
          wardId: wardIdByKey.get(s.wardKey),
          lat: ward.lat,
          lng: ward.lng,
          createdAt,
        },
      });
    } finally {
      done += 1;
      process.stdout.write(`\r  ${done}/${SUBMISSIONS.length}`);
    }
  });
  console.log("\nDone.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
