// Type definitions for the VaultX app
// Add your custom types here as the app grows

export interface Document {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// Add more types as needed
