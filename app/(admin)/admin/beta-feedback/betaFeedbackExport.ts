import JSZip from 'jszip';
import type { BetaFeedbackSessionDetail, BetaFeedbackSessionInfo } from '../../lib/apiService';
import {
  classificationsMatch,
  formatClassificationLabel,
} from '../../../(main)/lib/betaFeedbackConfig';

export type ExportFilterContext = {
  serviceName: string;
  scope: 'selected' | 'filtered' | 'service';
  statusFilter: string;
  outcomeFilter: string;
  selectedUserCount?: number;
  selectedUserEmail?: string;
};

export type TrainingInputFile = {
  index: number;
  role: string;
  zipPath: string;
};

export type TrainingSessionRecord = {
  sessionId: string;
  reqId: string;
  serviceName: string;
  betaServiceTag: string;
  status: string;
  runOutcome: string;
  inputs: TrainingInputFile[];
  predictedClassification: string;
  predictedScore: number | null;
  expectedClassification: string;
  expectedScoreMin: number | null;
  expectedScoreMax: number | null;
  classificationMatch: boolean | null;
  responseAsExpected: boolean | null;
  notes: string;
  createdAt: string;
  feedbackSubmittedAt: string;
};

const INPUT_ROLE_LABELS: Record<string, string[]> = {
  'signature-verification': ['reference_signature', 'query_signature'],
  'face-verify': ['reference_face', 'query_face'],
};

function sanitizePathSegment(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/^_+|_+$/g, '');
  return cleaned || 'session';
}

function getInputRole(serviceName: string, index: number): string {
  const roles = INPUT_ROLE_LABELS[serviceName];
  if (roles?.[index]) return roles[index];
  return `input_${index}`;
}

function mimeToExtension(mime: string): string {
  switch (mime.toLowerCase()) {
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'image/bmp':
      return 'bmp';
    default:
      return 'jpg';
  }
}

export function parseBase64Image(input: string): { bytes: Uint8Array; extension: string } {
  let payload = input.trim();
  let mime = 'image/jpeg';

  if (payload.startsWith('data:')) {
    const match = payload.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mime = match[1];
      payload = match[2];
    }
  }

  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }

  return { bytes, extension: mimeToExtension(mime) };
}

function formatScore(value?: number | null): string {
  if (typeof value !== 'number' || Number.isNaN(value)) return '';
  return value.toFixed(1);
}

function formatExpectedRange(min?: number | null, max?: number | null): string {
  const minStr = formatScore(min);
  const maxStr = formatScore(max);
  if (minStr && maxStr) {
    return minStr === maxStr ? `${minStr}%` : `${minStr}–${maxStr}%`;
  }
  if (minStr) return `${minStr}%`;
  if (maxStr) return `${maxStr}%`;
  return '';
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function classificationMatchValue(session: BetaFeedbackSessionInfo): boolean | null {
  const actual = session.actualResult?.classification;
  const expected = session.expectedResult?.expectedClassification;
  if (!actual || !expected) return null;
  return classificationsMatch(actual, expected);
}

export function buildInputFileName(
  reqId: string,
  index: number,
  role: string,
  extension: string
): string {
  return `inputs/${sanitizePathSegment(reqId)}__input${index}__${sanitizePathSegment(role)}.${extension}`;
}

export function buildFilterLabel(context: ExportFilterContext): string {
  const userPart =
    context.selectedUserCount && context.selectedUserCount > 0
      ? context.selectedUserCount === 1 && context.selectedUserEmail
        ? `user-${sanitizePathSegment(context.selectedUserEmail)}`
        : `users-${context.selectedUserCount}-selected`
      : '';

  let base = '';
  if (context.scope === 'selected') base = 'selected';
  else if (context.scope === 'service') base = 'all-sessions';
  else {
    const statusPart =
      context.statusFilter === 'all' ? 'status-all' : `status-${context.statusFilter}`;
    const outcomePart =
      context.outcomeFilter === 'all' ? 'outcome-all' : `outcome-${context.outcomeFilter}`;
    base = `${statusPart}_${outcomePart}`;
  }

  return [base, userPart].filter(Boolean).join('_');
}

export function exportZipFilename(context: ExportFilterContext): string {
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const service = sanitizePathSegment(context.serviceName);
  const filter = buildFilterLabel(context);
  return `${service}__${filter}__${stamp}.zip`;
}

export function sessionToTrainingRecord(
  session: BetaFeedbackSessionDetail,
  inputFiles: TrainingInputFile[]
): TrainingSessionRecord {
  return {
    sessionId: session.id || '',
    reqId: session.reqId || '',
    serviceName: session.serviceName || '',
    betaServiceTag: session.betaServiceTag || '',
    status: session.status || '',
    runOutcome: session.runOutcome || '',
    inputs: inputFiles,
    predictedClassification: formatClassificationLabel(session.actualResult?.classification),
    predictedScore:
      typeof session.actualResult?.similarity_percentage === 'number'
        ? session.actualResult.similarity_percentage
        : null,
    expectedClassification: formatClassificationLabel(
      session.expectedResult?.expectedClassification
    ),
    expectedScoreMin:
      typeof session.expectedResult?.expectedSimilarityMin === 'number'
        ? session.expectedResult.expectedSimilarityMin
        : null,
    expectedScoreMax:
      typeof session.expectedResult?.expectedSimilarityMax === 'number'
        ? session.expectedResult.expectedSimilarityMax
        : null,
    classificationMatch: classificationMatchValue(session),
    responseAsExpected:
      typeof session.expectedResult?.responseAsExpected === 'boolean'
        ? session.expectedResult.responseAsExpected
        : null,
    notes: session.expectedResult?.notes || '',
    createdAt: formatDate(session.createdAt),
    feedbackSubmittedAt: formatDate(session.feedbackSubmittedAt),
  };
}

function buildManifestCsv(records: TrainingSessionRecord[]): string {
  const headers = [
    'session_id',
    'req_id',
    'service_name',
    'beta_service_tag',
    'status',
    'run_outcome',
    'input_files',
    'input_roles',
    'predicted_classification',
    'predicted_score',
    'expected_classification',
    'expected_score_min',
    'expected_score_max',
    'expected_score_range',
    'classification_match',
    'response_as_expected',
    'notes',
    'created_at',
    'feedback_submitted_at',
  ];

  const escape = (value: string | number | boolean | null | undefined) => {
    const text = value == null ? '' : String(value);
    if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
    return text;
  };

  const lines = records.map((record) => {
    const inputFiles = record.inputs.map((input) => input.zipPath).join(';');
    const inputRoles = record.inputs.map((input) => `${input.index}:${input.role}`).join(';');
    return [
      record.sessionId,
      record.reqId,
      record.serviceName,
      record.betaServiceTag,
      record.status,
      record.runOutcome,
      inputFiles,
      inputRoles,
      record.predictedClassification,
      formatScore(record.predictedScore),
      record.expectedClassification,
      formatScore(record.expectedScoreMin),
      formatScore(record.expectedScoreMax),
      formatExpectedRange(record.expectedScoreMin, record.expectedScoreMax),
      record.classificationMatch == null ? '' : record.classificationMatch ? 'match' : 'corrected',
      record.responseAsExpected == null ? '' : record.responseAsExpected ? 'yes' : 'no',
      record.notes,
      record.createdAt,
      record.feedbackSubmittedAt,
    ]
      .map(escape)
      .join(',');
  });

  return [headers.join(','), ...lines].join('\n');
}

function buildReadme(context: ExportFilterContext, recordCount: number): string {
  const userLine =
    context.selectedUserCount && context.selectedUserCount > 0
      ? context.selectedUserCount === 1 && context.selectedUserEmail
        ? `Users: ${context.selectedUserEmail}`
        : `Users: ${context.selectedUserCount} selected`
      : 'Users: all';

  return [
    'Automica beta feedback training export',
    '',
    `Service: ${context.serviceName}`,
    `Filter: ${buildFilterLabel(context)}`,
    userLine,
    `Sessions: ${recordCount}`,
    '',
    'Contents:',
    '- manifest.csv — one row per session with input file paths and predicted/expected labels',
    '- labels.json — same metadata in JSON for training pipelines',
    '- inputs/ — full-resolution input images referenced by manifest.csv',
    '',
    'Column guide:',
    '- predicted_* = model output for the input set',
    '- expected_* = user-provided ground truth',
    '- input_files = semicolon-separated paths inside this archive',
    '- input_roles = index:role pairs (e.g. 0:reference_signature;1:query_signature)',
    '',
  ].join('\n');
}

export async function buildTrainingZip(
  sessions: BetaFeedbackSessionDetail[],
  context: ExportFilterContext
): Promise<Blob> {
  const zip = new JSZip();
  const rootName = exportZipFilename(context).replace(/\.zip$/, '');
  const root = zip.folder(rootName);
  if (!root) {
    throw new Error('Failed to create export archive');
  }

  const records: TrainingSessionRecord[] = [];

  for (const session of sessions) {
    const reqId = session.reqId || session.id || 'session';
    const serviceName = session.serviceName || context.serviceName;
    const inputs = session.inputs || [];
    const inputFiles: TrainingInputFile[] = [];

    inputs.forEach((rawInput, index) => {
      if (!rawInput?.trim()) return;
      const role = getInputRole(serviceName, index);
      const { bytes, extension } = parseBase64Image(rawInput);
      const zipPath = buildInputFileName(reqId, index, role, extension);
      root.file(zipPath, bytes);
      inputFiles.push({ index, role, zipPath });
    });

    records.push(sessionToTrainingRecord(session, inputFiles));
  }

  root.file('manifest.csv', buildManifestCsv(records));
  root.file('labels.json', JSON.stringify(records, null, 2));
  root.file('README.txt', buildReadme(context, records.length));

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export function downloadZipBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.zip') ? filename : `${filename}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index]);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export async function buildAndDownloadTrainingZip(
  sessions: BetaFeedbackSessionInfo[],
  fetchDetail: (sessionId: string) => Promise<BetaFeedbackSessionDetail>,
  context: ExportFilterContext,
  prefetchedDetails: BetaFeedbackSessionDetail[] = []
): Promise<void> {
  const prefetchedById = new Map(
    prefetchedDetails.filter((detail) => detail.id).map((detail) => [detail.id as string, detail])
  );

  const sessionIds = sessions.map((session) => session.id).filter((id): id is string => Boolean(id));
  if (sessionIds.length === 0) {
    throw new Error('No sessions available to export.');
  }

  const details = await mapWithConcurrency(sessionIds, 5, async (sessionId) => {
    const cached = prefetchedById.get(sessionId);
    if (cached?.inputs?.length) return cached;
    return fetchDetail(sessionId);
  });

  const blob = await buildTrainingZip(details, context);
  downloadZipBlob(blob, exportZipFilename(context));
}
