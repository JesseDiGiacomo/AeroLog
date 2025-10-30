import type { Pilot } from '../types';
import { getPilotByCpf } from './flightService';

// This is a mock service. In a real app, this would make API calls.
// Passwords should NEVER be stored in plaintext. This is for demo purposes only.
const MOCK_PASSWORDS: Record<string, string> = {
  '111.222.333-44': 'password123',
  '222.333.444-55': 'password123',
  '333.444.555-66': 'password123',
};

export const loginWithCpf = async (cpf: string, password: string): Promise<Pilot | null> => {
  console.log(`Attempting login for CPF: ${cpf}`);
  // In a real app, you'd fetch the user by CPF and verify the hashed password.
  const pilot = await getPilotByCpf(cpf);
  
  if (pilot && MOCK_PASSWORDS[cpf] === password) {
    console.log("Login successful for:", pilot.name);
    // Store user session (e.g., in localStorage)
    localStorage.setItem('currentUser', JSON.stringify(pilot));
    return pilot;
  }
  
  console.log("Login failed: Invalid CPF or password");
  return null;
};

export const loginWithGoogle = async (): Promise<Pilot | null> => {
  // This simulates the Google Sign-In flow.
  // In a real app, you'd use the Google Auth library, get a token,
  // and send it to your backend to verify and create a session.
  console.log("Simulating Google login...");
  const pilot = await getPilotByCpf('111.222.333-44'); // Let's just log in Alex Maverick
  
  if(pilot){
      localStorage.setItem('currentUser', JSON.stringify(pilot));
      return pilot;
  }
  return null;
};

export const logout = (): void => {
  console.log("Logging out.");
  localStorage.removeItem('currentUser');
};

export const getSession = (): Pilot | null => {
  const userJson = localStorage.getItem('currentUser');
  if (userJson) {
    try {
      return JSON.parse(userJson) as Pilot;
    } catch (e) {
      console.error("Failed to parse user session from localStorage", e);
      localStorage.removeItem('currentUser');
      return null;
    }
  }
  return null;
};

export const updateSession = (pilot: Pilot): void => {
  console.log("Updating session for:", pilot.name);
  localStorage.setItem('currentUser', JSON.stringify(pilot));
};