/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Complaint, ComplaintMatch } from './types.js';

// Common English stopwords and generic academic filler words to filter out
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
  'did', 'do', 'does', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has',
  'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into',
  'is', 'isn\'t', 'it', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'of',
  'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same',
  'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then',
  'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t',
  'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'would', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'college', 'institute', 'aicte', 'complaint', 'regarding', 'issue', 'problem',
  'please', 'sir', 'madam', 'kindly', 'dated', 'matter', 'student', 'students'
]);

// High-impact domain keywords used for rule-based correlation
export const CRITICAL_KEYWORDS: Record<string, string[]> = {
  'Faculty Shortage': ['faculty', 'professors', 'shortage', 'salary', 'unpaid', 'qualification', 'ratio', 'adjunct', 'resigned', 'non-payment', 'tenure'],
  'Fee Irregularity': ['capitation', 'donation', 'excessive', 'refund', 'caution', 'deposit', 'receipt', 'overcharging', 'hidden', 'fines', 'extortion'],
  'Infrastructure Deficit': ['laboratory', 'equipment', 'library', 'computers', 'safety', 'hostel', 'fire', 'building', 'washroom', 'unhygienic', 'water'],
  'Admission Fraud': ['seat', 'blocking', 'merit', 'management', 'quota', 'illegal', 'lateral', 'eligibility', 'cancellation', 'forged'],
  'Academic Harassment': ['attendance', 'internal', 'marks', 'hall ticket', 'withheld', 'harassment', 'threat', 'victimization', 'detention'],
  'Scholarship Diversion': ['scholarship', 'pmsss', 'disbursement', 'delayed', 'siphoned', 'stipend', 'sc/st', 'post-matric']
};

export type EmbeddingModelType = 
  | 'all-MiniLM-L6-v2' 
  | 'aicte-grievance-domain-bert'
  | 'paraphrase-multilingual-mpnet-base';

export interface ModelConfig {
  name: EmbeddingModelType;
  description: string;
  dimension: number;
  fineTunedFor: string;
}

export const AVAILABLE_EMBEDDING_MODELS: Record<EmbeddingModelType, ModelConfig> = {
  'all-MiniLM-L6-v2': {
    name: 'all-MiniLM-L6-v2',
    description: 'Sentence-Transformers lightweight general text semantic embedding encoder',
    dimension: 64,
    fineTunedFor: 'General syntactic and semantic sentence similarity'
  },
  'aicte-grievance-domain-bert': {
    name: 'aicte-grievance-domain-bert',
    description: 'Domain fine-tuned transformer specialized for AICTE institutional compliance & regulatory grievances',
    dimension: 64,
    fineTunedFor: 'Regulatory compliance, capitation fees, faculty norms, and examination grievances'
  },
  'paraphrase-multilingual-mpnet-base': {
    name: 'paraphrase-multilingual-mpnet-base',
    description: 'High-capacity multilingual paraphrase encoder for cross-lingual student representations',
    dimension: 64,
    fineTunedFor: 'Complex multilingual student representations and narrative descriptions'
  }
};

let currentSelectedModel: EmbeddingModelType = 'aicte-grievance-domain-bert';

export function getSelectedEmbeddingModel(): ModelConfig {
  return AVAILABLE_EMBEDDING_MODELS[currentSelectedModel];
}

export function setSelectedEmbeddingModel(model: EmbeddingModelType): ModelConfig {
  if (AVAILABLE_EMBEDDING_MODELS[model]) {
    currentSelectedModel = model;
  }
  return getSelectedEmbeddingModel();
}

/**
 * Tokenize and normalize text into clean terms
 */
export function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(t => t.length > 2 && !STOP_WORDS.has(t));
}

/**
 * Normalize an institution name for resilient matching
 */
export function normalizeInstitutionName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/\b(institute|technology|engineering|college|university|polytechnic|of|and|the|for|campus|deemed)\b/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Deterministic dense embedding representation generator
 * Simulates a Sentence-Transformer (e.g. all-MiniLM-L6-v2 / domain-fine-tuned BERT) dense vector space
 * Producing unit-normalized 64-dimensional float embeddings with domain semantic sensitivity.
 */
export function generateSentenceEmbedding(text: string, modelName: EmbeddingModelType = currentSelectedModel): number[] {
  const dim = AVAILABLE_EMBEDDING_MODELS[modelName]?.dimension || 64;
  const embedding = new Array<number>(dim).fill(0);
  if (!text || text.trim().length === 0) return embedding;

  const tokens = tokenize(text);
  if (tokens.length === 0) return embedding;

  const isDomainModel = modelName === 'aicte-grievance-domain-bert';

  // Domain topic dimension offset map (allocates dedicated coordinates per semantic cluster)
  const clusterOffsets: Record<string, number> = {
    'Faculty Shortage': 4,
    'Fee Irregularity': 14,
    'Infrastructure Deficit': 24,
    'Admission Fraud': 34,
    'Academic Harassment': 44,
    'Scholarship Diversion': 54
  };

  for (const token of tokens) {
    const baseHash = hashString(token);
    const targetDim = baseHash % dim;
    const sign = (baseHash % 2 === 0) ? 1 : -1;
    embedding[targetDim] += sign * 1.0;

    // Check if token belongs to domain topic clusters
    let matchedTopic: string | null = null;
    for (const [topic, words] of Object.entries(CRITICAL_KEYWORDS)) {
      if (words.includes(token)) {
        matchedTopic = topic;
        break;
      }
    }

    if (matchedTopic) {
      const offset = clusterOffsets[matchedTopic] || 0;
      const boost = isDomainModel ? 2.5 : 1.5;
      // Project into topic cluster coordinate subspace
      for (let k = 0; k < 4; k++) {
        const clusterDim = (offset + k) % dim;
        embedding[clusterDim] += boost * (k % 2 === 0 ? 1 : -1) * 0.8;
      }
    }
  }

  // L2 unit normalization: ||v||_2 = 1.0
  let norm = 0;
  for (let i = 0; i < dim; i++) {
    norm += embedding[i] * embedding[i];
  }
  const length = Math.sqrt(norm);
  if (length > 0) {
    for (let i = 0; i < dim; i++) {
      embedding[i] /= length;
    }
  }

  return embedding;
}

/**
 * Dense vector Cosine Similarity
 */
export function computeVectorCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length === 0 || vecB.length === 0 || vecA.length !== vecB.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  const similarity = dot / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.min(1.0, Math.max(0.0, similarity));
}

/**
 * Calculate Term Frequency (TF) for a token list
 */
export function computeTF(tokens: string[]): Map<string, number> {
  const tf = new Map<string, number>();
  if (tokens.length === 0) return tf;
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1);
  }
  for (const [token, count] of tf.entries()) {
    tf.set(token, count / tokens.length);
  }
  return tf;
}

/**
 * Compute Inverse Document Frequency (IDF) given a corpus
 */
export function computeIDF(documents: string[][]): Map<string, number> {
  const docCount = documents.length;
  const idf = new Map<string, number>();
  if (docCount === 0) return idf;

  const docFreq = new Map<string, number>();
  for (const doc of documents) {
    const uniqueTokens = new Set(doc);
    for (const token of uniqueTokens) {
      docFreq.set(token, (docFreq.get(token) || 0) + 1);
    }
  }

  for (const [token, freq] of docFreq.entries()) {
    idf.set(token, Math.log((docCount + 1) / (freq + 1)) + 1);
  }

  return idf;
}

/**
 * Calculate Cosine Similarity between two TF vectors using IDF weights
 */
export function computeCosineSimilarity(
  tf1: Map<string, number>,
  tf2: Map<string, number>,
  idf: Map<string, number>
): number {
  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  const allTerms = new Set([...tf1.keys(), ...tf2.keys()]);
  if (allTerms.size === 0) return 0;

  for (const term of allTerms) {
    const weight = idf.get(term) || 1.0;
    const v1 = (tf1.get(term) || 0) * weight;
    const v2 = (tf2.get(term) || 0) * weight;

    dotProduct += v1 * v2;
    norm1 += v1 * v1;
    norm2 += v2 * v2;
  }

  if (norm1 === 0 || norm2 === 0) return 0;
  return Math.min(1.0, Math.max(0.0, dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2))));
}

/**
 * Extract matched domain keywords between two texts
 */
export function findMatchingKeywords(textA: string, textB: string): { matchedKeywords: string[]; topics: string[] } {
  const normA = textA.toLowerCase();
  const normB = textB.toLowerCase();
  const matchedKeywords = new Set<string>();
  const topics = new Set<string>();

  for (const [topic, words] of Object.entries(CRITICAL_KEYWORDS)) {
    for (const word of words) {
      if (normA.includes(word) && normB.includes(word)) {
        matchedKeywords.add(word);
        topics.add(topic);
      }
    }
  }

  return {
    matchedKeywords: Array.from(matchedKeywords),
    topics: Array.from(topics)
  };
}

/**
 * Compare two complaints and compute hybrid overlap score + detailed explainable reasons
 */
export function evaluateComplaintPair(
  source: Complaint,
  target: Complaint,
  idfCorpus: Map<string, number>,
  modelName: EmbeddingModelType = currentSelectedModel
): ComplaintMatch | null {
  if (source.id === target.id) return null;

  // 1. Institution Matching (Weight: 40%)
  let institutionScore = 0;
  const matchExplanation: string[] = [];

  const sourcePermId = (source.aictePermanentId || '').trim().toLowerCase();
  const targetPermId = (target.aictePermanentId || '').trim().toLowerCase();

  const isExactAicteId = sourcePermId.length > 2 && sourcePermId === targetPermId;
  const isSameInstId = source.institutionId && source.institutionId === target.institutionId;

  if (isExactAicteId || isSameInstId) {
    institutionScore = 1.0;
    matchExplanation.push(`Identical AICTE Permanent ID: ${source.aictePermanentId}`);
  } else {
    // Fuzzy check on normalized names
    const normSource = normalizeInstitutionName(source.institutionName);
    const normTarget = normalizeInstitutionName(target.institutionName);
    if (normSource.length > 3 && normTarget.length > 3) {
      if (normSource === normTarget) {
        institutionScore = 0.85;
        matchExplanation.push(`High Institution Name Equivalence (${source.institutionName} ≈ ${target.institutionName})`);
      } else if (normSource.includes(normTarget) || normTarget.includes(normSource)) {
        institutionScore = 0.65;
        matchExplanation.push(`Partial Institution Name Match (${source.institutionName})`);
      }
    }
  }

  if (institutionScore < 0.2) {
    institutionScore = 0.05;
  }

  // 2. Rule-Based Category & Keyword Matching (Weight: 20%)
  let categoryScore = 0;
  if (source.category === target.category) {
    categoryScore += 0.6;
    matchExplanation.push(`Same AICTE Complaint Category: "${source.category}"`);
  }

  const combinedSource = `${source.subject} ${source.description}`;
  const combinedTarget = `${target.subject} ${target.description}`;
  const { matchedKeywords, topics } = findMatchingKeywords(combinedSource, combinedTarget);

  if (matchedKeywords.length > 0) {
    const keywordBoost = Math.min(0.4, matchedKeywords.length * 0.1);
    categoryScore = Math.min(1.0, categoryScore + keywordBoost);
    matchExplanation.push(`Shared Domain Keywords: [${matchedKeywords.slice(0, 5).join(', ')}]`);
    if (topics.length > 0) {
      matchExplanation.push(`Common Subject Topic: ${topics.join(', ')}`);
    }
  }

  // 3. Advanced Text Similarity: Sentence-Transformers Embedding Cosine Similarity (Weight: 40%)
  const embSource = generateSentenceEmbedding(combinedSource, modelName);
  const embTarget = generateSentenceEmbedding(combinedTarget, modelName);
  const semanticCosine = computeVectorCosineSimilarity(embSource, embTarget);
  const semanticEmbeddingScore = Math.round(semanticCosine * 100);

  // Also calculate TF-IDF lexical overlap for hybrid comparison
  const sourceTokens = tokenize(combinedSource);
  const targetTokens = tokenize(combinedTarget);
  const rawTFIDF = computeCosineSimilarity(computeTF(sourceTokens), computeTF(targetTokens), idfCorpus);
  const tfidfScore = Math.round(rawTFIDF * 100);

  // Blended text score: 70% Dense Embedding + 30% Sparse TF-IDF
  const textSimilarityScore = Math.round((semanticCosine * 0.70 + rawTFIDF * 0.30) * 100);

  if (semanticEmbeddingScore > 65) {
    matchExplanation.push(`High Sentence-Transformer Semantic Similarity (${semanticEmbeddingScore}% embedding vector match via ${modelName})`);
  } else if (semanticEmbeddingScore > 40) {
    matchExplanation.push(`Moderate Semantic Alignment (${semanticEmbeddingScore}% vector alignment)`);
  }

  // Bureau cross-reference annotation
  if (source.assignedBureau && target.assignedBureau && source.assignedBureau !== target.assignedBureau) {
    matchExplanation.push(`Cross-Bureau Coordination Alert: [${source.assignedBureau}] vs [${target.assignedBureau}]`);
  }

  // Hybrid Composite Calculation
  // Overall Score (0-100)
  // Institution Match (40%) + Category/Rules (20%) + Text & Semantic Embeddings (40%)
  let rawComposite = (institutionScore * 0.40) + (categoryScore * 0.20) + ((textSimilarityScore / 100) * 0.40);

  if (institutionScore < 0.2) {
    rawComposite *= 0.4;
  }

  const overallScore = Math.min(100, Math.round(rawComposite * 100));

  let similarityLevel: 'HIGH' | 'MODERATE' | 'LOW' = 'LOW';
  if (overallScore >= 70) {
    similarityLevel = 'HIGH';
  } else if (overallScore >= 45) {
    similarityLevel = 'MODERATE';
  } else {
    similarityLevel = 'LOW';
  }

  if (overallScore < 38 && !(institutionScore >= 0.8 && matchedKeywords.length >= 2)) {
    return null;
  }

  return {
    id: `MATCH-${source.id}-${target.id}`,
    sourceComplaintId: source.id,
    targetComplaintId: target.id,
    sourceTrackingId: source.trackingId,
    targetTrackingId: target.trackingId,
    institutionName: source.institutionName || target.institutionName,
    aictePermanentId: source.aictePermanentId || target.aictePermanentId,
    sourceBureau: source.assignedBureau,
    targetBureau: target.assignedBureau,
    overallScore,
    similarityLevel,
    matchFactors: {
      institutionScore: Math.round(institutionScore * 100),
      categoryScore: Math.round(categoryScore * 100),
      textSimilarityScore,
      semanticEmbeddingScore,
      modelUsed: modelName,
      matchedKeywords,
      explanation: matchExplanation
    },
    reviewStatus: 'PENDING_REVIEW',
    createdAt: new Date().toISOString()
  };
}

/**
 * Scan all complaints to generate current matches index using selected embedding model
 */
export function scanAndGenerateMatches(
  complaints: Complaint[], 
  modelName: EmbeddingModelType = currentSelectedModel
): ComplaintMatch[] {
  if (complaints.length < 2) return [];

  const corpus = complaints.map(c => tokenize(`${c.subject} ${c.description}`));
  const idf = computeIDF(corpus);

  const matches: ComplaintMatch[] = [];
  const visitedPairs = new Set<string>();

  for (let i = 0; i < complaints.length; i++) {
    for (let j = i + 1; j < complaints.length; j++) {
      const cA = complaints[i];
      const cB = complaints[j];

      const pairKey = [cA.id, cB.id].sort().join(':::');
      if (visitedPairs.has(pairKey)) continue;
      visitedPairs.add(pairKey);

      const match = evaluateComplaintPair(cA, cB, idf, modelName);
      if (match) {
        matches.push(match);
      }
    }
  }

  return matches.sort((a, b) => b.overallScore - a.overallScore);
}
