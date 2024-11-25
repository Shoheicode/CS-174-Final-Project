function toggleForm(type) {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const signinToggle = document.getElementById('signin-toggle');
    const signupToggle = document.getElementById('signup-toggle');

    if (type === 'signin') {
        signinForm.style.display = 'block';
        signupForm.style.display = 'none';
        signinToggle.classList.add('active');
        signupToggle.classList.remove('active');
    } else {
        signinForm.style.display = 'none';
        signupForm.style.display = 'block';
        signinToggle.classList.remove('active');
        signupToggle.classList.add('active');
    }
}

export {toggleForm}