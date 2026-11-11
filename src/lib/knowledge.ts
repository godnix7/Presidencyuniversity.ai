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

const SITE = "https://presidencyuniversity.in/";

/**
 * Supplementary corpus retrieved from the public university website (home page, 11 Nov 2026).
 * Only text that actually appears on the site is stored here.
 */
export const WEBSITE_CHUNKS: Chunk[] = [
  {
    id: "W1",
    category: "General",
    origin: "website",
    text: "Presidency University campus address: Rajanukunte, Yelahanka, Bengaluru, Karnataka, Pin: 560119, India.",
    keywords: "address location where campus situated located city map reach directions bengaluru bangalore",
    url: SITE,
  },
  {
    id: "W2",
    category: "General",
    origin: "website",
    text: "Phone numbers listed on the university website: admission enquiries +91 9022092222; other related queries +91 080-23093500. Admission email: admission@presidencyuniversity.in.",
    keywords: "phone number call contact telephone email mail enquiry admission admissions helpline reach",
    url: SITE,
  },
  {
    id: "W3",
    category: "Academics",
    origin: "website",
    text: "Schools listed on the university website: Computer Science and Engineering; Engineering; Information Science; Management; Commerce; Law; Design; Media Studies; Liberal Arts and Sciences; Allied and Healthcare Professions; Artificial Intelligence and Advanced Computing.",
    keywords: "school schools department departments programmes programs courses branches streams offered engineering law management design",
    url: SITE,
  },
  {
    id: "W4",
    category: "Examinations",
    origin: "website",
    text: "The university website has an Examinations section at https://presidencyuniversity.in/academics/examinations.",
    keywords: "exam examination timetable notification website link page official channel online",
    url: "https://presidencyuniversity.in/academics/examinations",
  },
  {
    id: "W5",
    category: "Placements",
    origin: "website",
    text: "The university website has a Placements section at https://presidencyuniversity.in/placements/placement-overview. It states that a dedicated learning and development team of 18 trainers runs student training with the support of hired professional organizations.",
    keywords: "placement training trainers website link page overview learning development career",
    url: "https://presidencyuniversity.in/placements/placement-overview",
  },
  {
    id: "W6",
    category: "Library",
    origin: "website",
    text: "The university library has its own website at https://library.presidencyuniversity.in/.",
    keywords: "library website link page online catalogue portal books",
    url: "https://library.presidencyuniversity.in/",
  },
  {
    id: "W7",
    category: "Hostel",
    origin: "website",
    text: "Student hostel facilities are described on the university website at https://presidencyuniversity.in/student-life/student-hostel-facilities.",
    keywords: "hostel facilities accommodation website link page rooms student life",
    url: "https://presidencyuniversity.in/student-life/student-hostel-facilities",
  },
  {
    id: "W8",
    category: "Administration",
    origin: "website",
    text: "The university website has a Contact page at https://presidencyuniversity.in/contact and links to an online student helpdesk portal at https://presidencyuniversity.linways.com/.",
    keywords: "contact page portal helpdesk linways online student login office administration website link",
    url: "https://presidencyuniversity.in/contact",
  },
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
