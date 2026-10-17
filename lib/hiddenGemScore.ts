export interface ScoreBreakdown {
  score: number;
  ratingNorm: number;
  bayesianRating: number;
  obscurityNorm: number;
  affordabilityNorm: number;
  upvoteNorm: number;
  verifiedNorm: number;
  weights: {
    rating: number;
    obscurity: number;
    affordability: number;
    upvotes: number;
    verified: number;
  };
  components: {
    ratingContribution: number;
    obscurityContribution: number;
    affordabilityContribution: number;
    upvoteContribution: number;
    verifiedContribution: number;
  };
  shouldBeVerified: boolean;
}

export interface ScoreInputs {
  avgRating: number;
  reviewCount: number;
  pricePerPerson: number;
  upvotes: number;
  distinctVisits: number;
}

/**
 * Calculates Hidden Gem Score (0-100) and detailed breakdown
 */
export function calculateHiddenGemScore(inputs: ScoreInputs): ScoreBreakdown {
  const {
    avgRating = 0,
    reviewCount = 0,
    pricePerPerson = 0,
    upvotes = 0,
    distinctVisits = 0,
  } = inputs;

  // Bayesian smoothing with prior 3.5 and weight 3
  const prior = 3.5;
  const weight = 3;
  const bayesianRating =
    (avgRating * reviewCount + prior * weight) / (reviewCount + weight);
  const ratingNorm = Math.max(0, Math.min(1, bayesianRating / 5));

  // Obscurity: fewer reviews = more hidden
  const obscurityNorm = Math.max(0, 1 - Math.min(reviewCount / 50, 1));

  // Affordability: under Rs 500
  const affordabilityNorm = Math.max(
    0,
    1 - Math.min(pricePerPerson / 500, 1)
  );

  // Upvotes normalized to 30
  const upvoteNorm = Math.max(0, Math.min(upvotes / 30, 1));

  // Verified confirmations normalized to 5
  const verifiedNorm = Math.max(0, Math.min(distinctVisits / 5, 1));

  const weights = {
    rating: 0.35,
    obscurity: 0.2,
    affordability: 0.2,
    upvotes: 0.15,
    verified: 0.1,
  };

  const ratingContribution = weights.rating * ratingNorm * 100;
  const obscurityContribution = weights.obscurity * obscurityNorm * 100;
  const affordabilityContribution = weights.affordability * affordabilityNorm * 100;
  const upvoteContribution = weights.upvotes * upvoteNorm * 100;
  const verifiedContribution = weights.verified * verifiedNorm * 100;

  const totalScore = Math.round(
    ratingContribution +
      obscurityContribution +
      affordabilityContribution +
      upvoteContribution +
      verifiedContribution
  );

  // Bound score between 0 and 100
  const score = Math.max(0, Math.min(100, totalScore));

  // Community verified rule: 3 distinct visits OR 5 upvotes
  const shouldBeVerified = distinctVisits >= 3 || upvotes >= 5;

  return {
    score,
    ratingNorm: Math.round(ratingNorm * 100) / 100,
    bayesianRating: Math.round(bayesianRating * 10) / 10,
    obscurityNorm: Math.round(obscurityNorm * 100) / 100,
    affordabilityNorm: Math.round(affordabilityNorm * 100) / 100,
    upvoteNorm: Math.round(upvoteNorm * 100) / 100,
    verifiedNorm: Math.round(verifiedNorm * 100) / 100,
    weights,
    components: {
      ratingContribution: Math.round(ratingContribution * 10) / 10,
      obscurityContribution: Math.round(obscurityContribution * 10) / 10,
      affordabilityContribution: Math.round(affordabilityContribution * 10) / 10,
      upvoteContribution: Math.round(upvoteContribution * 10) / 10,
      verifiedContribution: Math.round(verifiedContribution * 10) / 10,
    },
    shouldBeVerified,
  };
}
