import { CONFIG } from "./config.js";
import { CITIES } from "./cities.js";

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(correctCity, pool, count) {
  const sameRegion = pool.filter(
    (c) => c.region === correctCity.region && c.name !== correctCity.name
  );
  const diffRegion = pool.filter((c) => c.region !== correctCity.region);

  const distractors = [];

  // Pick at most 1 from the same region
  if (sameRegion.length > 0) {
    const pick = sameRegion[Math.floor(Math.random() * sameRegion.length)];
    distractors.push(pick);
  }

  // Fill the rest from different regions
  const shuffledDiff = shuffleArray([...diffRegion]);
  for (const city of shuffledDiff) {
    if (distractors.length >= count) break;
    if (!distractors.some((d) => d.name === city.name)) {
      distractors.push(city);
    }
  }

  // Fallback: fill from anywhere if not enough
  const shuffledPool = shuffleArray([...pool]);
  for (const city of shuffledPool) {
    if (distractors.length >= count) break;
    if (
      !distractors.some((d) => d.name === city.name) &&
      city.name !== correctCity.name
    ) {
      distractors.push(city);
    }
  }

  return distractors.slice(0, count);
}

function generateRounds() {
  const shuffled = shuffleArray([...CITIES]);
  const correctCities = shuffled.slice(0, CONFIG.ROUNDS_PER_GAME);
  const distractorPool = shuffled.slice(CONFIG.ROUNDS_PER_GAME);

  return correctCities.map((city) => {
    const distractors = pickDistractors(
      city,
      distractorPool,
      CONFIG.OPTIONS_PER_ROUND - 1
    );
    const options = shuffleArray([
      { name: city.name, country: city.country, isCorrect: true },
      ...distractors.map((d) => ({
        name: d.name,
        country: d.country,
        isCorrect: false,
      })),
    ]);
    return {
      correctCity: city,
      options,
      imageUrl: null,
      photographerName: "",
      photographerUrl: "",
      unsplashUrl: "",
    };
  });
}

const RESULT_MESSAGES = [
  "Time to book some flights!",
  "Time to book some flights!",
  "Keep exploring! The world is vast.",
  "Not bad! You have a good eye.",
  "Impressive! You really know your cities.",
  "Perfect! You are a world traveler!",
];

let state = null;

export function createGame() {
  state = {
    currentRound: 0,
    totalRounds: CONFIG.ROUNDS_PER_GAME,
    score: 0,
    rounds: generateRounds(),
    phase: "playing",
    selectedAnswer: null,
    isCorrect: null,
  };
  return state;
}

export function getCurrentRound() {
  return state.rounds[state.currentRound];
}

export function selectAnswer(index) {
  if (state.selectedAnswer !== null) return null;
  state.selectedAnswer = index;
  const round = getCurrentRound();
  state.isCorrect = round.options[index].isCorrect;
  if (state.isCorrect) state.score++;
  return { isCorrect: state.isCorrect, correctIndex: round.options.findIndex((o) => o.isCorrect) };
}

export function nextRound() {
  state.currentRound++;
  state.selectedAnswer = null;
  state.isCorrect = null;
  if (state.currentRound >= state.totalRounds) {
    state.phase = "results";
  }
  return state;
}

export function getState() {
  return state;
}

export function getResultMessage() {
  return RESULT_MESSAGES[state.score] || RESULT_MESSAGES[0];
}
