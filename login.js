document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("login-form");
  var emailInput = document.getElementById("email");
  var passwordInput = document.getElementById("password");
  var emailError = document.getElementById("email-error");
  var passwordError = document.getElementById("password-error");

  function validateEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function validatePassword(password) {
    return password.length >= 6;
  }

  function showError(input, errorEl, message) {
    input.classList.add("invalid");
    errorEl.textContent = message;
  }

  function clearError(input, errorEl) {
    input.classList.remove("invalid");
    errorEl.textContent = "";
  }

  emailInput.addEventListener("input", function () {
    if (emailInput.value && !validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Please enter a valid email address");
    } else {
      clearError(emailInput, emailError);
    }
  });

  passwordInput.addEventListener("input", function () {
    if (passwordInput.value && !validatePassword(passwordInput.value)) {
      showError(passwordInput, passwordError, "Password must be at least 6 characters");
    } else {
      clearError(passwordInput, passwordError);
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var valid = true;

    if (!emailInput.value) {
      showError(emailInput, emailError, "Email is required");
      valid = false;
    } else if (!validateEmail(emailInput.value)) {
      showError(emailInput, emailError, "Please enter a valid email address");
      valid = false;
    } else {
      clearError(emailInput, emailError);
    }

    if (!passwordInput.value) {
      showError(passwordInput, passwordError, "Password is required");
      valid = false;
    } else if (!validatePassword(passwordInput.value)) {
      showError(passwordInput, passwordError, "Password must be at least 6 characters");
      valid = false;
    } else {
      clearError(passwordInput, passwordError);
    }

    if (valid) {
      alert("Login successful! Welcome to Yasooja Beauty.");
    }
  });
});
