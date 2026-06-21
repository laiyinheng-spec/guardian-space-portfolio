export const page2Topbar = {
  left: 'Guardian Space / Portfolio Case Study',
  right: 'Page 02 Style Template',
};

export const page2Intro = {
  label: 'Page 02',
  title: 'Background & Secondary Research',
  mainSentence: 'Stray animals are becoming a growing urban issue, not only an animal welfare concern.',
  supportSentence:
    'Their increasing scale reveals problems in public health, community safety, urban ecology, and public participation.',
  illustrationAlt: 'Minimal line illustration of rescued animals',
  illustrationPath: '/assets/animal-line-illustration.png',
};

export const sectionLabels = {
  evidence: 'Social Context Data Evidence',
  scale: 'Scale Comparison',
  secondary: 'Secondary Research',
  channels: 'Channel Research and Pain Points',
};

export const growthTrend = {
  title: 'Global Stray Animal Growth Trend',
  source: 'Editable secondary research placeholder',
  yLabel: 'Estimated pressure',
  points: [
    { year: '2018', value: 24 },
    { year: '2019', value: 29 },
    { year: '2020', value: 37 },
    { year: '2021', value: 45 },
    { year: '2022', value: 58 },
    { year: '2023', value: 67 },
    { year: '2024', value: 72 },
    { year: '2025', value: 84 },
  ],
};

export const sourceComposition = {
  title: 'Sources Behind Stray Animals',
  source: 'Composition categories for later data replacement',
  bars: [
    { label: 'Abandonment', value: 36 },
    { label: 'Uncontrolled breeding', value: 31 },
    { label: 'Lost pets', value: 18 },
    { label: 'Limited shelter capacity', value: 12 },
    { label: 'Fragmented rescue information', value: 9 },
  ],
};

export const chinaScaleSummary = {
  title: 'China Stray Animal Scale',
  value: 'XX million',
  caption: 'estimated stray animals',
  source: 'Source: to be confirmed',
  mapSrc: '/maps/china-map.png',
};

export const chinaMapPoints = [
  { name: 'Beijing', value: 7, coord: [116.4, 39.9], position: { x: 67, y: 34 } },
  { name: 'Shanghai', value: 8, coord: [121.47, 31.23], position: { x: 76, y: 55 } },
  { name: 'Guangdong', value: 12, coord: [113.27, 23.13], position: { x: 62, y: 75 } },
  { name: 'Fujian', value: 6, coord: [119.3, 26.08], position: { x: 72, y: 69 } },
  { name: 'Sichuan', value: 9, coord: [104.06, 30.67], position: { x: 45, y: 57 } },
  { name: 'Henan', value: 8, coord: [113.62, 34.75], position: { x: 61, y: 48 } },
];

export const globalScaleSummary = {
  title: 'Global Stray Animal Scale',
  value: 'XXX million',
  caption: 'estimated stray animals worldwide',
  source: 'Source: to be confirmed',
  mapSrc: '/maps/world-map.svg',
};

export const worldMapPoints = [
  { name: 'China', value: 90, coord: [104, 35], position: { x: 72, y: 45 } },
  { name: 'United States', value: 70, coord: [-100, 39], position: { x: 22, y: 42 } },
  { name: 'Brazil', value: 35, coord: [-52, -14], position: { x: 35, y: 67 } },
  { name: 'India', value: 60, coord: [78, 22], position: { x: 64, y: 53 } },
  { name: 'Russia', value: 25, coord: [96, 60], position: { x: 68, y: 29 } },
  { name: 'Australia', value: 12, coord: [134, -25], position: { x: 80, y: 72 } },
];

export const scaleMaps = [
  {
    id: 'china',
    title: chinaScaleSummary.title,
    stat: chinaScaleSummary.value,
    statLabel: chinaScaleSummary.caption,
    source: chinaScaleSummary.source,
    tooltipLabel: 'Editable regional signal',
    points: chinaMapPoints,
  },
  {
    id: 'global',
    title: globalScaleSummary.title,
    stat: globalScaleSummary.value,
    statLabel: globalScaleSummary.caption,
    source: globalScaleSummary.source,
    tooltipLabel: 'Editable country signal',
    points: worldMapPoints,
  },
];

export const impactCards = [
  {
    icon: 'health',
    title: 'Public Health',
    description: 'Disease transmission, bite incidents, and sanitation pressure can become visible urban concerns.',
    meta: 'Health risk / sanitation pressure',
  },
  {
    icon: 'traffic',
    title: 'Traffic & Community Safety',
    description: 'Animals moving through roads and communities can increase traffic and neighborhood safety risks.',
    meta: 'Road risk / community reports',
  },
  {
    icon: 'ecology',
    title: 'Urban Ecology',
    description: 'Unmanaged breeding and animal gathering can affect ecological balance and local governance.',
    meta: 'Ecology / urban management',
  },
];

export const secondaryResearch = {
  impactTitle: 'Impact of Unmanaged Stray Animals',
};

export const responseSystems = {
  title: 'Existing Response Systems',
  routes: [
    {
      title: 'Non-adoption Route',
      steps: ['Capture', 'Control', 'Vaccination', 'Shelter Management'],
      note: 'Management-oriented, but difficult for ordinary users to participate in continuously.',
    },
    {
      title: 'Adoption Route',
      steps: ['Rescue', 'Treatment', 'Review', 'Adoption', 'Follow-up'],
      note: 'Care-oriented, but the process can feel complex and high commitment.',
    },
  ],
};

export const channelResearch = {
  title: 'Channel Landscape & Pain Points',
  subtitle:
    'Current rescue and adoption channels are scattered across platforms, organizations, and individual rescuers.',
  groups: [
    {
      title: 'Domestic Channels',
      items: [
        'Shelters & rescue stations',
        'WeChat / social media',
        'Individual rescuers',
        'Pet hospitals',
        'Campus groups',
      ],
      note: 'High information noise and inconsistent verification.',
    },
    {
      title: 'International Channels',
      items: ['Petfinder-like platforms', 'NGO / shelter networks', 'AI matching tools', 'Gamified donation', 'Foster networks'],
      note: 'More structured, but emotional continuity is still limited.',
    },
  ],
};

export const painPoints = {
  title: 'Pain Points',
  items: [
    {
      title: 'Information Fragmentation',
      description: 'Rescue information is scattered across different platforms.',
    },
    {
      title: 'Funding Opacity',
      description: 'Users cannot easily track how support is used.',
    },
    {
      title: 'High Participation Barrier',
      description: 'Real adoption requires time, space, review, and long-term responsibility.',
    },
    {
      title: 'Weak Emotional Connection',
      description: 'Remote supporters rarely receive continuous feedback from real animals.',
    },
  ],
};

export const designOpportunity = {
  title: 'Design Opportunity',
  statement: 'A low-barrier, transparent, and emotionally responsive guardian system is needed.',
};
