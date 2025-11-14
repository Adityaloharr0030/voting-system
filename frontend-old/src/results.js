// results.js
import { getItem, LS_KEYS } from './storage.js';

export function getResults() {
  const candidates = getItem(LS_KEYS.CANDIDATES, []);
  const votes = getItem(LS_KEYS.VOTES, []);
  const counts = candidates.map(c => ({
    name: c.name,
    count: votes.filter(v => v.candidateId === c.id).length
  }));
  return counts;
}

export function updateResultsChart(counts) {
  const ctx = document.getElementById('resultsChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: counts.map(c => c.name),
      datasets: [{ label: 'Votes', data: counts.map(c => c.count), backgroundColor: '#47b6ff' }]
    }
  });
}
