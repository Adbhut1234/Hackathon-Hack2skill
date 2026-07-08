export const initialComplaints = [
  {
    id: 1,
    lat: 26.8504,
    lng: 80.9499,
    category: 'Water & Drainage',
    translation: 'Severe waterlogging near Hazratganj crossing after yesterday\'s rain.',
    priority: 'High',
    date: '2026-07-07T10:00:00Z',
    status: 'Pending'
  },
  {
    id: 2,
    lat: 26.8520,
    lng: 80.9470,
    category: 'Road Infrastructure',
    translation: 'Deep potholes on the main road causing daily traffic jams.',
    priority: 'Medium',
    date: '2026-07-06T14:30:00Z',
    status: 'In Progress'
  },
  {
    id: 3,
    lat: 26.8480,
    lng: 80.9520,
    category: 'Electricity',
    translation: 'Frequent power cuts in the evening affecting businesses.',
    priority: 'High',
    date: '2026-07-07T18:45:00Z',
    status: 'Pending'
  },
  {
    id: 4,
    lat: 26.8540,
    lng: 80.9450,
    category: 'Sanitation',
    translation: 'Garbage dump overflowing for the past 3 days.',
    priority: 'Medium',
    date: '2026-07-05T09:15:00Z',
    status: 'Resolved'
  },
  {
    id: 5,
    lat: 26.8495,
    lng: 80.9505,
    category: 'Public Transport',
    translation: 'Bus stop shelter roof is broken.',
    priority: 'Low',
    date: '2026-07-08T08:20:00Z',
    status: 'Pending'
  }
];

export const aiProjects = [
  {
    id: 101,
    name: 'Hazratganj Drainage Overhaul',
    category: 'Water & Drainage',
    confidenceScore: 92,
    reasoning: 'Ranked #1: 45 complaints this week regarding drainage. Correlates with historical monsoon flooding data in this sector.'
  },
  {
    id: 102,
    name: 'Smart Grid Installation Sector B',
    category: 'Electricity',
    confidenceScore: 85,
    reasoning: 'Ranked #2: Voltage fluctuations causing transformer failures. Smart grid will distribute load dynamically and reduce outages by 40%.'
  },
  {
    id: 103,
    name: 'Automated Pothole Repair Initiative',
    category: 'Road Infrastructure',
    confidenceScore: 78,
    reasoning: 'Ranked #3: Recurring road damage reports from delivery drivers. AI vision models from traffic cams confirm 12 major potholes.'
  }
];
