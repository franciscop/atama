const persistence = {};

// The name of the key to save in localStorage
const key = '_____state';

// Make sure we can work with localStorage
const available = () => typeof window !== 'undefined' && 'localStorage' in window;

// Read the information from localStorage and store it into the state object
persistence.load = (state) => {
  if (!available()) return;

  // Try to retrieve it from localStorage or default to an empty object
  const stored = JSON.parse(localStorage.getItem(key) || "{}");

  // No data was stored => return
  if (!stored.data) return;

  // Store it into our local JSON
  for (let key in stored.data) {
    state[key] = stored.data[key];
  }
};

// Save the data into localStorage for later retrieval
persistence.save = (data) => {
  if (!available()) return;

  const timestamp = new Date().getTime();
  const serialized = JSON.stringify({ timestamp, data });

  localStorage.setItem(key, serialized);
};

export default persistence;
