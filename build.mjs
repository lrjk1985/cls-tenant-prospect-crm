import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import { gunzipSync } from "node:zlib";
import { build } from "esbuild";

const outputDir = "dist";

const ELEMENT_REFS_BEFORE = `  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  signupButton: document.querySelector("#signupButton"),
  authNotice: document.querySelector("#authNotice"),`;

const ELEMENT_REFS_AFTER = `  authScreen: document.querySelector("#authScreen"),
  authForm: document.querySelector("#authForm"),
  authCopy: document.querySelector("#authCopy"),
  authEmailInput: document.querySelector("#authEmailInput"),
  authPasswordField: document.querySelector("#authPasswordField"),
  authPasswordInput: document.querySelector("#authPasswordInput"),
  newPasswordField: document.querySelector("#newPasswordField"),
  newPasswordInput: document.querySelector("#newPasswordInput"),
  confirmPasswordField: document.querySelector("#confirmPasswordField"),
  confirmPasswordInput: document.querySelector("#confirmPasswordInput"),
  loginButton: document.querySelector("#loginButton"),
  signupButton: document.querySelector("#signupButton"),
  forgotPasswordButton: document.querySelector("#forgotPasswordButton"),
  backToLoginButton: document.querySelector("#backToLoginButton"),
  authNotice: document.querySelector("#authNotice"),`;

const RENDER_USERS_SOURCE = `function renderUsers() {
  elements.userList.replaceChildren();

  if (state.currentProfile?.role !== "admin") {
    return;
  }

  if (state.users.length === 0) {
    const empty = document.createElement("p");
    empty.className = "saved-notice";
    empty.textContent = "No users found.";
    elements.userList.append(empty);
    return;
  }

  state.users.forEach((user) => {
    const isCurrentUser = user.id === state.currentUser?.id;
    const card = document.createElement("article");
    card.className = "user-card";
    card.classList.toggle("is-current-user", isCurrentUser);

    const header = document.createElement("header");
    const details = document.createElement("div");
    const name = document.createElement("strong");
    const email = document.createElement("small");
    const roleText = document.createElement("small");
    const status = document.createElement("span");
    name.textContent = user.full_name || "Unnamed user";
    email.textContent = user.email || "";
    roleText.textContent = user.role === "admin" ? "Admin access" : "Member access";
    status.className = "status-pill";
    status.textContent = (user.active ? "Active" : "Inactive") + (isCurrentUser ? " - You" : "");
    details.append(name, email, roleText);
    header.append(details, status);

    const controls = document.createElement("div");
    controls.className = "user-controls";

    const roleField = document.createElement("label");
    roleField.className = "user-control-field";
    const roleLabel = document.createElement("span");
    roleLabel.textContent = "Role";
    const roleSelect = document.createElement("select");
    roleSelect.innerHTML = '<option value="member">Member</option><option value="admin">Admin</option>';
    roleSelect.value = user.role === "admin" ? "admin" : "member";
    roleSelect.disabled = isCurrentUser;
    roleField.append(roleLabel, roleSelect);

    const activeField = document.createElement("label");
    activeField.className = "user-control-field";
    const activeLabel = document.createElement("span");
    activeLabel.textContent = "Access";
    const activeSelect = document.createElement("select");
    activeSelect.innerHTML = '<option value="true">Active</option><option value="false">Inactive</option>';
    activeSelect.value = String(Boolean(user.active));
    activeSelect.disabled = isCurrentUser;
    activeField.append(activeLabel, activeSelect);

    const updateButton = document.createElement("button");
    updateButton.className = "primary-button";
    updateButton.type = "button";
    updateButton.textContent = isCurrentUser ? "Current User" : "Save Access";
    updateButton.disabled = isCurrentUser;
    updateButton.addEventListener("click", () => updateUserAccess({
      userId: user.id,
      fullName: user.full_name || "",
      role: roleSelect.value,
      active: activeSelect.value === "true",
    }));

    controls.append(roleField, activeField, updateButton);
    card.append(header, controls);

    if (isCurrentUser) {
      const hint = document.createElement("p");
      hint.className = "user-hint";
      hint.textContent = "You cannot remove or downgrade your own access here.";
      card.append(hint);
    }

    elements.userList.append(card);
  });
}`;

const AUTH_HELPERS_SOURCE = `function getAuthRedirectUrl() {
  if (globalThis.location.protocol === "file:") {
    return "https://cls-tenant-prospect-crm-staging.vercel.app/";
  }

  const cleanPath = globalThis.location.pathname.replace(/index\\.html$/i, "");
  return globalThis.location.origin + cleanPath;
}

function isPasswordRecoveryUrl() {
  const hashParams = new URLSearchParams(globalThis.location.hash.replace(/^#/, ""));
  const queryParams = new URLSearchParams(globalThis.location.search);
  return hashParams.get("type") === "recovery" || queryParams.get("type") === "recovery";
}

function clearAuthUrlParams() {
  if (!globalThis.history?.replaceState || globalThis.location.protocol === "file:") {
    return;
  }

  const cleanPath = globalThis.location.pathname + globalThis.location.search;
  globalThis.history.replaceState({}, document.title, cleanPath);
}

function friendlyAuthMessage(error, fallback = "Something went wrong. Please try again.") {
  const message = String(error?.message || error || fallback);
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "Email or password is incorrect. Please try again or reset your password.";
  }

  if (lower.includes("email not confirmed")) {
    return "Please confirm the account from the email link before logging in.";
  }

  if (lower.includes("rate limit") || lower.includes("too many")) {
    return "Too many attempts. Please wait a while before trying again.";
  }

  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "The CRM could not reach Supabase. Check the internet connection and try again.";
  }

  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "This email already has an account. Please log in or reset the password.";
  }

  return message;
}

function setAuthBusy(isBusy, text = "") {
  elements.loginButton.disabled = isBusy;
  elements.signupButton.disabled = isBusy;
  elements.forgotPasswordButton.disabled = isBusy;
  elements.backToLoginButton.disabled = isBusy;

  if (text) {
    elements.authNotice.textContent = text;
  }
}

function setAuthMode(mode, message = "") {
  const isResettingPassword = mode === "resetPassword";
  state.authMode = mode;

  elements.authForm.classList.toggle("is-resetting-password", isResettingPassword);
  elements.authPasswordField.classList.toggle("hidden", isResettingPassword);
  elements.newPasswordField.classList.toggle("hidden", !isResettingPassword);
  elements.confirmPasswordField.classList.toggle("hidden", !isResettingPassword);
  elements.signupButton.classList.toggle("hidden", isResettingPassword);
  elements.forgotPasswordButton.classList.toggle("hidden", isResettingPassword);
  elements.backToLoginButton.classList.toggle("hidden", !isResettingPassword);

  elements.authPasswordInput.required = !isResettingPassword;
  elements.newPasswordInput.required = isResettingPassword;
  elements.confirmPasswordInput.required = isResettingPassword;
  elements.loginButton.textContent = isResettingPassword ? "Update Password" : "Log In";
  elements.authCopy.textContent = isResettingPassword
    ? "Enter a new password to finish resetting your account access."
    : "Sign in with your approved account. The first account created becomes the admin.";
  elements.authNotice.textContent = message;

  if (!isResettingPassword) {
    elements.newPasswordInput.value = "";
    elements.confirmPasswordInput.value = "";
  }
}`;

const SHOW_SIGNED_OUT_BEFORE = `function showSignedOut(message = "") {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  elements.authNotice.textContent = message;
}`;

const SHOW_SIGNED_OUT_AFTER = `function showSignedOut(message = "") {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  setAuthMode("login", message);
}`;

const SHOW_SIGNED_IN_BEFORE = `function showSignedIn() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}`;

const SHOW_SIGNED_IN_AFTER = `function showSignedIn() {
  elements.authScreen.classList.add("hidden");
  elements.appShell.classList.remove("hidden");
}

function showPasswordResetForm(message = "Enter a new password to finish the reset.") {
  elements.authScreen.classList.remove("hidden");
  elements.appShell.classList.add("hidden");
  setAuthMode("resetPassword", message);
  elements.newPasswordInput.focus();
}`;

const AUTH_FLOW_SOURCE = `async function handleAuthSubmit(formData) {
  if (state.authMode === "resetPassword") {
    await handlePasswordUpdate();
    return;
  }

  await handleLogin(formData);
}

async function handleLogin(formData) {
  const email = formData.get("email").toString().trim();
  const password = formData.get("password").toString();

  if (!email || !password) {
    elements.authNotice.textContent = "Enter your email and password to log in.";
    return;
  }

  setAuthBusy(true, "Signing in...");

  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthBusy(false);
    elements.authNotice.textContent = friendlyAuthMessage(error);
    return;
  }

  state.session = data.session;
  state.currentUser = data.user;
  await refreshAppData();
  setAuthBusy(false);
}

async function handleSignup() {
  const email = elements.authEmailInput.value.trim();
  const password = elements.authPasswordInput.value;

  if (!email || !password) {
    elements.authNotice.textContent = "Enter an email and password first, then create the account.";
    return;
  }

  setAuthBusy(true, "Creating account...");
  const { data, error } = await cloudClient.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: email.split("@")[0] },
    },
  });

  if (error) {
    setAuthBusy(false);
    elements.authNotice.textContent = friendlyAuthMessage(error);
    return;
  }

  if (data.session && data.user) {
    state.session = data.session;
    state.currentUser = data.user;
    await refreshAppData();
    setAuthBusy(false);
    return;
  }

  setAuthBusy(false);
  elements.authNotice.textContent = "Check your email to confirm the account, then log in.";
}

async function requestPasswordReset() {
  const email = elements.authEmailInput.value.trim();

  if (!email) {
    elements.authNotice.textContent = "Enter your email address first, then request a reset link.";
    elements.authEmailInput.focus();
    return;
  }

  setAuthBusy(true, "Sending reset link...");

  const { error } = await cloudClient.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });

  setAuthBusy(false);

  if (error) {
    elements.authNotice.textContent = friendlyAuthMessage(error, "Could not send a reset link.");
    return;
  }

  elements.authNotice.textContent = "If that email has access, a password reset link has been sent.";
}

async function handlePasswordUpdate() {
  const password = elements.newPasswordInput.value;
  const confirmPassword = elements.confirmPasswordInput.value;

  if (password.length < 6) {
    elements.authNotice.textContent = "Use at least 6 characters for the new password.";
    return;
  }

  if (password !== confirmPassword) {
    elements.authNotice.textContent = "The two password fields do not match.";
    return;
  }

  setAuthBusy(true, "Updating password...");
  const { error } = await cloudClient.auth.updateUser({ password });

  if (error) {
    setAuthBusy(false);
    elements.authNotice.textContent = friendlyAuthMessage(error, "Could not update the password.");
    return;
  }

  clearAuthUrlParams();
  elements.newPasswordInput.value = "";
  elements.confirmPasswordInput.value = "";
  setAuthBusy(false, "Password updated. Loading CRM...");
  await refreshAppData();
}

async function returnToLogin() {
  await cloudClient.auth.signOut();
  state.session = null;
  state.currentUser = null;
  state.currentProfile = null;
  clearAuthUrlParams();
  showSignedOut("");
}`;

const INITIALIZE_SOURCE = `async function initializeApp() {
  if (!cloudClient) {
    showSignedOut("Supabase could not load. Check your internet connection and refresh.");
    return;
  }

  requireCloudClient();
  const recoveringPassword = isPasswordRecoveryUrl();
  const { data } = await cloudClient.auth.getSession();
  state.session = data.session;
  state.currentUser = data.session?.user || null;

  cloudClient.auth.onAuthStateChange((event, session) => {
    state.session = session;
    state.currentUser = session?.user || null;

    if (event === "PASSWORD_RECOVERY") {
      showPasswordResetForm();
    }
  });

  if (recoveringPassword && state.currentUser) {
    showPasswordResetForm();
    return;
  }

  if (!state.currentUser) {
    showSignedOut("");
    return;
  }

  await refreshAppData();
}`;

const AUTH_LISTENERS_BEFORE = `elements.signupButton.addEventListener("click", () => {
  handleSignup();
});

elements.logoutButton.addEventListener("click", () => {`;

const AUTH_LISTENERS_AFTER = `elements.signupButton.addEventListener("click", () => {
  handleSignup();
});

elements.forgotPasswordButton.addEventListener("click", () => {
  requestPasswordReset();
});

elements.backToLoginButton.addEventListener("click", () => {
  returnToLogin();
});

elements.logoutButton.addEventListener("click", () => {`;

const HTML_PASSWORD_FIELD_BEFORE = `        <label>
          <span>Password</span>
          <input id="authPasswordInput" name="password" type="password" autocomplete="current-password" minlength="6" required />
        </label>`;

const HTML_PASSWORD_FIELD_AFTER = `        <label id="authPasswordField">
          <span>Password</span>
          <input id="authPasswordInput" name="password" type="password" autocomplete="current-password" minlength="6" required />
        </label>
        <label class="hidden" id="newPasswordField">
          <span>New password</span>
          <input id="newPasswordInput" name="newPassword" type="password" autocomplete="new-password" minlength="6" />
        </label>
        <label class="hidden" id="confirmPasswordField">
          <span>Confirm new password</span>
          <input id="confirmPasswordInput" name="confirmPassword" type="password" autocomplete="new-password" minlength="6" />
        </label>`;

const HTML_HELPERS_BEFORE = `        <div class="auth-actions">
          <button class="primary-button" id="loginButton" type="submit">Log In</button>
          <button class="secondary-button" id="signupButton" type="button">Create Account</button>
        </div>
        <p class="saved-notice" id="authNotice" aria-live="polite"></p>`;

const HTML_HELPERS_AFTER = `        <div class="auth-actions">
          <button class="primary-button" id="loginButton" type="submit">Log In</button>
          <button class="secondary-button" id="signupButton" type="button">Create Account</button>
        </div>
        <div class="auth-helper-actions">
          <button class="link-button auth-link-button" id="forgotPasswordButton" type="button">Forgot password?</button>
          <button class="link-button auth-link-button hidden" id="backToLoginButton" type="button">Back to log in</button>
        </div>
        <p class="saved-notice" id="authNotice" aria-live="polite"></p>`;

const ACCESS_POLISH_CSS = `

.auth-card.is-resetting-password .auth-actions,
.auth-actions.is-single {
  grid-template-columns: 1fr;
}

.auth-helper-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  min-height: 28px;
}

.auth-link-button {
  justify-self: center;
}

.primary-button:disabled,
.secondary-button:disabled,
.danger-button:disabled,
.link-button:disabled,
select:disabled,
input:disabled {
  cursor: not-allowed;
  opacity: 0.56;
}

.user-card.is-current-user {
  border-color: rgba(203, 22, 79, 0.36);
  background: var(--surface-soft);
}

.user-control-field {
  display: grid;
  gap: 6px;
}

.user-control-field span {
  color: var(--muted);
  font-size: 12px;
  font-weight: 800;
}

.user-hint {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.4;
}
`;

function replaceOnce(source, search, replacement, label) {
  if (!source.includes(search)) {
    throw new Error(`Could not apply build patch: ${label}`);
  }

  return source.replace(search, replacement);
}

function replacePattern(source, pattern, replacement, label) {
  if (!pattern.test(source)) {
    throw new Error(`Could not apply build patch: ${label}`);
  }

  return source.replace(pattern, replacement);
}

function extractCompressedAppSource(source) {
  const match = source.match(/const encodedApp = "([^"]+)";/);

  if (!match) {
    return source;
  }

  return gunzipSync(Buffer.from(match[1], "base64")).toString("utf8");
}

function addAccessPolishToApp(source) {
  if (source.includes('authMode: "login"')) {
    return source;
  }

  let next = source;
  next = replaceOnce(
    next,
    'const state = {\n  activeTab: "prospects",',
    'const state = {\n  activeTab: "prospects",\n  authMode: "login",',
    "auth state mode",
  );
  next = replaceOnce(next, ELEMENT_REFS_BEFORE, ELEMENT_REFS_AFTER, "auth element references");
  next = replacePattern(
    next,
    /function renderUsers\(\) \{[\s\S]*?\n\}\n\nfunction render\(\) \{/,
    `${RENDER_USERS_SOURCE}\n\nfunction render() {`,
    "admin user list",
  );
  next = replaceOnce(next, SHOW_SIGNED_OUT_BEFORE, `${AUTH_HELPERS_SOURCE}\n\n${SHOW_SIGNED_OUT_AFTER}`, "auth helpers");
  next = replaceOnce(next, SHOW_SIGNED_IN_BEFORE, SHOW_SIGNED_IN_AFTER, "password reset screen");
  next = replaceOnce(
    next,
    'showSignedOut(error.message || "Could not load the CRM.");',
    'showSignedOut(friendlyAuthMessage(error, "Could not load the CRM."));',
    "friendly load error",
  );
  next = replacePattern(
    next,
    /async function handleLogin\(formData\) \{[\s\S]*?\n\}\n\nasync function handleSignup\(\) \{[\s\S]*?\n\}\n\nasync function handleLogout\(\) \{/,
    `${AUTH_FLOW_SOURCE}\n\nasync function handleLogout() {`,
    "auth submit flow",
  );
  next = replaceOnce(
    next,
    'elements.adminNotice.textContent = error.message || "Could not invite user.";',
    'elements.adminNotice.textContent = friendlyAuthMessage(error, "Could not invite user.");',
    "invite error",
  );
  next = replaceOnce(
    next,
    'elements.adminNotice.textContent = error.message || "Could not update user.";',
    'elements.adminNotice.textContent = friendlyAuthMessage(error, "Could not update user.");',
    "update user error",
  );
  next = replacePattern(
    next,
    /async function initializeApp\(\) \{[\s\S]*?\n\}\n\nfunction csvEscape/,
    `${INITIALIZE_SOURCE}\n\nfunction csvEscape`,
    "password recovery init",
  );
  next = replaceOnce(
    next,
    "handleLogin(new FormData(elements.authForm));",
    "handleAuthSubmit(new FormData(elements.authForm));",
    "auth submit listener",
  );
  next = replaceOnce(next, AUTH_LISTENERS_BEFORE, AUTH_LISTENERS_AFTER, "auth helper listeners");

  return next;
}

function addAccessPolishToHtml(source) {
  if (source.includes('id="newPasswordInput"')) {
    return source;
  }

  let next = source;
  next = next.replace('<form class="auth-card" id="authForm">', '<form class="auth-card" id="authForm" method="post">');
  next = next.replace(
    '<p class="auth-copy">Sign in with your approved account. The first account created becomes the admin.</p>',
    '<p class="auth-copy" id="authCopy">Sign in with your approved account. The first account created becomes the admin.</p>',
  );
  next = replaceOnce(next, HTML_PASSWORD_FIELD_BEFORE, HTML_PASSWORD_FIELD_AFTER, "password reset HTML fields");
  next = replaceOnce(next, HTML_HELPERS_BEFORE, HTML_HELPERS_AFTER, "password reset HTML buttons");
  return next;
}

function addAccessPolishToCss(source) {
  if (source.includes(".auth-helper-actions")) {
    return source;
  }

  return `${source}${ACCESS_POLISH_CSS}`;
}

const appSource = addAccessPolishToApp(extractCompressedAppSource(await readFile("app.js", "utf8")));
const bundledSource = appSource.replace(
  "const cloudClient = globalThis.supabase?.createClient(supabaseUrl, supabasePublishableKey);",
  'import { createClient } from "@supabase/supabase-js";\nconst cloudClient = createClient(supabaseUrl, supabasePublishableKey);',
);

await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/app.source.js`, bundledSource);

await build({
  bundle: true,
  entryPoints: [`${outputDir}/app.source.js`],
  format: "iife",
  outfile: `${outputDir}/app.js`,
  target: "es2020",
});

let html = addAccessPolishToHtml(await readFile("index.html", "utf8"));
html = html.replace(/\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2"><\/script>/, "");
html = html.replace(
  /\s*<script src="https:\/\/cdn\.jsdelivr\.net\/npm\/pako@2\.1\.0\/dist\/pako\.min\.js"><\/script>\s*<script>[\s\S]*?globalThis\.DecompressionStream[\s\S]*?<\/script>/,
  "",
);

await writeFile(`${outputDir}/index.html`, html);
await writeFile(`${outputDir}/styles.css`, addAccessPolishToCss(await readFile("styles.css", "utf8")));

for (const file of [
  "artifacts.html",
  "tenant-prospect-import-template.csv",
  "unit-import-template.csv",
  "agent-import-template.csv",
]) {
  await copyFile(file, `${outputDir}/${file}`);
}
