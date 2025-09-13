
// Signup form functionality
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAccepted = document.getElementById('terms').checked;
    
    // Clear previous error messages
    clearErrors();
    
    // Validation
    let hasErrors = false;
    
    if (fullName.length < 2) {
        showError('fullName', 'Full name must be at least 2 characters long');
        hasErrors = true;
    }
    
    if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        hasErrors = true;
    }
    
    if (password.length < 6) {
        showError('password', 'Password must be at least 6 characters long');
        hasErrors = true;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPassword', 'Passwords do not match');
        hasErrors = true;
    }
    
    if (!termsAccepted) {
        showError('terms', 'You must agree to the terms and conditions');
        hasErrors = true;
    }
    
    // If no errors, proceed with signup
    if (!hasErrors) {
        processSignup(fullName, email, password);
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const formGroup = field.closest('.form-group');
    
    // Create error message element if it doesn't exist
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    field.style.borderColor = '#e74c3c';
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.style.display = 'none');
    
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => input.style.borderColor = '');
}

function processSignup(fullName, email, password) {
    // Simulate signup process
    const submitBtn = document.querySelector('.signup-btn');
    submitBtn.textContent = 'Creating Account...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Store user data in localStorage (in a real app, this would be sent to a server)
        const userData = {
            fullName: fullName,
            email: email,
            signupDate: new Date().toISOString()
        };
        
        localStorage.setItem('smartspend_user', JSON.stringify(userData));
        
        // Show success message
        showSuccessMessage('Account created successfully! Redirecting to SmartSpend...');
        
        // Redirect to main app after 2 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    }, 1500);
}

function showSuccessMessage(message) {
    // Create success message element
    let successElement = document.querySelector('.success-message');
    if (!successElement) {
        successElement = document.createElement('div');
        successElement.className = 'success-message';
        document.querySelector('.signup-form').insertBefore(successElement, document.querySelector('.signup-form').firstChild);
    }
    
    successElement.textContent = message;
    successElement.style.display = 'block';
}

// Real-time validation
document.getElementById('email').addEventListener('input', function() {
    const email = this.value.trim();
    if (email && !isValidEmail(email)) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = '';
    }
});

document.getElementById('confirmPassword').addEventListener('input', function() {
    const password = document.getElementById('password').value;
    const confirmPassword = this.value;
    
    if (confirmPassword && password !== confirmPassword) {
        this.style.borderColor = '#e74c3c';
    } else {
        this.style.borderColor = '';
    }
});
