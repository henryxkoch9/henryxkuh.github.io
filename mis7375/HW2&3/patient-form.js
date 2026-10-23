//    Name: Henry Koch  
//    File: patient-form.js
//    Date Created: 2026-10-21
//    Date Updated: 2026-10-22
//    Purpose: MIS 7375 Homework 2 and 3 - making a review button and changing the validation for the patient registration form.

document.addEventListener("DOMContentLoaded", function () {
    const todayDisplay = document.getElementById("today");
    if (todayDisplay) {
        todayDisplay.textContent = new Date().toLocaleDateString();
    }

    const form = document.getElementById("patient-form");
    const dob = document.getElementById("dob");
    const reviewButton = document.getElementById("reviewBtn");
    const reviewPanel = document.getElementById("reviewPanel");
    const reviewContent = document.getElementById("reviewContent");
    const userId = document.getElementById("userId");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const healthRating = document.getElementById("healthRating");
    const healthRatingValue = document.getElementById("healthRatingValue");
    const today = new Date();

    if (dob) {
        dob.max = toISODate(today);
        const minDate = new Date(today);
        minDate.setFullYear(minDate.getFullYear() - 120);
        dob.min = toISODate(minDate);
    }

    if (healthRating && healthRatingValue) {
        const updateHealthRating = function () {
            healthRatingValue.textContent = healthRating.value;
        };
        updateHealthRating();
        healthRating.addEventListener("input", updateHealthRating);
    }

    if (userId) {
        userId.addEventListener("input", function () {
            userId.value = userId.value.toLowerCase();
            refreshPasswordValidation();
        });
    }

    function refreshPasswordValidation() {
        if (!password || !confirmPassword) {
            return;
        }

        const passwordValue = password.value;
        const confirmValue = confirmPassword.value;
        const hasEnoughLength = passwordValue.length >= 8 && passwordValue.length <= 30;
        const hasUpper = /[A-Z]/.test(passwordValue);
        const hasLower = /[a-z]/.test(passwordValue);
        const hasNumber = /\d/.test(passwordValue);
        const hasSpecial = /[^A-Za-z0-9]/.test(passwordValue);
        const noQuotes = !/["']/.test(passwordValue);
        const userIdValue = userId ? userId.value.toLowerCase() : "";

        if (passwordValue && (!hasEnoughLength || !hasUpper || !hasLower || !hasNumber || !hasSpecial || !noQuotes)) {
            password.setCustomValidity("Use 8 to 30 characters with uppercase, lowercase, a number, and a special character; quotes are not allowed.");
        } else if (userIdValue && passwordValue && passwordValue.toLowerCase().includes(userIdValue)) {
            password.setCustomValidity("Password cannot contain your User ID.");
        } else {
            password.setCustomValidity("");
        }

        if (confirmValue && passwordValue && confirmValue !== passwordValue) {
            confirmPassword.setCustomValidity("Passwords do not match.");
        } else if (passwordValue && !confirmValue) {
            confirmPassword.setCustomValidity("Please re-enter your password.");
        } else {
            confirmPassword.setCustomValidity("");
        }
    }

    if (password) {
        password.addEventListener("input", refreshPasswordValidation);
    }

    if (confirmPassword) {
        confirmPassword.addEventListener("input", refreshPasswordValidation);
    }

    if (reviewButton) {
        reviewButton.addEventListener("click", function () {
            refreshPasswordValidation();
            reviewContent.replaceChildren(buildReview());
            reviewPanel.hidden = false;
            reviewPanel.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    if (form) {
        form.addEventListener("input", handleFieldEvent);
        form.addEventListener("change", handleFieldEvent);
        form.addEventListener("blur", handleFieldEvent, true);

        form.addEventListener("submit", function (event) {
            refreshPasswordValidation();
            showFormErrors();
            if (!form.checkValidity()) {
                event.preventDefault();
                form.reportValidity();
            }
        });

        form.addEventListener("reset", function () {
            window.setTimeout(function () {
                reviewPanel.hidden = true;
                refreshPasswordValidation();
            }, 0);
        });
    }

    function handleFieldEvent(event) {
        const field = event.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) {
            return;
        }
        if (["button", "submit", "reset"].includes(field.type)) {
            return;
        }

        refreshPasswordValidation();
        if (field.type === "radio") {
            const group = form.querySelector('input[type="radio"][name="' + field.name + '"]');
            if (group) {
                showFieldError(group, radioError(field.name, radioLabel(field.name)));
            }
            return;
        }

        showFieldError(field, fieldError(field.id, fieldLabel(field)));
    }

    function showFormErrors() {
        const shownRadioGroups = new Set();
        form.querySelectorAll("input, select, textarea").forEach(function (field) {
            if (["button", "submit", "reset"].includes(field.type)) {
                return;
            }
            if (field.type === "radio") {
                if (shownRadioGroups.has(field.name)) {
                    return;
                }
                shownRadioGroups.add(field.name);
                showFieldError(field, radioError(field.name, radioLabel(field.name)));
                return;
            }
            showFieldError(field, fieldError(field.id, fieldLabel(field)));
        });
    }

    function showFieldError(field, message) {
        const feedbackKey = field.type === "radio" ? "radio:" + field.name : field.id;
        const container = field.closest("td") || field.parentElement;
        let feedback = Array.from(container.querySelectorAll("[data-validation-for]"))
            .find(function (item) {
                return item.dataset.validationFor === feedbackKey;
            });

        if (!feedback) {
            feedback = document.createElement("small");
            feedback.className = "field-feedback";
            feedback.dataset.validationFor = feedbackKey;
            feedback.setAttribute("aria-live", "polite");
            container.appendChild(feedback);
        }

        feedback.textContent = message;
        feedback.hidden = !message;
        if (field.type !== "radio") {
            if (message) {
                field.setAttribute("aria-invalid", "true");
            } else {
                field.removeAttribute("aria-invalid");
            }
        }
    }

    function fieldLabel(field) {
        const label = field.id ? document.querySelector('label[for="' + field.id + '"]') : null;
        const text = label ? label.textContent.trim().replace(/[,.:]+$/, "") : "";
        return text || field.name || "this field";
    }

    function radioLabel(name) {
        const label = document.querySelector('label[for="' + name + '"]');
        return label ? label.textContent.trim() : name;
    }

    function buildReview() {
        const container = document.createElement("div");
        const personalTable = createReviewTable();
        const firstName = getValue("firstname");
        const middleInitial = getValue("middleinit");
        const lastName = getValue("lastname");
        const fullName = [firstName, middleInitial, lastName].filter(Boolean).join(" ") || "Not provided";
        const nameErrors = [
            reviewFieldError("firstname", "first name"),
            reviewFieldError("lastname", "last name")
        ].filter(Boolean);

        addReviewRow(personalTable, "First, MI, Last Name", fullName, nameErrors);
        addReviewRow(personalTable, "Date of Birth", formatDate(getValue("dob")), reviewFieldError("dob", "date of birth"));
        addReviewRow(personalTable, "Gender", radioValue("gender"), reviewRadioError("gender"));
        addReviewRow(personalTable, "Social Security number", maskedSocialSecurity(), reviewFieldError("social_security", "Social Security number"));
        addReviewRow(personalTable, "Email address", getValue("email"), reviewFieldError("email", "email address"));
        addReviewRow(personalTable, "Phone number", getValue("phone"), reviewFieldError("phone", "phone number"));

        const address = [
            getValue("addr1"),
            getValue("addr2"),
            [getValue("city"), selectValue("state"), getValue("zip")].filter(Boolean).join(", ")
        ].filter(Boolean).join("\n");
        const addressErrors = [
            reviewFieldError("addr1", "Address"),
            reviewFieldError("addr2", "Address Line 2"),
            reviewFieldError("city", "city"),
            reviewFieldError("state", "state"),
            reviewFieldError("zip", "ZIP code")
        ].filter(Boolean);
        addReviewRow(personalTable, "Address", address, addressErrors);
        container.appendChild(personalTable);

        const requestedTable = createReviewTable();
        document.querySelectorAll('input[name="conditions"]').forEach(function (condition) {
            addReviewRow(requestedTable, condition.value, condition.checked ? "Y" : "N", []);
        });
        addReviewRow(requestedTable, "Vaccinated?", radioValue("vaccinated"), reviewRadioError("vaccinated"));
        addReviewRow(requestedTable, "Health insurance?", radioValue("insurance"), reviewRadioError("insurance"));
        addReviewRow(requestedTable, "Health rating", getValue("healthRating") + " / 10", []);
        addReviewRow(requestedTable, "Described Symptoms", getValue("symptoms"), []);
        container.appendChild(requestedTable);

        const accountTable = createReviewTable();
        addReviewRow(accountTable, "User ID", getValue("userId"), reviewUserIdError());
        const passwordErrors = [
            reviewFieldError("password", "password"),
            reviewFieldError("confirmPassword", "password confirmation")
        ].filter(Boolean);
        addReviewRow(accountTable, "Password", password && password.value ? "Hidden for security" : "Not provided", passwordErrors);
        container.appendChild(accountTable);

        return container;
    }

    function createReviewTable() {
        const table = document.createElement("table");
        table.className = "review-grid";
        table.appendChild(document.createElement("tbody"));
        return table;
    }

    function addReviewRow(table, label, value, errors) {
        const row = document.createElement("tr");
        const heading = document.createElement("th");
        const valueCell = document.createElement("td");
        const statusCell = document.createElement("td");
        const status = document.createElement("span");
        const valueText = value || "Not provided";
        const errorList = Array.isArray(errors) ? errors : errors ? [errors] : [];

        heading.textContent = label;
        valueCell.textContent = valueText;
        valueCell.className = "review-value";
        status.textContent = errorList.length
            ? errorList.map(formatReviewError).join("; ")
            : "Valid";
        status.className = errorList.length ? "review-error" : "review-pass";
        statusCell.appendChild(status);
        row.append(heading, valueCell, statusCell);
        table.querySelector("tbody").appendChild(row);
    }

    function formatReviewError(message) {
        return message.replace(/^ERROR:\s*/i, "").replace(/[.]+$/, "");
    }

    function fieldError(id, label) {
        const field = document.getElementById(id);
        if (!field) {
            return "";
        }
        if (id === "userId") {
            return userIdError();
        }
        if (field.validity.customError) {
            return field.validationMessage;
        }
        if (field.validity.valueMissing) {
            return requiredFieldMessage(id, label);
        }
        if (field.validity.rangeUnderflow) {
            return "Cannot be more than 120 years ago";
        }
        if (field.validity.rangeOverflow) {
            return "Cannot be in the future";
        }
        if (field.validity.tooLong) {
            return "Enter no more than " + field.maxLength + " characters.";
        }
        if (field.validity.tooShort) {
            return "Enter at least " + field.minLength + " characters.";
        }
        if (field.validity.badInput) {
            return "Enter a valid " + label.toLowerCase() + ".";
        }
        if (field.validity.patternMismatch || field.validity.typeMismatch) {
            return field.title || "Invalid " + label.toLowerCase() + ".";
        }
        return "";
    }

    function reviewFieldError(id, subject) {
        const field = document.getElementById(id);
        if (!field || field.validity.valid) {
            return "";
        }
        if (field.validity.valueMissing) {
            return "Missing " + subject + ".";
        }
        if (field.validity.rangeUnderflow) {
            return "Date of birth is earlier than the allowed range.";
        }
        if (field.validity.rangeOverflow) {
            return "Date of birth cannot be in the future.";
        }
        if (field.validity.tooShort) {
            return subject + " must be at least " + field.minLength + " characters.";
        }
        if (field.validity.tooLong) {
            return subject + " cannot exceed " + field.maxLength + " characters.";
        }
        if (field.validity.customError) {
            return field.validationMessage;
        }
        if (id === "dob") {
            return "Enter a valid date of birth.";
        }
        if (id === "email") {
            return "Enter a valid email address.";
        }
        if (id === "zip") {
            return "Enter a 5-digit ZIP code or ZIP+4.";
        }
        if (id === "phone") {
            return "Enter the phone number as 000-000-0000.";
        }
        if (id === "social_security") {
            return "Enter a 9-digit Social Security number.";
        }
        return "Check the " + subject + " format.";
    }

    function reviewUserIdError() {
        const value = userId ? userId.value : "";
        if (!value) {
            return "Missing User ID.";
        }
        if (value.length < 5) {
            return "User ID must be at least 5 characters.";
        }
        if (value.length > 20) {
            return "User ID cannot exceed 20 characters.";
        }
        if (/^\d/.test(value)) {
            return "User ID cannot start with a number.";
        }
        if (!/^[A-Za-z]/.test(value)) {
            return "User ID must start with a letter.";
        }
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) {
            return "User ID may contain only letters, numbers, dashes, and underscores.";
        }
        return "";
    }

    function reviewRadioError(name) {
        if (radioValue(name)) {
            return "";
        }
        const messages = {
            gender: "Missing gender selection.",
            vaccinated: "Missing vaccination status.",
            insurance: "Missing health insurance selection."
        };
        return messages[name] || "Missing selection.";
    }

    function userIdError() {
        const value = userId ? userId.value : "";
        if (!value) {
            return "Please enter a user ID.";
        }
        if (value.length < 5) {
            return "User ID must be at least 5 characters.";
        }
        if (value.length > 20) {
            return "User ID cannot be longer than 20 characters.";
        }
        if (/^\d/.test(value)) {
            return "User ID must start with a letter, not a number.";
        }
        if (!/^[A-Za-z]/.test(value)) {
            return "User ID must start with a letter.";
        }
        if (!/^[A-Za-z][A-Za-z0-9_-]*$/.test(value)) {
            return "Use only letters, numbers, dashes, and underscores. Spaces and other special characters are not allowed.";
        }
        return "";
    }

    function radioError(name, label) {
        const option = document.querySelector('input[name="' + name + '"]');
        if (!option || !option.required || radioValue(name)) {
            return "";
        }
        const messages = {
            gender: "Please select a gender option.",
            vaccinated: "Please indicate whether your vaccinations are up to date.",
            insurance: "Please indicate whether you have health insurance."
        };
        return messages[name] || "Please select an option for " + label.toLowerCase() + ".";
    }

    function requiredFieldMessage(id, label) {
        const messages = {
            firstname: "Please enter your first name.",
            lastname: "Please enter your last name.",
            social_security: "Please enter your Social Security number.",
            dob: "Please enter your date of birth.",
            email: "Please enter your email address.",
            addr1: "Please enter your address.",
            city: "Please enter your city.",
            state: "Please select your state.",
            zip: "Please enter your ZIP code.",
            phone: "Please enter your phone number.",
            userId: "Please enter a user ID.",
            password: "Please enter a password.",
            confirmPassword: "Please re-enter your password."
        };
        return messages[id] || "Please enter " + label.toLowerCase() + ".";
    }

    function getValue(id) {
        const field = document.getElementById(id);
        return field ? field.value.trim() : "";
    }

    function selectValue(id) {
        const field = document.getElementById(id);
        return field && field.value ? field.value : "";
    }

    function radioValue(name) {
        const selected = document.querySelector('input[name="' + name + '"]:checked');
        return selected ? selected.value : "";
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }
        const parts = value.split("-");
        return parts.length === 3 ? parts[1] + "/" + parts[2] + "/" + parts[0] : value;
    }

    function maskedSocialSecurity() {
        const value = getValue("social_security");
        return value.length === 11 ? "***-**-" + value.slice(-4) : value ? "Hidden for security" : "";
    }

    function toISODate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }
});
