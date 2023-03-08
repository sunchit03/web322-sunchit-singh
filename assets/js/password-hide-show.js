function checkPassword() {
    let check = document.getElementById("password");
    let eye = document.getElementById("eye");
    if (check.type === "password") {
        check.type = "text";
        eye.classList = 'fa fa-eye eye-icon'
    } else {
        check.type = "password";
        eye.classList = 'fa fa-eye-slash eye-icon'
    }
}