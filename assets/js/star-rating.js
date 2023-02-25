window.onload = (event) => {
    let starRatings = document.getElementsByClassName("rating-stars");
    for (let i = 0; i < starRatings.length; i++) {
        let stars = parseFloat(starRatings[i].innerText);
        starRatings[i].innerText = "";
        for (let j = 0; j < Math.floor(stars); j++) {
            starRatings[i].innerHTML += `<i class="fa fa-star"></i>`;
        }
        if (stars % 1 != 0) {
            stars = stars % 1;
            if (stars >= 0.3 && stars <= 0.701) {
                starRatings[i].innerHTML += `<i class="fa fa-star-half"></i>`
            } else if (stars >= 0.701) {
                starRatings[i].innerHTML += `<i class="fa fa-star"></i>`;
            }
        }
    }
};