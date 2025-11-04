let currentTrainer = null;
let currentPokemon = null;
const STORAGE_KEY = "pokemonTrainer";

const registrationSection = document.getElementById("registration-section");
const trainerSection = document.getElementById("trainer-section");
const trainerForm = document.getElementById("trainer-form");
const nameInput = document.getElementById("trainer-name");
const emailInput = document.getElementById("trainer-email");
const dateInput = document.getElementById("trainer-date");
const searchInput = document.getElementById("pokemon-search");
const searchBtn = document.getElementById("search-btn");
const pokemonPreview = document.getElementById("pokemon-preview");
const teamContainer = document.getElementById("team-container");
const emptyTeam = document.getElementById("empty-team");
const logoutBtn = document.getElementById("logout-btn");

function saveTrainer() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTrainer));
    console.log("✅ Datos guardados en localStorage:", currentTrainer);
  } catch (e) {
    console.error("Error al guardar:", e);
  }
}

function loadTrainer() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    console.log("📂 Cargando datos:", data);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Error al cargar:", e);
    return null;
  }
}

function deleteTrainer() {
  if (!storageAvailable) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("🗑️ Datos eliminados de localStorage");
  } catch (e) {
    console.error("Error al eliminar:", e);
  }
}

const today = new Date().toISOString().split("T")[0];
dateInput.setAttribute("min", today);

nameInput.addEventListener("input", () => {
  validateField(nameInput, nameInput.value.trim().length >= 3, "name-error");
});

emailInput.addEventListener("input", () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  validateField(emailInput, emailRegex.test(emailInput.value), "email-error");
});

dateInput.addEventListener("input", () => {
  const selectedDate = new Date(dateInput.value);
  const todayDate = new Date(today);
  validateField(dateInput, selectedDate >= todayDate, "date-error");
});

function validateField(input, isValid, errorId) {
  const errorElement = document.getElementById(errorId);
  if (isValid) {
    input.classList.remove("invalid");
    input.classList.add("valid");
    errorElement.classList.remove("show");
  } else {
    input.classList.remove("valid");
    input.classList.add("invalid");
    errorElement.classList.add("show");
  }
}

trainerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const date = dateInput.value;

  if (
    name.length < 3 ||
    !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) ||
    new Date(date) < new Date(today)
  ) {
    alert("Por favor, completa todos los campos correctamente");
    return;
  }

  const trainer = {
    id: Date.now(),
    name,
    email,
    startDate: date,
    team: [],
  };

  currentTrainer = trainer;
  saveTrainer();

  showTrainerSection();
});

function showTrainerSection() {
  registrationSection.classList.add("hidden");
  trainerSection.classList.remove("hidden");

  document.getElementById("display-name").textContent = currentTrainer.name;
  document.getElementById("display-email").textContent = currentTrainer.email;
  document.getElementById("display-date").textContent = new Date(
    currentTrainer.startDate
  ).toLocaleDateString("es-ES");

  renderTeam();
}

searchBtn.addEventListener("click", searchPokemon);
searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") searchPokemon();
});

async function searchPokemon() {
  const pokemonName = searchInput.value.trim().toLowerCase();
  const alertDiv = document.getElementById("search-alert");

  if (!pokemonName) {
    showAlert(alertDiv, "Por favor, ingresa un nombre de Pokémon", "error");
    return;
  }

  try {
    searchBtn.disabled = true;
    searchBtn.textContent = "Buscando...";

    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );

    if (!response.ok) {
      throw new Error("Pokémon no encontrado");
    }

    const data = await response.json();
    currentPokemon = {
      id: data.id,
      name: data.name,
      sprite: data.sprites.front_default,
    };

    document.getElementById("preview-img").src = currentPokemon.sprite;
    document.getElementById("preview-name").textContent = currentPokemon.name;
    pokemonPreview.classList.add("show");

    showAlert(alertDiv, `¡${currentPokemon.name} encontrado!`, "success");
  } catch (error) {
    showAlert(
      alertDiv,
      "No se encontró el Pokémon. Verifica el nombre e intenta nuevamente.",
      "error"
    );
    pokemonPreview.classList.remove("show");
  } finally {
    searchBtn.disabled = false;
    searchBtn.textContent = "Buscar";
  }
}

function showAlert(container, message, type) {
  container.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
  setTimeout(() => {
    container.innerHTML = "";
  }, 3000);
}

document.getElementById("add-btn").addEventListener("click", () => {
  if (!currentPokemon) return;

  const exists = currentTrainer.team.some((p) => p.id === currentPokemon.id);
  if (exists) {
    alert("¡Este Pokémon ya está en tu equipo!");
    return;
  }

  currentTrainer.team.push({
    ...currentPokemon,
    isFavorite: false,
  });

  saveTrainer();

  renderTeam();
  pokemonPreview.classList.remove("show");
  searchInput.value = "";

  const alertDiv = document.getElementById("search-alert");
  showAlert(
    alertDiv,
    `¡${currentPokemon.name} se unió a tu equipo!`,
    "success"
  );
});

function renderTeam() {
  if (!currentTrainer || currentTrainer.team.length === 0) {
    teamContainer.innerHTML = "";
    emptyTeam.style.display = "block";
    return;
  }

  emptyTeam.style.display = "none";
  teamContainer.innerHTML = currentTrainer.team
    .map(
      (pokemon, index) => `
                <div class="pokemon-card ${
                  pokemon.isFavorite ? "favorite" : ""
                }">
                    <img src="${pokemon.sprite}" alt="${pokemon.name}">
                    <h4>${pokemon.name}</h4>
                    <div class="pokemon-actions">
                        <label class="favorite-label">
                            <input type="checkbox" ${
                              pokemon.isFavorite ? "checked" : ""
                            } 
                                   onchange="toggleFavorite(${index})">
                            ⭐ Favorito
                        </label>
                        <button class="btn btn-danger btn-small" onclick="releasePokemon(${index})">
                            Liberar
                        </button>
                    </div>
                </div>
            `
    )
    .join("");
}

function toggleFavorite(index) {
  currentTrainer.team[index].isFavorite =
    !currentTrainer.team[index].isFavorite;
  saveTrainer();
  renderTeam();
}

function releasePokemon(index) {
  const pokemon = currentTrainer.team[index];
  if (confirm(`¿Estás seguro de liberar a ${pokemon.name}?`)) {
    currentTrainer.team.splice(index, 1);
    saveTrainer();
    renderTeam();
  }
}

logoutBtn.addEventListener("click", () => {
  if (confirm("¿Deseas cerrar sesión? Se perderán todos los datos.")) {
    currentTrainer = null;
    deleteTrainer();
    trainerSection.classList.add("hidden");
    registrationSection.classList.remove("hidden");
    trainerForm.reset();

    [nameInput, emailInput, dateInput].forEach((input) => {
      input.classList.remove("valid", "invalid");
    });
  }
});

window.addEventListener("DOMContentLoaded", () => {
  const savedTrainer = loadTrainer();
  if (savedTrainer) {
    currentTrainer = savedTrainer;
    showTrainerSection();
    console.log("✅ Entrenador cargado desde localStorage");
  }
});

window.toggleFavorite = toggleFavorite;
window.releasePokemon = releasePokemon;
