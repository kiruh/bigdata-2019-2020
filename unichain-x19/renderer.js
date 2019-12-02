const _ = require("lodash");
const fs = require("fs-extra");
const path = require("path");
const prompt = require("electron-prompt");
const { dialog } = require("electron").remote;

// helpers
const alert = message => {
  const options = { type: "info", buttons: ["OK"], message };
  dialog.showMessageBox(options, () => {});
};
const storageFolder = path.join(__dirname, "_storage");
const writeUser = async user => {
  const { id, name, wallets, userFolder } = user;
  const content = JSON.stringify({
    id,
    name,
    wallets
  });
  try {
    await fs.writeFile(
      path.join(storageFolder, userFolder, "_wallet"),
      content
    );
    _usersCached = null;
  } catch (error) {
    console.error(error);
  }
  return null;
};
const readUser = async userFolder => {
  try {
    const content = await fs.readFile(
      path.join(storageFolder, userFolder, "_wallet"),
      "utf8"
    );
    return { ...JSON.parse(content), userFolder };
  } catch (error) {
    console.error(error);
  }
  return null;
};
let _usersCached = null;
const getUsers = async () => {
  if (_usersCached) return _.cloneDeep(_usersCached);
  try {
    const userFolders = await fs.readdir(storageFolder);
    _usersCached = await Promise.all(userFolders.map(readUser));
    return _.cloneDeep(_usersCached);
  } catch (error) {
    console.error(error);
  }
  return [];
};
const getUser = async userKey => {
  const users = await getUsers();
  return users.find(x => x.id === userKey);
};
const getCurrencies = async () => {
  const users = await getUsers();
  return _.uniq(
    _.flatten(users.map(user => user.wallets)).map(wallet => wallet.currency)
  );
};
const filterUsers = async currency => {
  const users = await getUsers();
  return users.filter(user =>
    user.wallets.some(wallet => wallet.currency === currency)
  );
};
const onSend = async ({ user, currency }) => {
  if (user.id === authUser.id) {
    alert("Could not send money to yourself");
    return;
  }
  let amount = await prompt({
    title: `Send ${currency} to ${user.name}`,
    label: "Amount:",
    type: "input"
  });
  amount = _.toNumber(amount);
  if (amount && !_.isNaN(amount)) {
    const authWallet = authUser.wallets.find(x => x.currency === currency);
    if (authWallet) {
      const { balance } = authWallet;
      if (balance >= amount) {
        const sender = _.cloneDeep(authUser);
        const senderWallet = sender.wallets.find(x => x.currency === currency);
        senderWallet.balance -= amount;
        await writeUser(sender);
        const recipient = _.cloneDeep(user);
        const recipientWallet = recipient.wallets.find(
          x => x.currency === currency
        );
        recipientWallet.balance += amount;
        await writeUser(recipient);
        drawUsers(currency);
      } else {
        alert(`You don't have enougn money in your wallet`);
      }
    } else {
      alert(`You don't have ${currency} wallet`);
    }
  }
};
const drawUsers = async currency => {
  document.getElementById("dashboard_users").innerHTML = "";
  const ul = document.createElement("ul");
  ul.className = "list-group";
  const li = document.createElement("li");
  li.className = "list-group-item";
  li.innerHTML = `<strong>${currency}</strong>`;
  ul.appendChild(li);
  const users = await filterUsers(currency);
  users.forEach(user => {
    const wallet = user.wallets.find(x => x.currency === currency);
    const li = document.createElement("li");
    li.className = "list-group-item";
    const div = document.createElement("div");
    div.className = "d-flex justify-content-between";
    // user
    const userDiv = document.createElement("div");
    userDiv.innerText = user.name;
    div.appendChild(userDiv);
    //  balance
    const balanceDiv = document.createElement("div");
    balanceDiv.innerText = wallet.balance;
    div.appendChild(balanceDiv);
    // send button
    const sendButton = document.createElement("button");
    sendButton.className = "btn btn-link";
    sendButton.innerText = "Send";
    sendButton.onclick = async () => {
      onSend({ user, currency });
    };
    div.appendChild(sendButton);
    li.appendChild(div);
    ul.appendChild(li);
  });
  document.getElementById("dashboard_users").appendChild(ul);
};
const drawCurrencies = async () => {
  const currencies = await getCurrencies();
  const ul = document.createElement("ul");
  ul.className = "list-group";
  currencies.forEach(currency => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    const button = document.createElement("button");
    button.className = "btn btn-link";
    button.innerText = currency;
    button.onclick = () => {
      drawUsers(currency);
    };
    li.appendChild(button);
    ul.appendChild(li);
  });
  document.getElementById("dashboard_currencies").appendChild(ul);
};
let authUser;
const onSignIn = async user => {
  authUser = user;
  document.getElementById("signin").classList.add("d-none");
  document.getElementById("signed").classList.remove("d-none");
  document.getElementById("signed_name").innerText = user.name;
  document.getElementById("dashboard").classList.remove("d-none");
  drawCurrencies();
  const [currency] = await getCurrencies();
  drawUsers(currency);
};
const onSignOut = () => {
  authUser = null;
  document.getElementById("signin").classList.remove("d-none");
  document.getElementById("signed").classList.add("d-none");
  document.getElementById("signed_name").innerText = "";
  document.getElementById("dashboard").classList.add("d-none");
  document.getElementById("dashboard_users").innerHTML = "";
  document.getElementById("dashboard_currencies").innerHTML = "";
};

// initial load
const onLoad = async () => {
  const userKey = localStorage.getItem("userKey");
  const user = userKey ? await getUser(userKey) : null;
  if (!user) {
    // no user
    onSignOut();
  } else {
    // with user
    onSignIn(user);
  }
};
onLoad();

// configure handlers
// login
document
  .getElementById("signin_form")
  .addEventListener("submit", async event => {
    event.preventDefault();
    document.getElementById("signin_error").classList.add("d-none");
    const userKey = document.getElementById("signin_userKey").value;
    const user = await getUser(userKey);
    if (!user) {
      document.getElementById("signin_error").classList.remove("d-none");
    } else {
      localStorage.setItem("userKey", userKey);
      onSignIn(user);
    }
  });
// logout
document.getElementById("signed_signout").addEventListener("click", () => {
  localStorage.removeItem("userKey");
  onSignOut();
});
