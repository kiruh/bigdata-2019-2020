// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const fs = require("fs");
const crypto = require("crypto");
const { dialog } = require("electron").remote;

const alert = message => {
  const box = document.getElementById("message");
  if (box) {
    box.innerHTML = `<pre>${message}</pre>`;
  }
  // const options = {type: 'info', buttons: ['OK'], message};
  // dialog.showMessageBox(options, () => {});
};

const getWalletId = (username, password) => {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ username, password }))
    .digest("hex");
};
const folder = "./my-wallet";
const name = folder + "/wallet.json";

document.querySelector("#signup").addEventListener("click", () => {
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;
  const walletId = getWalletId(username, password);
  if (!walletId) {
    alert("Username and password are required");
    return;
  }
  const content = JSON.stringify({
    walletId
  });
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
  try {
    fs.writeFileSync(name, content, "utf-8");
    alert(["Signed up successfully!", walletId].join("\n"));
  } catch (e) {
    alert("Failed to save the file!");
  }
});

document.querySelector("#login").addEventListener("click", () => {
  const walletId = document.getElementById("login-hash").value;
  if (!walletId) {
    alert("Hash is required");
    return;
  }
  try {
    const content = fs.readFileSync(name);
    const json = JSON.parse(content);
    if (walletId === json.walletId) {
      alert("Logged in successfully");
    } else {
      alert("Hash is incorrect");
    }
  } catch (e) {
    alert("Could not read file");
  }
});
