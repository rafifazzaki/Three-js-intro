/**
 * Single source of truth for all content.
 *
 * In the old site these strings lived twice: once in a switch statement
 * inside the click handler, and again hand-written as <p> tags in
 * index.html. Both the 3D hotspots and the CV panel now read from here.
 */

export const PROFILE = {
  name: 'Muhammad Rafif Azzaki',
  shortName: 'MRA',
  tagline: 'Backend & game developer',
  cvUrl:
    'https://drive.google.com/file/d/1XjGncimOgjYYFBz-eNkpnIX5GgZ_J9yN/view?usp=drive_link',
  // TODO: when the CV PDF was last updated, e.g. 'Nov 2026'. Shown on the
  // download button so people can tell whether it is current. Left null
  // because it cannot be read from the Drive link — nothing is rendered
  // until it is set.
  cvUpdated: null,
  linkedin: 'https://www.linkedin.com/in/rafifazzaki/',
  github: 'https://github.com/rafifazzaki',
};

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Turns a 'YYYY' or 'YYYY-MM' date into a sort key and a display label.
 * Month precision sorts correctly because the month lands in the decimal
 * places: 2024-05 -> 2024.05, which still sits below 2024-11 -> 2024.11.
 */
export function parseDate(date) {
  if (!date) return { sort: -Infinity, label: '' };
  const [year, month] = date.split('-').map(Number);
  return {
    sort: year + (month ? month / 100 : 0),
    label: month ? `${MONTHS[month - 1]} ${year}` : String(year),
  };
}

/**
 * `object` ties an entry to the 3D object with that id (see objects.js).
 * Entries without one are CV-panel only.
 *
 * `date` orders the list newest-first and is shown beside each title so
 * the age of a project is obvious. `dateLabel` overrides the rendered text
 * where a single date would be misleading.
 */
export const PROJECTS = [
  {
    object: 'orb',
    // Repo zettacamp-rafif-azzaki/rafif_zettacamp_Dolphin: created
    // 2023-08-25, last pushed 2023-10-11.
    date: '2023-08',
    title: 'Zettacamp’s Assignment API',
    shortTitle: 'Zettacamp API',
    description:
      'Making REST APIs using Express.js, MongoDB and Postman.',
    tags: ['Backend', 'JavaScript', 'MongoDB'],
    github:
      'https://github.com/zettacamp-rafif-azzaki/rafif_zettacamp_Dolphin',
    external: null,
  },
  {
    object: 'marble',
    date: '2023-11',
    title: 'Dicoding’s API & Amazon Deployment',
    shortTitle: 'Dicoding API',
    description:
      'Build a notes app API using HAPI.js and deploying it to the Amazon EC2 Instance and Amazon RDS.',
    tags: ['Backend', 'JavaScript', 'Hapi.js', 'PostgreSQL'],
    // TODO: this link is dead (404). Point it at the current repo or drop it.
    github:
      'https://github.com/rafifazzaki/Dicoding_Belajar-Membuat-Aplikasi-Back-End-untuk-Pemula/tree/main/notes-app-back-end',
    external: null,
  },
  {
    object: 'keyboard',
    // Stated in the description: Find IT UGM 2018.
    date: '2018',
    title: 'Prototype "Finitra" (Capslock team)',
    shortTitle: 'Finitra',
    description:
      'Prototype game "Finitra", proposed at Game Development Competition Find IT UGM 2018.',
    tags: ['C#', 'Unity'],
    github: null,
    external: 'https://www.youtube.com/watch?v=g1DHGZtHzd8',
  },
  {
    object: 'controller',
    // Stated in the original title: COMPFEST 12, 2020.
    date: '2020',
    title: 'COMPFEST 12 — Postman (Large Iced Tea)',
    shortTitle: 'COMPFEST 12',
    description:
      'Compfest 12 Indie Game Ignite, organised by Fasilkom UI. With the Large Iced Tea team we produced the game "Postman".',
    tags: ['C#', 'Unity'],
    github: null,
    external: 'https://www.youtube.com/watch?v=9Vi7TXo9r3M',
  },
  {
    object: 'omni',
    // Stated in the description: KRSBI 2018.
    date: '2018',
    title: 'Robot Soccer Prototype',
    shortTitle: 'Robot Soccer',
    description:
      'Member of a team building a Robot Soccer prototype made according to KRSBI 2018.',
    tags: ['Arduino'],
    github: null,
    external:
      'https://drive.google.com/file/d/1lEu4V6Dt39EpsLrn5UX8eultKxCm31j3/view?usp=drive_link',
  },
  {
    object: 'keypad',
    date: '2024',
    title: 'Personal project: keypad 4x4',
    shortTitle: 'Keypad 4x4',
    description:
      'Building a 4x4 keypad with an encoder. Personal project.',
    tags: ['Arduino'],
    github: null,
    external:
      'https://drive.google.com/file/d/1eAUP3V0yw0hRetyCTDQBkuzKrx_q5W8F/view?usp=drive_link',
  },
  {
    object: null,
    // Repo Three-js-intro ran 2023-11-27 to 2024-02-04; rebuilt 2026.
    // Sorts as the rebuild but labelled as the range, because the content
    // it presents is the older work, not the 2026 engine around it.
    date: '2026',
    dateLabel: '2023–2024, remade 2026',
    title: 'This portfolio',
    shortTitle: 'This portfolio',
    description:
      'The site you are looking at — a physics-driven 3D portfolio. Content from 2023–2024; rebuilt from scratch in 2026.',
    tags: ['Three.js', 'cannon-es', 'JavaScript'],
    github: null,
    external: null,
  },
];

/**
 * Every entry with its parsed date attached, newest first. Undated entries
 * sort to the bottom and render no date.
 */
export const PROJECTS_BY_DATE = PROJECTS.map((project) => {
  const { sort, label } = parseDate(project.date);
  return { ...project, sort, dateText: project.dateLabel ?? label };
}).sort((a, b) => b.sort - a.sort);

/** Lookup used by the raycaster and the 3D labels: object id -> entry. */
export const PROJECT_BY_OBJECT = new Map(
  PROJECTS_BY_DATE.filter((p) => p.object).map((p) => [p.object, p])
);

/** Required by the CC BY 4.0 licence on the Sketchfab models. */
export const ATTRIBUTIONS = [
  {
    title: 'Custom — Mechanical Keyboard',
    author: 'unknown.fbx',
    url: 'https://sketchfab.com/3d-models/custom-mechanical-keyboard-90d61eec0c484332ab562c5f4eda6f52',
  },
  {
    title: 'marble test!',
    author: 'clairenicole22',
    url: 'https://sketchfab.com/3d-models/marble-test-610c36deeb8445c28350e36022321635',
  },
  {
    title: 'Game Controller',
    author: 'Hasaral Saparamadu',
    url: 'https://sketchfab.com/3d-models/game-controller-f036082ff5fe4f698ce373ba809bd7b9',
  },
];

