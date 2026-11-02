/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  tokenize, 
  normalizeInstitutionName, 
  computeTF, 
  computeIDF, 
  computeCosineSimilarity,
  generateSentenceEmbedding,
  computeVectorCosineSimilarity,
  findMatchingKeywords,
  evaluateComplaintPair,
  scanAndGenerateMatches,
  AVAILABLE_EMBEDDING_MODELS
} from './matching-engine.ts';
import { Complaint } from './types.ts';

test('tokenize extracts lowercase alphanumeric words and filters stop words', () => {
  const text = 'The college professor did not attend the scheduled laboratory session.';
  const tokens = tokenize(text);
  assert.ok(tokens.includes('professor'));
  assert.ok(tokens.includes('scheduled'));
  assert.ok(tokens.includes('laboratory'));
  assert.ok(tokens.includes('session'));
  assert.ok(!tokens.includes('the'));
  assert.ok(!tokens.includes('college'));
});

test('normalizeInstitutionName handles various institutional suffixes', () => {
  const raw1 = 'Delhi Institute of Engineering and Technology';
  const raw2 = 'Delhi Technology University Campus';
  const norm1 = normalizeInstitutionName(raw1);
  const norm2 = normalizeInstitutionName(raw2);
  assert.equal(norm1, 'delhi');
  assert.equal(norm2, 'delhi');
});

test('generateSentenceEmbedding generates unit-normalized dense vectors', () => {
  const emb1 = generateSentenceEmbedding('unpaid faculty strike and delayed professor salary');
  assert.equal(emb1.length, 64);
  
  // Verify unit norm: sum of squares ≈ 1.0
  let sumSq = 0;
  for (const v of emb1) {
    sumSq += v * v;
  }
  assert.ok(Math.abs(Math.sqrt(sumSq) - 1.0) < 0.001, 'Embedding must be unit normalized');
});

test('computeVectorCosineSimilarity correctly scores semantically aligned texts high and unrelated texts low', () => {
  const emb1 = generateSentenceEmbedding('unpaid faculty strike and delayed professor salary');
  const emb2 = generateSentenceEmbedding('professors on protest due to non-payment of teacher salaries');
  const emb3 = generateSentenceEmbedding('hostel mess food hygiene and drinking water issue');

  const simHigh = computeVectorCosineSimilarity(emb1, emb2);
  const simLow = computeVectorCosineSimilarity(emb1, emb3);

  assert.ok(simHigh > 0.45, `Expected simHigh > 0.45, got ${simHigh}`);
  assert.ok(simHigh > simLow, `Semantic pair (${simHigh}) should score higher than unrelated pair (${simLow})`);
});

test('findMatchingKeywords detects critical domain risk categories', () => {
  const textA = 'The college management demanded 50000 capitation fee and refuses donation receipt.';
  const textB = 'Excessive hidden fees and capitation charges taken during admission without refund.';
  const result = findMatchingKeywords(textA, textB);

  assert.ok(result.matchedKeywords.includes('capitation'));
  assert.ok(result.topics.includes('Fee Irregularity'));
});

test('evaluateComplaintPair detects high overlap between cross-bureau complaints for same AICTE ID', () => {
  const c1: Complaint = {
    id: 'c1',
    trackingId: 'AIC-2026-001',
    studentId: 's1',
    studentName: 'Aarav Patel',
    studentEmail: 'aarav@example.com',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology',
    aictePermanentId: '1-45678901',
    category: 'Faculty and Teaching',
    subject: 'Severe shortage of qualified faculty in AI and Data Science',
    description: 'The college has zero professors for advanced AI subjects and regular classes are cancelled. Unpaid adjuncts are taking courses.',
    status: 'ASSIGNED',
    priority: 'HIGH',
    assignedBureau: 'REGULATION_BUREAU',
    supportingDocuments: [],
    actionsHistory: [],
    slaDeadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const c2: Complaint = {
    id: 'c2',
    trackingId: 'AIC-2026-002',
    studentId: 's2',
    studentName: 'Priya Sharma',
    studentEmail: 'priya@example.com',
    institutionId: 'inst-1',
    institutionName: 'Apex Institute of Technology',
    aictePermanentId: '1-45678901',
    category: 'Faculty and Teaching',
    subject: 'Unqualified faculty and non-payment of professor salaries',
    description: 'Faculty shortage in emerging technology branch. Professors on strike due to unpaid salaries and adjunct faculty taking classes.',
    status: 'UNDER_REVIEW',
    priority: 'HIGH',
    assignedBureau: 'PUBLIC_GRIEVANCE_REDRESSAL_CELL',
    supportingDocuments: [],
    actionsHistory: [],
    slaDeadline: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const idf = computeIDF([
    tokenize(`${c1.subject} ${c1.description}`),
    tokenize(`${c2.subject} ${c2.description}`)
  ]);

  const match = evaluateComplaintPair(c1, c2, idf);
  assert.ok(match !== null, 'Match should not be null');
  assert.equal(match?.similarityLevel, 'HIGH');
  assert.ok(match?.overallScore >= 70, `Expected score >= 70, got ${match?.overallScore}`);
  assert.ok(match?.matchFactors.semanticEmbeddingScore !== undefined);
  assert.ok(match?.matchFactors.explanation.some(e => e.includes('AICTE Permanent ID')));
  assert.ok(match?.matchFactors.explanation.some(e => e.includes('Cross-Bureau')));
});

test('scanAndGenerateMatches processes list and generates ranked results', () => {
  const complaints: Complaint[] = [
    {
      id: 'c1',
      trackingId: 'AIC-01',
      studentId: 's1',
      studentName: 'S1',
      studentEmail: 's1@example.com',
      institutionId: 'inst-1',
      institutionName: 'Apex College',
      aictePermanentId: '1-100',
      category: 'Infrastructure',
      subject: 'Laboratory fire safety violation and broken apparatus',
      description: 'Hostel fire safety norms violated, laboratory computers broken, unhygienic conditions.',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      supportingDocuments: [],
      actionsHistory: [],
      slaDeadline: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'c2',
      trackingId: 'AIC-02',
      studentId: 's2',
      studentName: 'S2',
      studentEmail: 's2@example.com',
      institutionId: 'inst-1',
      institutionName: 'Apex College',
      aictePermanentId: '1-100',
      category: 'Infrastructure',
      subject: 'Hostel hygiene and laboratory equipment hazard',
      description: 'Laboratory apparatus broken with zero fire safety measures in hostel building.',
      status: 'ASSIGNED',
      priority: 'HIGH',
      assignedBureau: 'REGULATION_BUREAU',
      supportingDocuments: [],
      actionsHistory: [],
      slaDeadline: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const matches = scanAndGenerateMatches(complaints);
  assert.ok(matches.length >= 1, 'Should find at least 1 match');
  assert.equal(matches[0].sourceComplaintId, 'c1');
  assert.equal(matches[0].targetComplaintId, 'c2');
});
