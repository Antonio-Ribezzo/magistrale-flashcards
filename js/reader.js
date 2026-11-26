const readerRanges = [
  {subject:'cdg', first:1, last:16},
  {subject:'mca', first:0, last:7},
  {subject:'si', first:1, last:16},
  {subject:'cyber', first:0, last:13}
];

const readers = new Map(readerRanges.flatMap(({subject, first, last}) =>
  Array.from({length:last - first + 1}, (_, index) => {
    const id = subject + '-c' + String(index + first).padStart(2, '0');
    return [id, new URL('../content/readers/' + id + '.json', import.meta.url)];
  })
));

const loaded = new Map();

export function hasReader(chapter) {
  return !chapter.local && readers.has(chapter.id);
}

export function readerState(chapterId) {
  return loaded.get(chapterId);
}

export function loadReader(chapterId) {
  const url = readers.get(chapterId);
  if (!url || loaded.has(chapterId)) return;
  const state = {};
  loaded.set(chapterId, state);
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data => {
      state.data = data;
    })
    .catch(() => {
      state.failed = true;
    });
}
