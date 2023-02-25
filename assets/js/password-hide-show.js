function checkPassword() {
    let check = document.getElementById("password");
    let eye = document.getElementById("eye");
    if (check.type === "password") {
        check.type = "text";
        eye.innerHTML = '<i class="fa fa-eye"></i>'
    } else {
        check.type = "password";
        eye.innerHTML = '<i class="fa fa-eye-slash"></i>'
    }
}