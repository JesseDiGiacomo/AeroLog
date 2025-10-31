
import type { Flight, Pilot, TrackPoint } from '../types';

// Mock Data
const pilots: Pilot[] = [
  { id: '1', name: 'Alex Maverick', avatarUrl: 'https://picsum.photos/seed/alex/200', flights: 7, totalDistance: 856.9, cpf: '111.222.333-44', email: 'alex@aerolog.com', followers: ['2'], followingPilots: ['3'], followingTakeoffs: ['Annecy, France'] },
  { id: '2', name: 'Bella Skyrunner', avatarUrl: 'https://picsum.photos/seed/bella/200', flights: 2, totalDistance: 155.8, cpf: '222.333.444-55', email: 'bella@aerolog.com', followers: [], followingPilots: ['1'], followingTakeoffs: [] },
  { id: '3', name: 'Carlos Cloud', avatarUrl: 'https://picsum.photos/seed/carlos/200', flights: 2, totalDistance: 170.5, cpf: '333.444.555-66', email: 'carlos@aerolog.com', followers: ['1'], followingPilots: [], followingTakeoffs: ['Quixadá, Brazil'] },
];

const flights: Flight[] = [
  {
    id: '101',
    pilot: pilots[0],
    date: '2024-07-20T10:00:00Z',
    distance: 128.2, // OLC Score
    duration: 245,
    maxAltitude: 2850,
    takeoff: 'Annecy, France',
    landing: 'Chamonix, France',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [
        [45.89, 6.12], [45.92, 6.15], [45.90, 6.20], [45.93, 6.25], [45.91, 6.30], [45.92, 6.35]
    ],
    comments: [
        { id: 'c1', author: pilots[1], text: 'Epic flight, Alex!', timestamp: '2024-07-20T18:00:00Z'},
        { id: 'c2', author: pilots[2], text: 'Incredible distance!', timestamp: '2024-07-21T09:00:00Z'},
    ],
    likes: 12,
    likedBy: ['2', '3'],
    takeoffTime: '2024-07-20T10:05:00Z',
    landingTime: '2024-07-20T14:10:00Z',
    maxClimbRate: 4.5,
    maxSinkRate: -2.1,
    minAltitude: 850,
    takeoffAltitude: 1200,
    altitudeGain: 1650,
    maxSpeed: 75,
    avgSpeed: 30.7,
    straightDistance: 125.5,
    freeDistance: 125.5,
    olcDistance: 128.2,
    olcScore: 128.2,
  },
  {
    id: '102',
    pilot: pilots[1],
    date: '2024-07-19T11:30:00Z',
    distance: 82.1, // OLC Score
    duration: 180,
    maxAltitude: 2400,
    takeoff: 'Interlaken, Switzerland',
    landing: 'Grindelwald, Switzerland',
    glider: 'Gin Boomerang 12',
    gliderType: 'paraglider',
    track: [
        [46.68, 7.86], [46.65, 7.90], [46.63, 7.95], [46.60, 8.03]
    ],
    comments: [
        { id: 'c3', author: pilots[0], text: 'Nice one, Bella!', timestamp: '2024-07-19T20:00:00Z'},
    ],
    likes: 8,
    likedBy: ['1'],
    takeoffTime: '2024-07-19T11:32:00Z',
    landingTime: '2024-07-19T14:32:00Z',
    maxClimbRate: 3.8,
    maxSinkRate: -1.8,
    minAltitude: 950,
    takeoffAltitude: 1350,
    altitudeGain: 1050,
    maxSpeed: 68,
    avgSpeed: 26.8,
    straightDistance: 80.3,
    freeDistance: 80.3,
    olcDistance: 82.1,
    olcScore: 82.1,
  },
  {
    id: '103',
    pilot: pilots[0],
    date: '2024-07-18T09:00:00Z',
    distance: 155.9, // OLC Score
    duration: 310,
    maxAltitude: 3200,
    takeoff: 'Quixadá, Brazil',
    landing: 'Sobral, Brazil',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [
      [-4.97, -39.01], [-4.90, -39.20], [-4.85, -39.50], [-4.70, -39.80], [-4.50, -40.00], [-4.35, -40.34]
    ],
    comments: [],
    likes: 25,
    likedBy: ['2', '3'],
    takeoffTime: '2024-07-18T09:10:00Z',
    landingTime: '2024-07-18T14:20:00Z',
    maxClimbRate: 5.2,
    maxSinkRate: -1.5,
    minAltitude: 400,
    takeoffAltitude: 550,
    altitudeGain: 2650,
    maxSpeed: 82,
    avgSpeed: 29.2,
    straightDistance: 150.7,
    freeDistance: 150.7,
    olcDistance: 155.9,
    olcScore: 155.9,
  },
  {
    id: '104',
    pilot: pilots[2],
    date: '2024-07-17T13:00:00Z',
    distance: 76.5, // OLC Score
    duration: 155,
    maxAltitude: 1900,
    takeoff: 'Valle de Bravo, Mexico',
    landing: 'Temascaltepec, Mexico',
    glider: 'Niviuk Icepeak X-One',
    gliderType: 'paraglider',
    track: [
      [19.19, -100.13], [19.15, -100.10], [19.10, -100.05], [19.05, -100.00]
    ],
    comments: [
        { id: 'c4', author: pilots[1], text: 'Looks like a fun flight!', timestamp: '2024-07-18T10:00:00Z'},
    ],
    likes: 5,
    likedBy: ['1'],
    takeoffTime: '2024-07-17T13:05:00Z',
    landingTime: '2024-07-17T15:40:00Z',
    maxClimbRate: 3.1,
    maxSinkRate: -2.5,
    minAltitude: 1100,
    takeoffAltitude: 1600,
    altitudeGain: 300,
    maxSpeed: 65,
    avgSpeed: 29.1,
    straightDistance: 75.2,
    freeDistance: 75.2,
    olcDistance: 76.5,
    olcScore: 76.5,
  },
    {
    id: '105',
    pilot: pilots[1],
    date: '2024-07-16T12:00:00Z',
    distance: 75.5, // OLC Score
    duration: 170,
    maxAltitude: 2100,
    takeoff: 'Iquique, Chile',
    landing: 'Pisagua, Chile',
    glider: 'Gin Boomerang 12',
    gliderType: 'paraglider',
    track: [
      [-20.21, -70.15], [-20.15, -70.15], [-20.05, -70.15], [-19.95, -70.15], [-19.85, -70.15], [-19.59, -70.15]
    ],
    comments: [],
    likes: 3,
    likedBy: [],
    takeoffTime: '2024-07-16T12:02:00Z',
    landingTime: '2024-07-16T14:52:00Z',
    maxClimbRate: 2.9,
    maxSinkRate: -1.2,
    minAltitude: 50,
    takeoffAltitude: 600,
    altitudeGain: 1500,
    maxSpeed: 55,
    avgSpeed: 26.6,
    straightDistance: 75.5,
    freeDistance: 75.5,
    olcDistance: 75.5,
    olcScore: 75.5,
  },
  {
    id: '106',
    pilot: pilots[0],
    date: '2024-07-15T09:45:00Z',
    distance: 45.2, // OLC Score
    duration: 120,
    maxAltitude: 1500,
    takeoff: 'San Vito Lo Capo, Italy',
    landing: 'Castellammare del Golfo, Italy',
    glider: 'Ozone Zeno 2',
    gliderType: 'paraglider',
    track: [
      [38.17, 12.73], [38.15, 12.78], [38.10, 12.85], [38.05, 12.88], [38.02, 12.90]
    ],
    comments: [],
    likes: 2,
    likedBy: ['3'],
    takeoffTime: '2024-07-15T09:50:00Z',
    landingTime: '2024-07-15T11:50:00Z',
    maxClimbRate: 2.5,
    maxSinkRate: -2.0,
    minAltitude: 250,
    takeoffAltitude: 800,
    altitudeGain: 700,
    maxSpeed: 60,
    avgSpeed: 22.6,
    straightDistance: 45.2,
    freeDistance: 45.2,
    olcDistance: 45.2,
    olcScore: 45.2,
  },
  {
    id: '107',
    pilot: pilots[2],
    date: '2024-07-21T10:30:00Z',
    distance: 95.3, // OLC Score
    duration: 280,
    maxAltitude: 3100,
    takeoff: 'St. Hilaire, France',
    landing: 'St. Hilaire, France',
    glider: 'Niviuk Icepeak X-One',
    gliderType: 'paraglider',
    track: [
      [45.28, 5.88], [45.35, 5.95], [45.45, 5.90], [45.40, 5.80], [45.30, 5.82], [45.28, 5.88]
    ],
    comments: [
        { id: 'c5', author: pilots[0], text: 'That is a perfect FAI triangle!', timestamp: '2024-07-21T19:00:00Z'},
    ],
    likes: 18,
    likedBy: ['1'],
    takeoffTime: '2024-07-21T10:35:00Z',
    landingTime: '2024-07-21T15:15:00Z',
    maxClimbRate: 4.8,
    maxSinkRate: -2.2,
    minAltitude: 1050,
    takeoffAltitude: 1250,
    altitudeGain: 1850,
    maxSpeed: 72,
    avgSpeed: 22.0,
    straightDistance: 35.6, // Placeholder, not a straight flight
    freeDistance: 95.3,
    olcDistance: 102.8,
    olcScore: 95.3, // Score is less than distance for closed circuits
    faiTriangle: {
        score: 95.3,
        turnpoints: [[45.28, 5.88], [45.45, 5.90], [45.40, 5.80]]
    },
  },
  // --- New flights for ranking tests ---
  {
    id: '108',
    pilot: pilots[0],
    date: new Date().toISOString(), // Today's flight
    distance: 110.5,
    duration: 200,
    maxAltitude: 2900,
    takeoff: 'Fiesch, Switzerland',
    landing: 'Brig, Switzerland',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [[46.40, 8.13], [46.35, 8.05], [46.30, 7.98]],
    comments: [],
    likes: 0,
    likedBy: [],
    takeoffTime: new Date(new Date().setHours(11, 0, 0)).toISOString(),
    landingTime: new Date(new Date().setHours(14, 20, 0)).toISOString(),
    maxClimbRate: 4.1, maxSinkRate: -1.9, minAltitude: 900, takeoffAltitude: 1400, altitudeGain: 1500, maxSpeed: 78, avgSpeed: 33.1, straightDistance: 110.5, freeDistance: 110.5, olcDistance: 110.5, olcScore: 110.5,
  },
  {
    id: '109',
    pilot: pilots[0],
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
    distance: 95.0,
    duration: 180,
    maxAltitude: 2600,
    takeoff: 'Fiesch, Switzerland',
    landing: 'Visp, Switzerland',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [[46.40, 8.13], [46.38, 8.08], [46.30, 7.98]],
    comments: [],
    likes: 1,
    likedBy: ['2'],
    takeoffTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    landingTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    maxClimbRate: 3.9, maxSinkRate: -2.0, minAltitude: 950, takeoffAltitude: 1400, altitudeGain: 1200, maxSpeed: 70, avgSpeed: 31.6, straightDistance: 95.0, freeDistance: 95.0, olcDistance: 95.0, olcScore: 95.0,
  },
  {
    id: '110',
    pilot: pilots[0],
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(), // Two days ago
    distance: 130.0,
    duration: 250,
    maxAltitude: 3100,
    takeoff: 'Annecy, France',
    landing: 'Grenoble, France',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [[45.89, 6.12], [45.70, 6.00], [45.50, 5.90], [45.30, 5.80]],
    comments: [],
    likes: 7,
    likedBy: ['2', '3'],
    takeoffTime: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    landingTime: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    maxClimbRate: 4.9, maxSinkRate: -2.3, minAltitude: 1000, takeoffAltitude: 1200, altitudeGain: 1900, maxSpeed: 80, avgSpeed: 31.2, straightDistance: 130.0, freeDistance: 130.0, olcDistance: 130.0, olcScore: 130.0,
  },
  {
    id: '111',
    pilot: pilots[0],
    date: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(), // Last year
    distance: 200.0, // High score to ensure it's filtered out of annual
    duration: 400,
    maxAltitude: 3500,
    takeoff: 'Roldanillo, Colombia',
    landing: 'La Union, Colombia',
    glider: 'Ozone Enzo 3',
    gliderType: 'paraglider',
    track: [[4.41, -76.15], [4.50, -76.10], [4.80, -76.05]],
    comments: [],
    likes: 30,
    likedBy: ['2', '3'],
    takeoffTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    landingTime: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    maxClimbRate: 6.0, maxSinkRate: -1.4, minAltitude: 1200, takeoffAltitude: 1800, altitudeGain: 1700, maxSpeed: 85, avgSpeed: 30.0, straightDistance: 200.0, freeDistance: 200.0, olcDistance: 200.0, olcScore: 200.0,
  },
  {
    id: '112',
    pilot: pilots[2],
    date: '2024-07-22T11:00:00Z',
    distance: 145.0,
    duration: 290,
    maxAltitude: 2700,
    takeoff: 'Forbes, Australia',
    landing: 'Parkes, Australia',
    glider: 'Wills Wing T3',
    gliderType: 'hangglider', // Hangglider type
    track: [[-33.38, 148.01], [-33.20, 148.10], [-33.10, 148.20]],
    comments: [],
    likes: 9,
    likedBy: ['1'],
    takeoffTime: '2024-07-22T11:05:00Z',
    landingTime: '2024-07-22T15:55:00Z',
    maxClimbRate: 4.0, maxSinkRate: -1.8, minAltitude: 800, takeoffAltitude: 1100, altitudeGain: 1600, maxSpeed: 95, avgSpeed: 30.0, straightDistance: 145.0, freeDistance: 145.0, olcDistance: 145.0, olcScore: 145.0,
  }
];

// Simulate API calls
const simulateDelay = <T,>(data: T): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), 500));
}

export const getFlights = async (): Promise<Flight[]> => {
  const sortedFlights = [...flights].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return simulateDelay(sortedFlights);
};

export const getFlightById = async (id: string): Promise<Flight | undefined> => {
  const flight = flights.find(f => f.id === id);
  return simulateDelay(flight);
};

export const getPilotById = async (id: string): Promise<Pilot | undefined> => {
  const pilot = pilots.find(p => p.id === id);
  return simulateDelay(pilot);
};

export const getPilotByCpf = async (cpf: string): Promise<Pilot | undefined> => {
  const pilot = pilots.find(p => p.cpf === cpf);
  return simulateDelay(pilot);
};

export const getFlightsByPilot = async (pilotId: string): Promise<Flight[]> => {
    const pilotFlights = flights
      .filter(f => f.pilot.id === pilotId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return simulateDelay(pilotFlights);
}

export const updatePilotDetails = async (pilotId: string, details: Partial<Pick<Pilot, 'name' | 'avatarUrl'>>): Promise<Pilot | undefined> => {
  const pilot = pilots.find(p => p.id === pilotId);
  if (pilot) {
    // Mutate the original pilot object so all references in the flights array are updated
    Object.assign(pilot, details);
    return simulateDelay({ ...pilot }); // Return a copy
  }
  return simulateDelay(undefined);
};

export const toggleFlightLike = async (flightId: string, pilotId: string): Promise<Flight | undefined> => {
  const flight = flights.find(f => f.id === flightId);
  if (flight) {
    const likeIndex = flight.likedBy.indexOf(pilotId);
    if (likeIndex > -1) {
      // Unlike
      flight.likedBy.splice(likeIndex, 1);
      flight.likes--;
    } else {
      // Like
      flight.likedBy.push(pilotId);
      flight.likes++;
    }
    return simulateDelay({ ...flight }); // Return a copy
  }
  return simulateDelay(undefined);
};

export const toggleFollowPilot = async (currentUserId: string, targetPilotId: string): Promise<{ currentUser: Pilot, targetPilot: Pilot } | undefined> => {
  const currentUser = pilots.find(p => p.id === currentUserId);
  const targetPilot = pilots.find(p => p.id === targetPilotId);

  if (currentUser && targetPilot) {
    const isFollowing = currentUser.followingPilots.includes(targetPilotId);
    if (isFollowing) {
      // Unfollow
      currentUser.followingPilots = currentUser.followingPilots.filter(id => id !== targetPilotId);
      targetPilot.followers = targetPilot.followers.filter(id => id !== currentUserId);
    } else {
      // Follow
      currentUser.followingPilots.push(targetPilotId);
      targetPilot.followers.push(currentUserId);
    }
    return simulateDelay({ currentUser: { ...currentUser }, targetPilot: { ...targetPilot } });
  }
  return simulateDelay(undefined);
};

export const toggleFollowTakeoff = async (currentUserId: string, takeoffName: string): Promise<Pilot | undefined> => {
  const currentUser = pilots.find(p => p.id === currentUserId);
  if (currentUser) {
    const isFollowing = currentUser.followingTakeoffs.includes(takeoffName);
    if (isFollowing) {
      // Unfollow
      currentUser.followingTakeoffs = currentUser.followingTakeoffs.filter(name => name !== takeoffName);
    } else {
      // Follow
      currentUser.followingTakeoffs.push(takeoffName);
    }
    return simulateDelay({ ...currentUser });
  }
  return simulateDelay(undefined);
};