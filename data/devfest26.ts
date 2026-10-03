// Content for the DevFest Jos 2026 landing page.
// Anything still unannounced is `null` — the UI shows a "coming soon" state
// until you fill it in. Update the values here, not in the components.

const cld = (path: string) =>
  `https://res.cloudinary.com/dxssytv0p/image/upload/${path}`;

export const COMMUNITY_URL = "https://gdg.community.dev/gdg-jos/";
export const WHATSAPP_URL = "https://chat.whatsapp.com/FZbv4sddTIgAiK9zZ9B7m3?mode=gi_t";

export const event = {
  name: "DevFest Jos 2026",
  city: "Jos",
  region: "Plateau State, Nigeria",
  /** ISO date-time of doors opening (WAT). Enables the countdown. */
  startsAt: "2026-10-17T09:00:00+01:00" as string | null,
  /** Human label shown in the hero. */
  dateLabel: "Sat, 17 Oct 2026" as string | null,
  /** Long form used on tickets. */
  dateTimeLabel: "Oct 17, 2026, 9:00 AM (WAT)",
  /** Short venue name for the hero. */
  venue: "Odilin's Event Center" as string | null,
  /** Full street address (FAQ, maps link). */
  address: "5/6 Nunku Street, off Akila Machunga Road, behind National Library" as string | null,
  /** Call for speakers link. */
  speakerUrl: null as string | null,
  sponsorUrl: COMMUNITY_URL,
  volunteerUrl: COMMUNITY_URL,
};

export const mapsHref = event.venue
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      [event.venue, event.address, event.city, "Plateau State"].filter(Boolean).join(", "),
    )}`
  : null;

export const ticketHref = "/tickets";
export const ticketLabel = "Get tickets";

// Absolute ("/#…") so the nav also works from the ticket pages.
export const navLinks = [
  { label: "About", href: "/#about" },
  { label: "Tracks", href: "/#tracks" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Tickets", href: "/tickets" },
  { label: "FAQ", href: "/#faq" },
];

export type PillTone = "blue" | "red" | "yellow" | "green" | "sky" | "mint" | "sun" | "pink" | "white";

/** Labels that rain down in the hero. */
export const heroPills: { label: string; tone: PillTone }[] = [
  { label: "Gemini", tone: "blue" },
  { label: "AI Agents", tone: "sun" },
  { label: "Android", tone: "green" },
  { label: "Flutter", tone: "sky" },
  { label: "Firebase", tone: "yellow" },
  { label: "Google Cloud", tone: "red" },
  { label: "Web", tone: "mint" },
  { label: "Kotlin", tone: "pink" },
  { label: "Developers", tone: "white" },
  { label: "Designers", tone: "blue" },
  { label: "Founders", tone: "green" },
  { label: "Students", tone: "sun" },
  { label: "Security", tone: "red" },
  { label: "Jetpack Compose", tone: "mint" },
  { label: "Vertex AI", tone: "sky" },
  { label: "Dart", tone: "yellow" },
  { label: "Chrome", tone: "pink" },
  { label: "Open Source", tone: "white" },
  { label: "Product", tone: "green" },
  { label: "Keras", tone: "red" },
  { label: "Angular", tone: "blue" },
  { label: "Go", tone: "sun" },
  { label: "Community", tone: "mint" },
  { label: "Women Techmakers", tone: "pink" },
  { label: "Maps", tone: "sky" },
  { label: "Cloud Run", tone: "yellow" },
];

/** DevFest Jos 2026 speakers. Photos are background-removed cut-outs in public/speakers. */
export const speakers2026: { name: string; role: string; image: string }[] = [
  // Order also sets each card's colour (blue, red, yellow, green, …), chosen to contrast with outfits.
  { name: "Dev Longs", role: "Lead Engineer, Blockfuse Labs", image: "/speakers/dev-longs.webp" },
  { name: "Christie Dasaro", role: "ICT Coordinator, ECWA", image: "/speakers/christie-dasaro.webp" },
  { name: "Manji Wilson", role: "Chief Technical Adviser to the Governor of Plateau State", image: "/speakers/manji-wilson.webp" },
  { name: "Nnamdi Ibe", role: "CEO, Axia Hub", image: "/speakers/nnamdi-ibe.webp" },
  { name: "Kyendi Hope Fwangter", role: "Panel Moderator", image: "/speakers/kyendi-hope-fwangter.webp" },
];

/** DevFest Jos 2026 volunteer crew. Local photos live in public/volunteers. */
export const volunteers2026: { name: string; role: string; image: string }[] = [
  { name: "Nshe Velnoe David", role: "Volunteer Team Lead · Social Media · Publicity", image: "https://res.cloudinary.com/dxssytv0p/image/upload/v1758341910/Rectangle_307_ysrn5b.png" },
  { name: "Ibrahim Fkyafa Musa", role: "Speakers and Guests", image: "/volunteers/ibrahim-fkyafa-musa.webp" },
  { name: "Itse Collins Arin", role: "Social Media", image: "/volunteers/itse-collins-arin.webp" },
  { name: "SamY", role: "Design", image: "/volunteers/samy.webp" },
  { name: "Ononuju Henry", role: "Registration · Social Media", image: "/volunteers/ononuju-henry.webp" },
  { name: "James Peter", role: "Registration · Media and Publicity", image: "/volunteers/james-peter.webp" },
  { name: "Pidima Zumji Gomerep", role: "Registration · Accreditation", image: "/volunteers/pidima-zumji-gomerep.webp" },
  { name: "Catherine Ringbyen Wuyep", role: "Speakers and Guests · Partnership and Sponsorship", image: "/volunteers/catherine-wuyep.webp" },
  { name: "Retyit Samuel Brengshak", role: "Media and Publicity · Speakers and Guests", image: "/volunteers/retyit-brengshak.webp" },
  { name: "Jubilant Agida", role: "Partnership and Sponsorship", image: "/volunteers/jubilant-agida.webp" },
];

/** 2025 volunteers now on the 2026 crew (shown there, not repeated as alumni). */
export const returningVolunteers2025 = [
  "Wuyep Catherine R.",
  "Ise Collins Arin",
  "James Peter",
  "Pidima Zumji G.",
  "Retyit Brengshak",
  "Jubilant Agida",
  "Nshe Velnoe",
];

/** 2025 volunteers still shown on /volunteers (exact names from data/data.ts). */
export const shownAlumni2025 = ["Michael Olapade O.", "Ayam Samuel"];

export const pastStats = [
  { value: 500, suffix: "+", label: "Attendees", tone: "blue" },
  { value: 17, suffix: "", label: "Speakers", tone: "green" },
  { value: 8, suffix: "", label: "Sessions", tone: "yellow" },
  { value: 5, suffix: "", label: "Tracks", tone: "red" },
] as const;

export const tracks = [
  {
    no: "01",
    title: "AI & Agents",
    blurb: "Build with Gemini, design agent workflows and ship AI features people trust.",
    tags: ["Gemini", "Vertex AI", "Agents"],
    tone: "blue",
  },
  {
    no: "02",
    title: "Mobile",
    blurb: "Modern Android and cross-platform apps with Kotlin, Compose and Flutter.",
    tags: ["Android", "Flutter", "Compose"],
    tone: "green",
  },
  {
    no: "03",
    title: "Web",
    blurb: "Fast, accessible web apps with the latest from Chrome and the open web.",
    tags: ["Chrome", "Angular", "Web AI"],
    tone: "yellow",
  },
  {
    no: "04",
    title: "Cloud & Security",
    blurb: "Deploy, secure and scale real products on Google Cloud and Firebase.",
    tags: ["Cloud Run", "Firebase", "Security"],
    tone: "red",
  },
  {
    no: "05",
    title: "Product & Career",
    blurb: "Design, product thinking and the career moves that compound.",
    tags: ["Design", "Product", "Careers"],
    tone: "sky",
  },
] as const;

export const gallery = {
  stage: cld("v1758289190/devfestbanner_v12utp.jpg"),
  speaker: cld("v1758292404/pic4_aphqof.jpg"),
  selfie: cld("v1758371946/WhatsApp_Image_2025-09-20_at_11.40.01_c4i71t.jpg"),
  audience: cld("v1758292408/pic2_cwzwle.jpg"),
  checkin: cld("v1758292385/pic5_gifxgq.png"),
  logoG: cld("v1758371949/WhatsApp_Image_2025-09-20_at_11.40.00_ytlbpn.jpg"),
  wtm: cld("v1758371954/WhatsApp_Image_2025-09-20_at_11.40.02_3_dhw8th.jpg"),
  swag: cld("v1758371963/WhatsApp_Image_2025-09-20_at_11.40.00_1_kelwit.jpg"),
  keynote: cld("v1758292394/pic1_ssmzx7.jpg"),
  recap:
    "https://res.cloudinary.com/dxssytv0p/video/upload/q_auto,w_960/v1758373015/WhatsApp_Video_2024-12-07_at_07.29.59_a718ad78_qlb6oy.mp4",
  archives: [
    { label: "DevFest 2023", href: "https://drive.google.com/drive/u/0/folders/1HtgoxI8vq9mBRhIHVp31Sj78wy0SdcCH" },
    { label: "DevFest 2024", href: "https://drive.google.com/drive/u/0/folders/1E2ENoV1H2HFAlgLDxoyi0FOtZ3IlyLeB" },
    // TODO: add the DevFest 2025 photos link. Shows as "soon" until set.
    { label: "DevFest 2025", href: null },
  ] as { label: string; href: string | null }[],
};

export const partners = [
  { name: "Google", logo: cld("v1758364854/Google_logo_yavnha.png") },
  { name: "Startup Lab", logo: cld("v1758364875/Startuplab_logo_tq73dh.png") },
  { name: "Kora", logo: cld("v1758364869/Kora_logo_olzzpo.png") },
  { name: "Kefiano Global Foundation", logo: cld("v1758364868/Kefiano_global_foundaion_logo_gax88t.png") },
  { name: "nHub", logo: cld("v1758364874/nhub_logo_rgabpz.png") },
  { name: "Axia Hub", logo: cld("v1758364854/Axia_Hub_Logo_zvvjji.png") },
  { name: "The Art of Gabby", logo: cld("v1758364901/TAG_logo_cktzpg.png") },
  { name: "Colab", logo: cld("v1758364855/Colab_logo_cxbh5x.png") },
  { name: "KIMS Caffe", logo: cld("v1758364868/KIMS_Caffe_logo_iqtd9g.png") },
  { name: "Futurefeat", logo: cld("v1758364854/Futurefeat_logo_nxumgu.png") },
  { name: "Ignite", logo: cld("v1758364855/ignite_logo_agf7km.png") },
  { name: "KC Hub", logo: cld("v1758364864/kchub_logo_cwp0ku.png") },
  { name: "Tedge News Africa", logo: cld("v1758364901/tedge_news_africa_logo_mlqtf9.png") },
  { name: "Women Techmakers", logo: cld("v1758364901/women_technmakers_logo_i6mgug.png") },
  { name: "Bluehouse", logo: cld("v1758364854/Bluehouse_logo_p1gf7m.png") },
  { name: "Joey Offair", logo: cld("v1758364855/Joey_offair_logo_dfee0y.png") },
  { name: "Media Center", logo: cld("v1758364874/media_center_logo_fuuxel.png") },
  { name: "Plateau Express Services Group", logo: cld("v1758364875/plateau_exptress_services_group_logo_utsrxu.png") },
  { name: "Learn Afrika", logo: cld("v1758364869/Learn_Africa_Logo_kuiiem.png") },
  { name: "Codeplay72", logo: cld("v1758364855/codeplay72_logo_z98ukx.png") },
];

export const socials = [
  { label: "X / Twitter", href: "https://x.com/gdgjos2" },
  { label: "Instagram", href: "https://www.instagram.com/gdg_jos" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/google-developer-groups-jos-gdg/" },
  { label: "Facebook", href: "https://www.facebook.com/gdgjos" },
];

export const faqs = [
  {
    q: "What is DevFest Jos?",
    a: "DevFest is the yearly developer festival run by Google Developer Groups around the world. DevFest Jos is the Plateau edition, hosted by GDG Jos: a full day of talks, hands-on workshops and networking for anyone building with technology.",
  },
  {
    q: "When and where is it happening?",
    a: event.dateLabel && event.venue
      ? `Saturday, 17 October 2026 at ${event.venue}, ${event.address ? `${event.address}, ` : ""}${event.city}.`
      : "In Jos, Plateau State. We'll announce the date and venue soon. Join the GDG Jos community to hear first.",
  },
  {
    q: "How do I get a ticket?",
    a: "Tap Get tickets and pick one. Regular is free, VIP is ₦8,000 and My Padi gets you and a friend in with VIP perks for ₦15,000. Your ticket arrives by email with a QR code to show at the door.",
  },
  {
    q: "I'm not a developer. Can I still come?",
    a: "Yes. Designers, product people, founders, students and the curious all have a place here. There are tracks for every stage.",
  },
  {
    q: "How do I speak at DevFest Jos?",
    a: "Watch for our call for speakers. We want first-time speakers as much as seasoned ones, so pitch the talk you wish you'd seen.",
  },
  {
    q: "Can I volunteer?",
    a: "Please do. Volunteers run registration, stages, media and logistics. Join the community and look out for the volunteer call.",
  },
  {
    q: "How can my company sponsor or exhibit?",
    a: "Reach out through the GDG Jos community page. We'll share the partnership deck and find a package that fits your goals.",
  },
];
