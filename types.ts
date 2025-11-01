export type TrackPoint = [number, number]; // [latitude, longitude]

export interface FAIAnalysis {
  score: number; // in km
  turnpoints: TrackPoint[];
}

export interface Pilot {
  id: string;
  name: string;
  avatarUrl: string;
  flights: number;
  totalDistance: number;
  cpf: string;
  email: string;

  // Social features
  followers: string[]; // Array of pilot IDs who follow this pilot
  followingPilots: string[]; // Array of pilot IDs this pilot follows
  followingTakeoffs: string[]; // Array of takeoff location names this pilot follows
}

export interface Flight {
  id:string;
  pilot: Pilot;
  date: string;
  distance: number; // Main distance for ranking, e.g., OLC score
  duration: number; // in minutes
  maxAltitude: number; // in meters
  takeoff: string;
  landing: string;
  glider: string;
  gliderType: 'paraglider' | 'hangglider';
  track: TrackPoint[];
  comments: Comment[];
  likes: number;
  likedBy: string[]; // Array of pilot IDs

  // New detailed stats
  takeoffTime: string; // ISO String
  landingTime: string; // ISO String
  maxClimbRate: number; // m/s
  maxSinkRate: number; // m/s
  minAltitude: number; // in meters
  takeoffAltitude: number; // in meters
  altitudeGain: number; // in meters
  maxSpeed: number; // km/h
  avgSpeed: number; // km/h
  
  // New scoring details
  straightDistance: number; // km, FAI Straight Line
  freeDistance: number; // km, FAI Free Distance with turnpoints
  olcDistance: number; // km
  olcScore: number;
  faiTriangle?: FAIAnalysis; // FAI Closed Triangle
}

export interface Comment {
  id: string;
  author: Pilot;
  text: string;
  timestamp: string;
}

export interface DetailedTrackPoint {
  timestamp: number;
  timeLabel: string;
  lat: number;
  lon: number;
  altitude: number;
  agl: number; // Altitude Above Ground Level
  speed: number;
  climbRate: number;
  terrainAltitude: number;
}