export interface ParsedScene {
  n: number;
  title: string;
  rawTitle: string;
  image: string | null;
  alt: string;
  draw: string;
  text: string;
}

export interface Token {
  text: string;
  isWord: boolean;
  start: number;
  end: number;
}

export interface Chunk {
  text: string;
  start: number;
}

export interface Segment {
  speaker: string;
  text: string;
}

export function cleanProse(raw: string): string;
export function stripSceneNumber(t: string): string;
export function parseScenes(body: string): ParsedScene[];
export function tokenize(text: string): Token[];
export function wordList(text: string): string[];
export function normWord(s: string): string;
export function makeChunks(text: string): Chunk[];
export function segmentScene(text: string): Segment[];
