const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");

describe("task1.html - Landing Page", () => {
  let dom;
  let document;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, "../task1.html"), "utf8");
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  test("should have a valid DOCTYPE", () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../task1.html"), "utf8");
    expect(html.trim().startsWith("<!DOCTYPE html>")).toBe(true);
  });

  test("should have a page title", () => {
    const title = document.querySelector("title");
    expect(title).not.toBeNull();
    expect(title.textContent).toContain("Yasooja");
  });

  test("should reference the correct CSS file", () => {
    const link = document.querySelector('link[rel="stylesheet"]');
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("task1.css");
  });

  test("should have a navigation bar with links", () => {
    const navLinks = document.querySelectorAll("nav a");
    expect(navLinks.length).toBeGreaterThanOrEqual(4);
  });

  test("should have a Login link in the navigation", () => {
    const navLinks = document.querySelectorAll("nav a");
    const loginLink = Array.from(navLinks).find((a) =>
      a.textContent.includes("Login")
    );
    expect(loginLink).toBeDefined();
    expect(loginLink.getAttribute("href")).toBe("login.html");
  });

  test("should have a Shop Now button", () => {
    const btn = document.querySelector(".shop-now");
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain("Shop Now");
  });

  test("should display 5 products", () => {
    const products = document.querySelectorAll(".product");
    expect(products.length).toBe(5);
  });

  test("each product should have an image, heading, and description", () => {
    const products = document.querySelectorAll(".product");
    products.forEach((product) => {
      expect(product.querySelector("img")).not.toBeNull();
      expect(product.querySelector("h3")).not.toBeNull();
      expect(product.querySelector("p")).not.toBeNull();
    });
  });

  test("should have a footer with copyright", () => {
    const footer = document.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer.textContent).toContain("Yasooja Beauty");
  });

  test("product-showcase section should be properly closed", () => {
    const sections = document.querySelectorAll("main section");
    expect(sections.length).toBe(2);
  });
});

describe("login.html - Login Page", () => {
  let dom;
  let document;

  beforeAll(() => {
    const html = fs.readFileSync(path.resolve(__dirname, "../login.html"), "utf8");
    dom = new JSDOM(html);
    document = dom.window.document;
  });

  test("should have a valid DOCTYPE", () => {
    const html = fs.readFileSync(path.resolve(__dirname, "../login.html"), "utf8");
    expect(html.trim().startsWith("<!DOCTYPE html>")).toBe(true);
  });

  test("should have a page title containing Yasooja", () => {
    const title = document.querySelector("title");
    expect(title).not.toBeNull();
    expect(title.textContent).toContain("Yasooja");
  });

  test("should have a login form", () => {
    const form = document.getElementById("login-form");
    expect(form).not.toBeNull();
  });

  test("should have an email input with type email", () => {
    const email = document.getElementById("email");
    expect(email).not.toBeNull();
    expect(email.getAttribute("type")).toBe("email");
    expect(email.hasAttribute("required")).toBe(true);
  });

  test("should have a password input with minlength", () => {
    const password = document.getElementById("password");
    expect(password).not.toBeNull();
    expect(password.getAttribute("type")).toBe("password");
    expect(password.hasAttribute("required")).toBe(true);
    expect(password.getAttribute("minlength")).toBe("6");
  });

  test("should have a submit button", () => {
    const btn = document.querySelector(".login-btn");
    expect(btn).not.toBeNull();
    expect(btn.getAttribute("type")).toBe("submit");
  });

  test("should have a remember-me checkbox", () => {
    const checkbox = document.getElementById("remember");
    expect(checkbox).not.toBeNull();
    expect(checkbox.getAttribute("type")).toBe("checkbox");
  });

  test("should link back to the home page", () => {
    const navLinks = document.querySelectorAll("nav a");
    const homeLink = Array.from(navLinks).find((a) =>
      a.textContent.includes("Home")
    );
    expect(homeLink).toBeDefined();
    expect(homeLink.getAttribute("href")).toBe("task1.html");
  });
});

describe("login.js - Form Validation", () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, "../login.html"), "utf8");
    const js = fs.readFileSync(path.resolve(__dirname, "../login.js"), "utf8");
    dom = new JSDOM(html, { runScripts: "dangerously", url: "http://localhost" });
    window = dom.window;
    document = window.document;

    const scriptEl = document.createElement("script");
    scriptEl.textContent = js;
    document.body.appendChild(scriptEl);
  });

  test("should show error for invalid email on input", () => {
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");

    emailInput.value = "invalid-email";
    emailInput.dispatchEvent(new window.Event("input"));

    expect(emailError.textContent).toContain("valid email");
    expect(emailInput.classList.contains("invalid")).toBe(true);
  });

  test("should clear error for valid email on input", () => {
    const emailInput = document.getElementById("email");
    const emailError = document.getElementById("email-error");

    emailInput.value = "user@example.com";
    emailInput.dispatchEvent(new window.Event("input"));

    expect(emailError.textContent).toBe("");
    expect(emailInput.classList.contains("invalid")).toBe(false);
  });

  test("should show error for short password on input", () => {
    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("password-error");

    passwordInput.value = "abc";
    passwordInput.dispatchEvent(new window.Event("input"));

    expect(passwordError.textContent).toContain("at least 6");
    expect(passwordInput.classList.contains("invalid")).toBe(true);
  });

  test("should clear error for valid password on input", () => {
    const passwordInput = document.getElementById("password");
    const passwordError = document.getElementById("password-error");

    passwordInput.value = "securepass";
    passwordInput.dispatchEvent(new window.Event("input"));

    expect(passwordError.textContent).toBe("");
    expect(passwordInput.classList.contains("invalid")).toBe(false);
  });

  test("should prevent submission with empty fields", () => {
    const form = document.getElementById("login-form");
    const emailError = document.getElementById("email-error");
    const passwordError = document.getElementById("password-error");

    form.dispatchEvent(new window.Event("submit"));

    expect(emailError.textContent).toContain("required");
    expect(passwordError.textContent).toContain("required");
  });

  test("should show success alert on valid submission", () => {
    const form = document.getElementById("login-form");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    let alertMessage = "";
    window.alert = (msg) => { alertMessage = msg; };

    emailInput.value = "user@example.com";
    passwordInput.value = "securepass";
    form.dispatchEvent(new window.Event("submit"));

    expect(alertMessage).toContain("Login successful");
  });
});

describe("CSS files exist and are valid", () => {
  test("task1.css should exist", () => {
    const cssPath = path.resolve(__dirname, "../task1.css");
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  test("login.css should exist", () => {
    const cssPath = path.resolve(__dirname, "../login.css");
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  test("task1.css should not have syntax errors (stray characters)", () => {
    const css = fs.readFileSync(path.resolve(__dirname, "../task1.css"), "utf8");
    const lines = css.split("\n");
    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.endsWith("/ ") || trimmed === "/") {
        throw new Error(`Stray '/' found on line ${idx + 1}`);
      }
    });
  });
});
