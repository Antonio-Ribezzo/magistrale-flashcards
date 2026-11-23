/** Scheduling calendar-day based to avoid daylight-saving / timezone surprises. */
export const INTERVALS = [1, 3, 7, 14, 30, 60, 120, 240];
export const RATINGS = [
  {value: 0, label: 'Non la conosco', short: 'Non conosco'},
  {value: 1, label: 'La conosco parzialmente', short: 'Parzialmente'},
  {value: 2, label: 'La conosco bene', short: 'Bene'},
  {value: 3, label: 'La conosco perfettamente', short: 'Perfettamente'}
];

export function localDay(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function addCalendarDays(isoDay, days) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDay)) throw new Error('Data calendario non valida');
  const [year, month, date] = isoDay.split('-').map(Number);
  const d = new Date(year, month - 1, date + days, 12);
  return localDay(d);
}
export function isDue(review, today = localDay()) {
  return Boolean(review?.attempts > 0 && typeof review.dueOn === 'string' && review.dueOn <= today);
}
export function reviewState(review, today = localDay()) {
  if (!review || !review.attempts) return 'new';
  if (isDue(review, today)) return 'due';
  if (review.stage >= 3 && review.successes >= 2 && review.lastRating >= 2) return 'mastered';
  return 'learning';
}
export function isMastered(review) {
  return Boolean(review?.stage >= 3 && review?.successes >= 2 && review?.lastRating >= 2);
}
export function isDifficult(review) {
  return Boolean(review?.hard || (review?.attempts > 0 && review.lastRating <= 1));
}
export function scoreReview(previous, rating, now = new Date()) {
  if (!Number.isInteger(rating) || rating < 0 || rating > 3) throw new Error('Valutazione non valida');
  const prev = previous || {};
  const oldStage = Number.isInteger(prev.stage) ? prev.stage : -1;
  let stage;
  if (rating === 0) stage = 0;
  else if (rating === 1) stage = Math.max(0, oldStage - 1);
  else if (rating === 2) stage = Math.min(INTERVALS.length - 1, oldStage + 1);
  else stage = Math.min(INTERVALS.length - 1, oldStage + 2);
  const intervalDays = INTERVALS[stage];
  const attempts = (prev.attempts || 0) + 1;
  const successes = (prev.successes || 0) + (rating >= 2 ? 1 : 0);
  return {
    id: prev.id,
    subjectId: prev.subjectId,
    chapterId: prev.chapterId,
    topicId: prev.topicId,
    attempts,
    successes,
    failures: (prev.failures || 0) + (rating <= 1 ? 1 : 0),
    streak: rating >= 2 ? (prev.streak || 0) + 1 : 0,
    hard: Boolean(prev.hard),
    stage, intervalDays, lastRating: rating,
    lastReviewedAt: now.toISOString(),
    dueOn: addCalendarDays(localDay(now), intervalDays),
    updatedAt: now.toISOString()
  };
}
export function summaryFor(cards, reviews, today = localDay()) {
  const data = {total: cards.length, studied:0, due:0, mastered:0, learning:0, new:0, hard:0};
  for (const card of cards) {
    const review = reviews[card.id];
    const state = reviewState(review, today);
    if (review?.attempts) data.studied++;
    if (state === 'due') data.due++;
    if (isMastered(review)) data.mastered++;
    if (state === 'learning') data.learning++;
    if (state === 'new') data.new++;
    if (isDifficult(review)) data.hard++;
  }
  data.coverage = data.total ? Math.round(data.studied / data.total * 100) : 0;
  data.mastery = data.total ? Math.round(data.mastered / data.total * 100) : 0;
  return data;
}
