export function showCustomToast(message) {
    var customToast = document.getElementById("customToast");
    var toastMessage = document.getElementById("toastMessage");

    toastMessage.textContent = message;

    customToast.style.display = "block";
    customToast.classList.add("show");

    setTimeout(function () {
        closeCustomToast();
    }, 3000);
}

export function closeCustomToast() {
    var customToast = document.getElementById("customToast");
    customToast.classList.remove("show");
    customToast.classList.add("hide");

    // Hide the toast after the animation completes
    setTimeout(function () {
        customToast.style.display = "none";
        customToast.classList.remove("hide");
    }, 500);
}