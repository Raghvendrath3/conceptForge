export interface User {
  _id: string;
  email: string;
  name: string;
  settings: {
    theme: string;
    domainPreset: string;
  };
}

export interface Node {
  _id: string;
  title: string;
  bodyMarkdown: string;
  type: 'concept' | 'note' | 'snippet' | 'project';
  tags: string[];
  ownerId: string;
  version: number;
  updatedAt: string;
  createdAt: string;
}

export interface Edge {
  _id: string;
  from: string;
  to: string;
  label: 'prerequisite' | 'related' | 'part-of';
  ownerId: string;
}

export interface Flashcard {
  _id: string;
  nodeId: string;
  question: string;
  answer: string;
  ease: number;
  interval: number;
  dueAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
