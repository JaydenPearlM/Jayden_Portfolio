// Step 1: Bankroll Management
let bankroll = 2022; // Initialize to lucky year

function getBankroll() {
  return bankroll;
}

function setBankroll(newBalance) {
  if (Number.isInteger(newBalance)) {
    bankroll = newBalance;
    updateBankrollDisplay();
  } else {
    console.error("Bankroll must be an integer.");
  }
}

function updateBankrollDisplay() {
  document.getElementById("bankrollDisplay").textContent = `$${bankroll}`;
}

// Step 2: Game Flow – Show/Hide Betting and Actions
function timeToBet() {
  document.getElementById("playersActions").classList.add("hidden");
  document.getElementById("betting").classList.remove("hidden");
  updateBankrollDisplay(); // Always update bankroll view
}

function makeWager() {
  const wagerAmount = parseInt(document.getElementById("users-wager").value, 10);
  
  if (!wagerAmount || wagerAmount <= 0 || wagerAmount > getBankroll()) {
    console.log("Invalid wager.");
    return;
  }

  console.log(`Wager placed: $${wagerAmount}`);
  // Optionally subtract the wager from bankroll here
  timeToPlay();
}

function timeToPlay() {
  document.getElementById("betting").classList.add("hidden");
  document.getElementById("playersActions").classList.remove("hidden");
}
