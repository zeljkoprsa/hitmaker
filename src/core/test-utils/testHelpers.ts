/**
 * Test helper functions and utilities
 */
import { OutputSourceConfig } from '../interfaces/IOutputSource';
import {
  MetronomeConfig,
  TimeSignature,
  SubdivisionType,
  AccentLevel,
} from '../types/MetronomeTypes';

/**
 * Creates a default MetronomeConfig for testing
 */
export function createDefaultConfig(): MetronomeConfig {
  return {
    tempo: 120,
    timeSignature: { beats: 4, noteValue: 4 },
    subdivision: 'quarter',
    accents: [AccentLevel.Accent, AccentLevel.Normal, AccentLevel.Normal, AccentLevel.Normal],
    volume: 1.0,
    muted: false,
  };
}

/**
 * Creates a custom MetronomeConfig for testing
 */
export function createCustomConfig(overrides: Partial<MetronomeConfig>): MetronomeConfig {
  return {
    ...createDefaultConfig(),
    ...overrides,
  };
}

/**
 * Creates a default OutputSourceConfig for testing
 */
export function createOutputConfig(
  id: string,
  type: 'audio' | 'visual' | 'midi' | 'custom' = 'audio'
): OutputSourceConfig {
  return {
    id,
    type,
    enabled: true,
    options: {},
  };
}

/**
 * Waits for a specified number of milliseconds
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Creates a mock time signature
 */
export function createTimeSignature(beats: number = 4, noteValue: number = 4): TimeSignature {
  return { beats, noteValue };
}

/**
 * Type guard to verify MetronomeConfig properties
 */
export function isValidMetronomeConfig(config: unknown): config is MetronomeConfig {
  if (typeof config !== 'object' || config === null) return false;

  const c = config as MetronomeConfig;
  return (
    typeof c.tempo === 'number' &&
    typeof c.timeSignature === 'object' &&
    typeof c.timeSignature.beats === 'number' &&
    typeof c.timeSignature.noteValue === 'number'
  );
}

/**
 * Validates subdivision type
 */
export function isValidSubdivision(subdivision: unknown): subdivision is SubdivisionType {
  return (
    typeof subdivision === 'string' &&
    ['quarter', 'eighth', 'triplet', 'sixteenth'].includes(subdivision)
  );
}

/**
 * Creates a test error with stack trace
 */
export function createTestError(message: string): Error {
  return new Error(`Test Error: ${message}`);
}
