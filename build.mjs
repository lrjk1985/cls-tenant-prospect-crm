import { mkdir, readFile, writeFile, copyFile } from "node:fs/promises";

const outputDir = "dist";

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

await mkdir(outputDir, { recursive: true });
await writeFile(`${outputDir}/index.html`, addAccessPolishToHtml(await readFile("index.html", "utf8")));
await writeFile(`${outputDir}/styles.css`, addAccessPolishToCss(await readFile("styles.css", "utf8")));

for (const file of [
  "app.js",
  "artifacts.html",
  "tenant-prospect-import-template.csv",
  "unit-import-template.csv",
  "agent-import-template.csv",
]) {
  await copyFile(file, `${outputDir}/${file}`);
}
