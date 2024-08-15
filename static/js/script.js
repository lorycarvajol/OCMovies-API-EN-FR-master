document.addEventListener("DOMContentLoaded", () => {
    const API_URL = "http://localhost:8000/api/v1/";

    // Fonction pour récupérer les films par catégorie
    const fetchMovies = async (category, callback) => {
        let url = `${API_URL}titles/?sort_by=-imdb_score&page_size=40`;
        if (category) {
            url += `&genre=${category}`;
        }
        const response = await fetch(url);
        const data = await response.json();
        callback(data.results);
    };

    // Fonction pour récupérer le film avec le meilleur score IMDb
    const fetchBestMovie = async () => {
        const response = await fetch(`${API_URL}titles/?sort_by=-imdb_score&page_size=1`);
        const data = await response.json();
        return data.results[0];
    };

    // Fonction pour récupérer les détails d'un film
    const fetchMovieDetails = async (id) => {
        const response = await fetch(`${API_URL}titles/${id}`);
        return await response.json();
    };

    // Fonction pour créer un élément de film
    const createMovieElement = (movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        // URL de l'image par défaut si l'image du film est manquante
        const defaultImageUrl = "{% static 'images/no_image_available.png' %}"; // Assurez-vous d'avoir cette image dans le dossier static

        movieElement.innerHTML = `
            <img src="${movie.image_url || defaultImageUrl}" alt="${movie.title}" onerror="this.src='${defaultImageUrl}'" />
            <p class="movie-title">${movie.title}</p>`;
        movieElement.addEventListener("click", () => showModal(movie.id));
        return movieElement;
    };

    // Fonction pour afficher les détails du film dans une modale
    const showModal = async (id) => {
        const movie = await fetchMovieDetails(id);
        const modal = document.getElementById("modal");
        const modalDetails = document.getElementById("modal-details");

        // URL de l'image par défaut si l'image du film est manquante
        const defaultImageUrl = "{% static 'images/no_image_available.png' %}";

        modalDetails.innerHTML = `
            <div class="modal-header">
                <h2>${movie.title}</h2>
            </div>
            <div class="modal-body">
                <div class="left-column">
                    <img src="${movie.image_url || defaultImageUrl}" alt="${movie.title}" onerror="this.src='${defaultImageUrl}'" />
                    <p>${movie.description}</p>
                </div>
                <div class="right-column">
                    <ul>
                        <li><strong>Genre: </strong> ${movie.genres.join(", ")}</li>
                        <li><strong>Date de sortie: </strong> ${movie.date_published}</li>
                        <li><strong>Rated: </strong> ${movie.rated}</li>
                        <li><strong>Score Imdb: </strong> ${movie.imdb_score}</li>
                        <li><strong>Réalisateur: </strong> ${movie.directors.join(", ")}</li>
                        <li><strong>Acteurs: </strong> ${movie.actors.join(", ")}</li>
                        <li><strong>Durée: </strong> ${movie.duration} minutes</li>
                        <li><strong>Pays d'origine: </strong> ${movie.countries.join(", ")}</li>
                        <li><strong>Box Office: </strong> ${movie.worldwide_gross_income || 'N/A'}</li>
                    </ul>
                </div>
            </div>
        `;
        modal.style.display = "block";
    };

    // Fonction pour fermer la modale
    const closeModal = () => {
        const modal = document.getElementById("modal");
        modal.style.display = "none";
    };

    document.querySelector(".close").addEventListener("click", closeModal);
    window.addEventListener("click", (event) => {
        const modal = document.getElementById("modal");
        if (event.target === modal) {
            closeModal();
        }
    });

    // Fonction pour gérer le défilement des films
    const slideMovies = (containerId, direction) => {
        const container = document.getElementById(containerId);
        const movies = container.querySelectorAll(".movie");
        const firstVisibleIndex = parseInt(container.getAttribute("data-first-index"), 10);
        const totalMovies = movies.length;
        let newFirstVisibleIndex;

        if (direction === "right") {
            newFirstVisibleIndex = (firstVisibleIndex + 7) % totalMovies;
        } else {
            newFirstVisibleIndex = (firstVisibleIndex - 7 + totalMovies) % totalMovies;
        }

        container.setAttribute("data-first-index", newFirstVisibleIndex);
        movies.forEach((movie, index) => {
            movie.style.display = (index >= newFirstVisibleIndex && index < newFirstVisibleIndex + 7) ? "block" : "none";
        });
    };

    // Fonction pour configurer les boutons de défilement
    const setupScrollButtons = () => {
        document.getElementById("scroll-left-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "left"));
        document.getElementById("scroll-right-top-rated").addEventListener("click", () => slideMovies("top-rated-movies", "right"));
        document.getElementById("scroll-left-category1").addEventListener("click", () => slideMovies("category1-movies", "left"));
        document.getElementById("scroll-right-category1").addEventListener("click", () => slideMovies("category1-movies", "right"));
        document.getElementById("scroll-left-category2").addEventListener("click", () => slideMovies("category2-movies", "left"));
        document.getElementById("scroll-right-category2").addEventListener("click", () => slideMovies("category2-movies", "right"));
        document.getElementById("scroll-left-category3").addEventListener("click", () => slideMovies("category3-movies", "left"));
        document.getElementById("scroll-right-category3").addEventListener("click", () => slideMovies("category3-movies", "right"));
    };

    // Fonction pour exclure un film spécifique de la liste des résultats
    const excludeMovie = (movies, title) => {
        return movies.filter(movie => movie.title !== title);
    };

    // Fonction pour charger les films et mettre à jour la section du film vedette
    const loadMovies = async () => {
        // Récupère le meilleur film et met à jour la section du film vedette
        const bestMovie = await fetchBestMovie();
        const bestMovieDetails = await fetchMovieDetails(bestMovie.id);
        const bestMovieSection = document.getElementById("best-movie-image");
        bestMovieSection.style.backgroundImage = `url(${bestMovieDetails.image_url || '{% static "images/no_image_available.png" %}'})`;

        document.getElementById("best-movie-title").innerText = bestMovieDetails.title;
        document.getElementById("best-movie-summary").innerText = bestMovieDetails.description;
        document.getElementById("more-info-button").addEventListener("click", () => showModal(bestMovieDetails.id));

        // Affiche les films les mieux notés toutes catégories confondues
        fetchMovies(null, (movies) => {
            const section = document.getElementById("top-rated-movies");
            section.setAttribute("data-first-index", "0");
            movies.forEach(movie => section.appendChild(createMovieElement(movie)));
            slideMovies("top-rated-movies", "right");
        });

        // Catégories de films à afficher
        const categories = ["Adventure", "Animation", "Biography"];
        const sections = ["category1-movies", "category2-movies", "category3-movies"];

        // Récupère et affiche les films pour chaque catégorie
        categories.forEach((category, index) => {
            fetchMovies(category, (movies) => {
                const section = document.getElementById(sections[index]);
                section.setAttribute("data-first-index", "0");
                movies.forEach(movie => section.appendChild(createMovieElement(movie)));
                slideMovies(sections[index], "right");
            });
        });

        // Configure les boutons de défilement
        setupScrollButtons();
    };

    // Gestion de l'indicateur de défilement vers le bas
    const scrollDownIndicator = document.getElementById("scroll-down-indicator");

    // Affiche ou masque l'indicateur de défilement en fonction de la position de défilement
    window.addEventListener("scroll", () => {
        if (window.scrollY > 0) {
            scrollDownIndicator.style.display = "none";
        } else {
            scrollDownIndicator.style.display = "block";
        }
    });

    // Fait défiler la page vers le bas lorsqu'on clique sur l'indicateur de défilement
    scrollDownIndicator.addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: 'smooth'
        });
    });

    // Charge les films au démarrage
    loadMovies();
});
