window.onload = (event) => {
    let starRatings = document.getElementsByClassName("rating-stars");
    for (let i = 0; i < starRatings.length; i++) {
        let stars = parseFloat(starRatings[i].innerText);
        starRatings[i].innerText = "";
        let isHalf = false;
        for (let j = 0; j < Math.floor(stars); j++) {
            starRatings[i].innerHTML += `<span class="material-icons">
            star
            </span>`;
        }
        if (stars % 1 !== 0) {
            starRatings[i].innerHTML += `<span class="material-symbols-outlined">star_half</span>`; // half star icon
            isHalf = true;
        }
        for (let k = isHalf ? Math.ceil(stars) : Math.floor(stars); k < 5; k++) {
            starRatings[i].innerHTML += `<span class="material-symbols-outlined">star</span>`; // empty star icon
        }
    }
};