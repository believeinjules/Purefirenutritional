// Backend logging utility for quality assurance
// Logs AI interactions, recommendations, and errors (NO chat history storage)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOG_DIR = path.join(__dirname, '..', 'logs');
const AI_LOG_FILE = path.join(LOG_DIR, 'ai-interactions.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'errors.log');
const RECOMMENDATIONS_LOG_FILE = path.join(LOG_DIR, 'recommendations.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

interface LogEntry {
  timestamp: string;
  type: string;
  data: any;
}

function formatLogEntry(entry: LogEntry): string {
  return `[${entry.timestamp}] [${entry.type}] ${JSON.stringify(entry.data)}\n`;
}

function writeLog(file: string, entry: LogEntry) {
  try {
    const logLine = formatLogEntry(entry);
    fs.appendFileSync(file, logLine, 'utf8');
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

export function logAIInteraction(data: {
  query: string;
  recommendedProductIds: string[];
  recommendationCount: number;
  responseTime: number;
}) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'AI_INTERACTION',
    data: {
      query: data.query,
      recommendedProductIds: data.recommendedProductIds,
      recommendationCount: data.recommendationCount,
      responseTime: data.responseTime,
      // NO user message content or chat history stored
    }
  };
  writeLog(AI_LOG_FILE, entry);
}

export function logRecommendation(data: {
  productId: string;
  productName: string;
  context: string;
  source: 'ai' | 'frequently_bought' | 'related';
}) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'RECOMMENDATION',
    data
  };
  writeLog(RECOMMENDATIONS_LOG_FILE, entry);
}

export function logError(data: {
  error: string;
  stack?: string;
  context?: string;
  endpoint?: string;
}) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'ERROR',
    data
  };
  writeLog(ERROR_LOG_FILE, entry);
  console.error('[ERROR]', data);
}

export function logAPICall(data: {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  error?: string;
}) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    type: 'API_CALL',
    data
  };
  writeLog(AI_LOG_FILE, entry);
}

// Log rotation: Keep logs for 30 days
export function rotateLogs() {
  const files = [AI_LOG_FILE, ERROR_LOG_FILE, RECOMMENDATIONS_LOG_FILE];
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

  files.forEach(file => {
    try {
      if (fs.existsSync(file)) {
        const stats = fs.statSync(file);
        const age = Date.now() - stats.mtimeMs;
        
        if (age > maxAge) {
          const archiveName = `${file}.${new Date().toISOString().split('T')[0]}.archive`;
          fs.renameSync(file, archiveName);
          console.log(`Rotated log file: ${file} -> ${archiveName}`);
        }
      }
    } catch (error) {
      console.error(`Failed to rotate log ${file}:`, error);
    }
  });
}

// Run log rotation daily
setInterval(rotateLogs, 24 * 60 * 60 * 1000);
