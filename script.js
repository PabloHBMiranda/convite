// Data e hora da viagem: 11 de julho de 2026, 08:00 (horário local do dispositivo)
const TRIP_DATE = new Date(2026, 6, 11, 8, 0, 0);

const envelopeBtn = document.getElementById("envelope-btn");
const envelopeScreen = document.getElementById("envelope-screen");
const revealScreen = document.getElementById("reveal-screen");

const modalOverlay = document.getElementById("confirm-modal");
const modalText = document.getElementById("modal-text");
const modalHint = document.getElementById("modal-hint");
const modalBtn = document.getElementById("modal-btn");
const modalBtnZone = document.getElementById("modal-btn-zone");
const modalPasswordForm = document.getElementById("modal-password-form");
const modalPasswordInput = document.getElementById("modal-password-input");
const modalPasswordError = document.getElementById("modal-password-error");

// Sequência de brincadeira antes de abrir o convite de verdade
const MODAL_STEPS = [
  { kind: "dodge", text: "Deseja abrir?", btn: "SIM", dodgesNeeded: 3 },
  {
    kind: "password",
    text: "Antes de mais nada... qual a senha?",
    hint: "Dica: Data que nos conhecemos",
  },
  { kind: "confirm", text: "Uai, a data certa era essa??????", btn: "Continuar" },
  { kind: "confirm", text: "Você quer realmente abrir?", btn: "ABRIR" },
  { kind: "confirm", text: "Tem certeza mesmo?", btn: "ABRIR" },
  { kind: "confirm", text: "É a sua última chance...", btn: "ABRIR" },
  { kind: "final", text: "Então tá bom...", delay: 1300 },
];

let stepIndex = 0;
let dodgeCount = 0;

envelopeBtn.addEventListener("click", () => {
  if (envelopeBtn.classList.contains("opening")) return;
  openConfirmModal();
});

modalPasswordForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!isValidDate(modalPasswordInput.value)) {
    modalPasswordInput.classList.add("invalid");
    modalPasswordError.style.display = "block";
    modalPasswordInput.focus();
    return;
  }

  advanceStep();
});

// Máscara dd/mm/aaaa: insere as barras sozinha enquanto ela digita os números
modalPasswordInput.addEventListener("input", () => {
  const digits = modalPasswordInput.value.replace(/\D/g, "").slice(0, 8);
  let formatted = digits;

  if (digits.length > 4) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  } else if (digits.length > 2) {
    formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  modalPasswordInput.value = formatted;
  modalPasswordInput.classList.remove("invalid");
  modalPasswordError.style.display = "none";
});

function isValidDate(value) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return false;

  // é a data em que vocês se conheceram, então tem que ser no passado
  const enteredDate = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return enteredDate < today;
}

function openConfirmModal() {
  stepIndex = 0;
  dodgeCount = 0;
  modalOverlay.classList.add("active");
  renderModalStep();
}

function renderModalStep() {
  const step = MODAL_STEPS[stepIndex];

  restoreModalButtonToZone();
  modalText.textContent = step.text;
  modalHint.textContent = step.hint || "";
  modalHint.style.display = step.hint ? "block" : "none";
  modalPasswordForm.style.display = "none";
  modalBtnZone.style.display = "none";
  modalPasswordInput.value = "";
  modalPasswordInput.classList.remove("invalid");
  modalPasswordError.style.display = "none";

  if (step.kind === "password") {
    modalPasswordForm.style.display = "flex";
    modalPasswordInput.focus();
    return;
  }

  if (step.kind === "final") {
    setTimeout(() => advanceStep(), step.delay || 1200);
    return;
  }

  modalBtnZone.style.display = "flex";
  modalBtn.textContent = step.btn;
  modalBtn.onclick = () => handleModalClick(step);
}

function advanceStep() {
  stepIndex++;
  if (stepIndex >= MODAL_STEPS.length) {
    modalOverlay.classList.remove("active");
    openEnvelope();
    return;
  }
  renderModalStep();
}

function handleModalClick(step) {
  if (step.kind === "dodge") {
    if (dodgeCount < step.dodgesNeeded) {
      dodgeCount++;
      dodgeModalButtonAcrossScreen();
      return;
    }
    // depois de fugir o número de vezes combinado, o próximo clique realmente acerta o botão
    advanceStep();
    return;
  }
  advanceStep();
}

// Solta o botão do modal e deixa ele fugir pela tela inteira (posicionamento
// relativo ao viewport, por isso precisa virar filho direto do <body> —
// dentro do modal ele ficaria preso pelo transform/backdrop-filter do overlay).
function dodgeModalButtonAcrossScreen() {
  const startRect = modalBtn.getBoundingClientRect();

  if (modalBtn.parentElement !== document.body) {
    document.body.appendChild(modalBtn);
    modalBtn.classList.add("roaming");
    modalBtn.style.left = `${startRect.left}px`;
    modalBtn.style.top = `${startRect.top}px`;
    void modalBtn.offsetWidth; // força o reflow antes de animar para a nova posição
  }

  const margin = 24;
  const btnRect = modalBtn.getBoundingClientRect();
  const maxX = Math.max(window.innerWidth - btnRect.width - margin * 2, 0);
  const maxY = Math.max(window.innerHeight - btnRect.height - margin * 2, 0);
  const randX = margin + Math.random() * maxX;
  const randY = margin + Math.random() * maxY;

  modalBtn.style.left = `${randX}px`;
  modalBtn.style.top = `${randY}px`;
}

function restoreModalButtonToZone() {
  modalBtn.classList.remove("roaming");
  modalBtn.style.position = "";
  modalBtn.style.left = "";
  modalBtn.style.top = "";
  if (modalBtn.parentElement !== modalBtnZone) {
    modalBtnZone.appendChild(modalBtn);
  }
}

function openEnvelope() {
  envelopeBtn.classList.add("opening");

  setTimeout(() => {
    envelopeScreen.classList.remove("active");
    revealScreen.classList.add("active");
    startCountdown();
  }, 550);
}

function startCountdown() {
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

function updateCountdown() {
  const now = new Date();
  let diff = TRIP_DATE - now;

  const els = {
    days: document.getElementById("cd-days"),
    hours: document.getElementById("cd-hours"),
    minutes: document.getElementById("cd-minutes"),
    seconds: document.getElementById("cd-seconds"),
  };

  if (diff <= 0) {
    els.days.textContent = "00";
    els.hours.textContent = "00";
    els.minutes.textContent = "00";
    els.seconds.textContent = "00";
    document.querySelector(".footer-note").textContent = "é hoje! 🎒";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  diff -= days * 1000 * 60 * 60 * 24;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  diff -= hours * 1000 * 60 * 60;

  const minutes = Math.floor(diff / (1000 * 60));
  diff -= minutes * 1000 * 60;

  const seconds = Math.floor(diff / 1000);

  els.days.textContent = String(days).padStart(2, "0");
  els.hours.textContent = String(hours).padStart(2, "0");
  els.minutes.textContent = String(minutes).padStart(2, "0");
  els.seconds.textContent = String(seconds).padStart(2, "0");
}
