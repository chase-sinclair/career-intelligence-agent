/**
 * The ML Model Matrix, verbatim from The Private Equity AI Operating Partner,
 * Chapter 1, Appendix 1 ("Types of AI Models", printed pp. 13-14).
 *
 * Every ability name, model type, model family and training paradigm here is
 * quoted from the book. The page's prose language rules about hyphens and em
 * dashes do NOT apply to this file: strings like `Semi-Supervised`,
 * `Chain-of-Thought (CoT)`, `One-Class SVM`, `Tree-Based` and
 * `Content-Based Filtering` are the book's own and must stay exact.
 *
 * Earlier copy for this project invented RNNs, ARIMA, GPT and few-shot
 * learning. None of those appear in the real matrix. Do not reintroduce them.
 */

export type FamilyKey = 'Perceive' | 'Reason' | 'Act'

export interface Family {
  key: FamilyKey
  description: string
}

/** The three ability families, in the book's Table 1 order. */
export const FAMILIES: ReadonlyArray<Family> = [
  { key: 'Perceive', description: 'Senses and structures data' },
  { key: 'Reason', description: 'Analyzes patterns and extracts meaning' },
  { key: 'Act', description: 'Decides, forecasts and generates outputs' },
] as const

export interface Ability {
  /** Ability verb, as printed. */
  name: string
  /** Short parenthetical shown under the verb in the grid. */
  sub: string
  /** Index into FAMILIES. */
  family: number
  /** Matrix row number, 1-12. */
  row: number
  /** Model types for this row, verbatim and in printed order. */
  modelTypes: ReadonlyArray<string>
  /** Model family for this row, verbatim. */
  modelFamily: string
  /** Training paradigm for this row, verbatim. */
  training: string
}

/** All twelve atomic abilities, in Table 1 order. */
export const ABILITIES: ReadonlyArray<Ability> = [
  {
    name: 'CLASSIFY',
    sub: 'Sort Data',
    family: 0,
    row: 1,
    modelTypes: ['Logistic Regression', 'Decision Tree', 'Random Forest', 'SVM'],
    modelFamily: 'Tree-Based, Linear Models',
    training: 'Supervised Learning',
  },
  {
    name: 'GROUP',
    sub: 'Cluster Data',
    family: 0,
    row: 2,
    modelTypes: ['K-Means', 'Gaussian Mixture Models (GMM)', 'Principal Component Analysis'],
    modelFamily: 'Clustering Models',
    training: 'Unsupervised Learning',
  },
  {
    name: 'IDENTIFY',
    sub: 'Recognize',
    family: 0,
    row: 3,
    modelTypes: ['Convolutional Neural Network (CNN)', 'Object Detection Models'],
    modelFamily: 'Neural Networks',
    training: 'Supervised / Deep Learning',
  },
  {
    name: 'DETECT ANOMALIES',
    sub: 'Outliers',
    family: 0,
    row: 4,
    modelTypes: ['Isolation Forest', 'Autoencoder', 'One-Class SVM'],
    modelFamily: 'Anomaly Detection Models',
    training: 'Unsupervised / Semi-Supervised / Deep Learning',
  },
  {
    name: 'ASSOCIATE',
    sub: 'Link Data',
    family: 1,
    row: 5,
    modelTypes: ['Graph Neural Networks (GNNs)', 'Bayesian'],
    modelFamily: 'Neural Networks',
    training: 'Unsupervised / Probabilistic Learning',
  },
  {
    name: 'RECOMMEND',
    sub: 'Advise',
    family: 1,
    row: 6,
    modelTypes: ['Collaborative Filtering', 'Matrix Factorization', 'Content-Based Filtering'],
    modelFamily: 'Recommendation Models',
    training: 'Supervised / Unsupervised Hybrid',
  },
  {
    name: 'INTERPRET',
    sub: 'Explain',
    family: 1,
    row: 7,
    modelTypes: ['GenAI: Multimodal Reasoning', 'Chain-of-Thought (CoT)', 'Neuro-Symbolic'],
    modelFamily: 'Reasoning Models',
    training: 'Supervised / Reinforcement Learning',
  },
  {
    name: 'LEARN',
    sub: 'Adapt',
    family: 1,
    row: 8,
    modelTypes: ['Autoencoder', 'BERT', 'Contrastive Learning'],
    modelFamily: 'Self-Supervised Models',
    training: 'Unsupervised',
  },
  {
    name: 'SIMULATE',
    sub: 'Model',
    family: 2,
    row: 9,
    modelTypes: ['Agent-Based Modeling', 'GANs', 'Markov Models', 'Q-learning'],
    modelFamily: 'Simulation Models',
    training: 'Unsupervised / Reinforcement Learning',
  },
  {
    name: 'OPTIMIZE',
    sub: 'Refine',
    family: 2,
    row: 10,
    modelTypes: ['Linear Programming', 'Genetic Algorithms', 'Bayesian'],
    modelFamily: 'Optimization Models',
    training: 'Optimization / Mathematical Programming',
  },
  {
    name: 'PREDICT',
    sub: 'Forecast',
    family: 2,
    row: 11,
    modelTypes: ['Bayesian', 'Prophet', 'XGBoost'],
    modelFamily: 'Forecasting Models',
    training: 'Supervised Learning, Time-Series Forecasting',
  },
  {
    name: 'CREATE',
    sub: 'Generate',
    family: 2,
    row: 12,
    modelTypes: ['GenAI: Generative Adversarial Network', 'Diffusion'],
    modelFamily: 'Generative Models',
    training: 'Supervised / Generative / Deep Learning',
  },
] as const

export interface WorkedExample {
  label: string
  path: ReadonlyArray<string>
}

/**
 * The book's own worked examples from Chapter 1, "Showing 'em in Action".
 *
 * Customer churn and Just-in-time returns resolve to the same ability string.
 * That is correct, not a duplication to clean up: two different business
 * problems can need the same abilities.
 */
export const WORKED_EXAMPLES: ReadonlyArray<WorkedExample> = [
  { label: 'Customer churn', path: ['CLASSIFY', 'INTERPRET', 'PREDICT'] },
  { label: 'Inventory restocking', path: ['IDENTIFY', 'INTERPRET', 'PREDICT', 'OPTIMIZE'] },
  { label: 'Just-in-time returns', path: ['CLASSIFY', 'INTERPRET', 'PREDICT'] },
  { label: 'Supply-chain logistics', path: ['IDENTIFY', 'ASSOCIATE', 'OPTIMIZE'] },
] as const

/**
 * Rows where Bayesian methods actually appear in the finished table, used by
 * the "one model, several rows" example in section 2. Derived from the matrix
 * above rather than hand-written, so the diagram cannot drift from the data.
 */
export const BAYESIAN_ROWS = ABILITIES.filter((a) => a.modelTypes.includes('Bayesian')).map((a) => ({
  name: a.name,
  row: String(a.row).padStart(2, '0'),
}))

/** Publication facts for the closing attribution card. */
export const BOOK = {
  title: 'The Private Equity AI Operating Partner',
  subtitle: 'Using Artificial Intelligence for Value Creation',
  author: 'Bruce Sinclair',
  publisher: 'Eve Allan',
  year: '2026',
  isbn: '979-8-218-83986-4',
  url: 'https://aioperatingpartners.ai/peai-book/',
} as const
