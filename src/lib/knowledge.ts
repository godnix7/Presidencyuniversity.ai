export type Category =
  | "Academics"
  | "Attendance"
  | "Examinations"
  | "Placements"
  | "Library"
  | "Hostel"
  | "Administration"
  | "Events"
  | "General";

export interface Chunk {
  id: string;
  category: Category;
  /** "sample" = official competition data. "website" = public presidencyuniversity.in page. */
  origin: "sample" | "website";
  text: string;
  /** Index-only terms that help the retriever match paraphrases. Never shown as facts. */
  keywords: string;
  url?: string;
}

/** The 8 facts supplied in the TECHNOPIA 2.0 problem statement (sample competition data). */
export const SAMPLE_CHUNKS: Chunk[] = [
  {
    id: "S1",
    category: "Academics",
    origin: "sample",
    text: "Students may contact their faculty advisor for academic-related assistance.",
    keywords: "academic academics study studies subject course marks grades backlog mentor doubt help problem advisor faculty teacher",
  },
  {
    id: "S2",
    category: "Attendance",
    origin: "sample",
    text: "Students should follow the minimum attendance requirement prescribed by university regulations.",
    keywords: "attendance percentage percent minimum shortage absent leave classes bunk present condonation",
  },
  {
    id: "S3",
    category: "Examinations",
    origin: "sample",
    text: "Examination timetables and notifications are published through official university channels.",
    keywords: "exam exams examination timetable schedule date datesheet hall ticket result results notification test midterm endterm semester",
  },
  {
    id: "S4",
    category: "Placements",
    origin: "sample",
    text: "Students may contact the Placement Department for training and placement-related information.",
    keywords: "placement placements job jobs internship company recruit recruitment interview resume training career campus drive package",
  },
  {
    id: "S5",
    category: "Library",
    origin: "sample",
    text: "Students may access library resources according to the library's timings and regulations.",
    keywords: "library book books borrow issue return journal reading timings hours open close fine resources",
  },
  {
    id: "S6",
    category: "Hostel",
    origin: "sample",
    text: "Hostel-related complaints should be submitted to the Hostel Administration.",
    keywords: "hostel room mess food warden accommodation complaint complain roommate water wifi maintenance stay",
  },
  {
    id: "S7",
    category: "Administration",
    origin: "sample",
    text: "Students may contact the respective administrative office for certificates and student records.",
    keywords: "certificate certificates bonafide transcript record records document documents admin administration office id card marksheet",
  },
  {
    id: "S8",
    category: "Events",
    origin: "sample",
    text: "University event announcements are shared through official communication channels.",
    keywords: "event events fest festival hackathon workshop seminar club announcement cultural technical competition",
  },
];

/**
 * Supplementary corpus taken from public pages of presidencyuniversity.in (fetched 11 Nov 2026).
 * Only facts that appear on those pages are stored here.
 */
export const WEBSITE_CHUNKS: Chunk[] = [
  {
    "id": "W1",
    "category": "General",
    "origin": "website",
    "text": "Presidency University main campus address: Rajanukunte, Yelahanka, Bengaluru, Karnataka, Pin: 560119, India. City office: University House, 8/1, King Street, Richmond Town, Bengaluru, Pin: 560025.",
    "keywords": "address location where campus situated located city office map reach directions bengaluru bangalore",
    "url": "https://presidencyuniversity.in/contact"
  },
  {
    "id": "W2",
    "category": "General",
    "origin": "website",
    "text": "Contact details on the university website: University board line +91 080-23093500 and +91 080-44787350. Admission enquiries +91 9022092222 and +91 9024060000. General email info@presidencyuniversity.in. Admission email admission@presidencyuniversity.in.",
    "keywords": "phone number call contact telephone email mail enquiry admission admissions helpline reach board line general",
    "url": "https://presidencyuniversity.in/contact"
  },
  {
    "id": "W3",
    "category": "Academics",
    "origin": "website",
    "text": "Schools listed on the university website: Computer Science and Engineering; Engineering; Information Science; Management; Commerce; Law; Design; Media Studies; Liberal Arts and Sciences; Allied and Healthcare Professions; Artificial Intelligence and Advanced Computing.",
    "keywords": "school schools department departments programmes programs courses branches streams offered engineering law management design",
    "url": "https://presidencyuniversity.in/"
  },
  {
    "id": "W4",
    "category": "Examinations",
    "origin": "website",
    "text": "According to the university website, the Examination Cell handles examination administration and the Controller of Examinations oversees digital valuation. Mr. Chandrashekhar Ingle is listed as Controller of Examinations. Assessment types listed: end-term, mid-term, quizzes, summer term and improvement examinations.",
    "keywords": "exam examination cell controller coe who runs conducts incharge head assessment types midterm endterm quiz summer improvement makeup",
    "url": "https://presidencyuniversity.in/academics/examinations"
  },
  {
    "id": "W5",
    "category": "Examinations",
    "origin": "website",
    "text": "According to the university website, results (semester-wise results, grade review outcomes, make-up and summer term results) are published mainly through the Linways portal under Controller of Examinations, View Results. Notifications such as make-up examination registration, admit cards and end-term notices are posted on the Examinations page, which also links to a Time Table page. The page does not list individual exam dates.",
    "keywords": "exam result results marks portal linways admit card hall ticket notification timetable time table schedule makeup where check view online",
    "url": "https://presidencyuniversity.in/academics/examinations"
  },
  {
    "id": "W6",
    "category": "Examinations",
    "origin": "website",
    "text": "According to the university website, the university uses a digital valuation system and a relative grading system benchmarked against the class average. Review of grades applies only to theory courses. Document verification costs Rs. 1000 per verification request, payable before processing.",
    "keywords": "grading grade grades relative evaluation valuation revaluation review recheck verification fee document cgpa marks",
    "url": "https://presidencyuniversity.in/academics/examinations"
  },
  {
    "id": "W7",
    "category": "Placements",
    "origin": "website",
    "text": "According to the university website, placement preparation includes certifications in AI, Data Science, Cybersecurity and Digital Marketing, aptitude sessions, soft skills classes, pre-placement sessions and mock interviews, with personalised placement support for every eligible student through the final year. Both on-campus and virtual placement drives are held. A learning and development team of 18 trainers runs student training.",
    "keywords": "placement training trainers aptitude soft skills mock interview certification drive drives career preparation support resume internship",
    "url": "https://presidencyuniversity.in/placements/placement-overview"
  },
  {
    "id": "W8",
    "category": "Placements",
    "origin": "website",
    "text": "Recruiters named in student testimonials on the university website include Tata Electronics, Capgemini, BNP Paribas, OpenText, Clarivate, Rakuten, KPMG, Deloitte and Quest Global. The website does not list a placement-specific phone number or email.",
    "keywords": "placement companies company recruiters recruiter hiring visit who comes jobs offers contact email",
    "url": "https://presidencyuniversity.in/placements/placement-overview"
  },
  {
    "id": "W9",
    "category": "Library",
    "origin": "website",
    "text": "Library timings on the library website: Monday to Saturday 8:30 AM to 6:30 PM, with issue and return from 9:00 AM to 5:30 PM. On the 1st and 3rd Saturday it is open 8:30 AM to 4:30 PM. Closed on Sundays and university-declared holidays. Timings may vary during exams and holidays.",
    "keywords": "library timings timing hours open opens close closes closing time when sunday saturday holiday issue return working",
    "url": "https://library.presidencyuniversity.in/"
  },
  {
    "id": "W10",
    "category": "Library",
    "origin": "website",
    "text": "According to the library website, services include borrowing, digital resources, scanning, OPAC catalogue search and research support (plagiarism checking, reference management tools, citation guidance). E-resources are available through EBSCO, Knimbus and PULOAR. To borrow, registered members present their University ID card at the circulation desk. Loan limits and durations depend on member category and are not listed.",
    "keywords": "library book books borrow issue borrowing limit how many ebook ejournal journal database research plagiarism opac catalogue id card services resources",
    "url": "https://library.presidencyuniversity.in/"
  },
  {
    "id": "W11",
    "category": "Hostel",
    "origin": "website",
    "text": "According to the university website, there are three hostels for boys and girls, with twin-shared and triple-shared rooms furnished with bed cots, study table and chairs, cupboards and free Wi-Fi. Amenities include a dining area, laundry rooms, common rooms with TV, indoor and outdoor games and purified drinking water. Vegetarian and non-vegetarian meals are served four times a day.",
    "keywords": "hostel room rooms sharing facilities accommodation wifi mess food meals laundry amenities stay furniture types",
    "url": "https://presidencyuniversity.in/student-life/student-hostel-facilities"
  },
  {
    "id": "W12",
    "category": "Hostel",
    "origin": "website",
    "text": "According to the university website, hostels have round-the-clock security with guards and CCTV. The girls hostel has four wardens under a resident officer and each boys hostel has two wardens; all hostels come under the student housing department. Each hostel has a medical room with a nurse available at night. Hostel allotment is first-come, first-served with random room allotment, and cannot be changed once made. Hostel fees and the complaint procedure are not listed on the page.",
    "keywords": "hostel warden wardens security safety cctv medical nurse emergency allotment allot change room fee fees housing department registration apply",
    "url": "https://presidencyuniversity.in/student-life/student-hostel-facilities"
  },
  {
    "id": "W13",
    "category": "Administration",
    "origin": "website",
    "text": "The university website has a Contact page and links to an online student portal (Linways) at https://presidencyuniversity.linways.com/. For general queries the listed board line is +91 080-23093500 and the general email is info@presidencyuniversity.in.",
    "keywords": "contact page portal helpdesk linways online student login office administration website link certificate records general query",
    "url": "https://presidencyuniversity.in/contact"
  }
];

export const ALL_CHUNKS: Chunk[] = [...SAMPLE_CHUNKS, ...WEBSITE_CHUNKS];

const STOPWORDS = new Set(
  "a an the is are was were be been am i me my we our you your to of in on for from at by with and or if it its this that these those do does did can could should would will shall may might have has had how what when where who whom which why about into as so any some there their them they not no".split(
    " ",
  ),
);

/** Very small suffix stemmer so "complaints", "complaining" and "complain" match. */
function stem(token: string): string {
  return token.replace(/(ations|ation|ments|ment|ings|ing|ies|es|s)$/, "") || token;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t))
    .map(stem);
}

interface IndexedChunk {
  chunk: Chunk;
  termFreq: Map<string, number>;
  length: number;
}

const INDEX: IndexedChunk[] = ALL_CHUNKS.map((chunk) => {
  const tokens = tokenize(`${chunk.category} ${chunk.text} ${chunk.keywords}`);
  const termFreq = new Map<string, number>();
  for (const t of tokens) termFreq.set(t, (termFreq.get(t) ?? 0) + 1);
  return { chunk, termFreq, length: tokens.length };
});

const DOC_FREQ = new Map<string, number>();
for (const doc of INDEX) {
  for (const term of doc.termFreq.keys()) DOC_FREQ.set(term, (DOC_FREQ.get(term) ?? 0) + 1);
}
const AVG_LENGTH = INDEX.reduce((sum, d) => sum + d.length, 0) / INDEX.length;

export interface RetrievedChunk {
  chunk: Chunk;
  score: number;
}

/** BM25 ranking over the knowledge corpus. Returns the top-k chunks with a positive score. */
export function retrieve(query: string, k = 5): RetrievedChunk[] {
  const terms = tokenize(query);
  const K1 = 1.4;
  const B = 0.6;
  return INDEX.map((doc) => {
    let score = 0;
    for (const term of terms) {
      const tf = doc.termFreq.get(term);
      if (!tf) continue;
      const df = DOC_FREQ.get(term) ?? 0;
      const idf = Math.log(1 + (INDEX.length - df + 0.5) / (df + 0.5));
      score += (idf * tf * (K1 + 1)) / (tf + K1 * (1 - B + (B * doc.length) / AVG_LENGTH));
    }
    return { chunk: doc.chunk, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

export function findChunk(id: string): Chunk | undefined {
  return ALL_CHUNKS.find((c) => c.id === id);
}
