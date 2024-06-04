/* -----------------------TEORIA-----------------------
 Un'API (Application Programming Interface) è un insieme di definizioni, protocolli e strumenti che permette a diverse applicazioni software di comunicare tra loro. 
 Le API definiscono i metodi e i dati che le applicazioni possono utilizzare per interagire con altre applicazioni, servizi o sistemi.
 Nel codice sono utilizzate per cercare e visualizzare i film accedendo al TMDB 

 async: utilizzata per dichiarare una funzione asincrona. Questa ritorna una Promise cioè un oggetto che rappresenta il completamento o il fallimento di un'operazione
 await: utilizzata nelle funzioni async per metterle in pausa l'esecuzione fino a quando una funzione asincrona viene completata
*/

// Event Listener che si attiva quando viene caricata tutta la pagina
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageNumberSpan = document.getElementById('pageNumber');

    let currentPage = 1; // Variabile per tenere traccia della pagina corrente
    let moviesPerPage = 12; // Numero di film per pagina
    let totalMovies = []; // Array per memorizzare i film totali

    // Caricamento dei film consigliati
    fetchAndDisplayRecommendedMovies();

    // Event Listener che si attiva quando viene premuto il tasto invio sulla searchbar
    searchForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita il comportamento predefinito della searchbar, ad esempio riaggiornare la pagina
        const searchQuery = searchInput.value.trim(); 

        // Controlla se searchQuery contiene un valore non vuoto
        if (searchQuery) {
            const movies = await fetchMovies(searchQuery); // Ricerca dei film
            totalMovies = movies; // Salva i film trovati nell'array totale
            currentPage = 1; 
            updatePagination();
            displayResults(movies.slice(0, moviesPerPage)); // Mostra i risultati della prima pagina
        } else {
            resultsDiv.innerHTML = '';
            fetchAndDisplayRecommendedMovies(); // Carica e mostra i film consigliati
        }
    });

    // Event Listener per i pulsanti di paginazione
    prevPageButton.addEventListener('click', () => changePage(-1));
    nextPageButton.addEventListener('click', () => changePage(1));

    // Funzione per cercare i film 
    async function fetchMovies(query) {
        const apiKey = '801056529bee61b32d6106f6327cb8f4';
        const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        const movies = [];

        try {
            const response = await fetch(apiUrl); // Richiesta HTTP get
            const data = await response.json(); // Legge il corpo della risposta HTTP
            if (data.results && data.results.length > 0) {
                movies.push(...data.results); // Aggiunta dei risultati all'array di film
            } else {
                console.log('No results found');
            }
        } catch (error) {
            console.error('Error fetching movie data:', error);
        }

        return movies;
    }

    // Funzione per visualizzare i risultati dei film
    function displayResults(movies) {
        resultsDiv.innerHTML = ''; 
        if (movies.length > 0) {
            const rows = chunkArray(movies, 4); // Dividi i film in righe di 4
            rows.forEach(row => {
                const rowContainer = document.createElement('div');
                rowContainer.style.display = 'flex';
                rowContainer.style.flexWrap = 'wrap';
                rowContainer.style.justifyContent = 'center';
                rowContainer.style.margin = '20px 0px';

                row.forEach(movie => {
                    // Controlla se esiste l'immagine del film
                    if (movie.poster_path) {
                        const listItem = document.createElement('div');
                        listItem.classList.add('movie-item');

                        listItem.innerHTML = `
                            <div class="container">
                                <div class="row">
                                    <div class="col-3">
                                        <center>
                                            <section class="u-align-center u-black u-clearfix u-section-3">
                                                <div class="u-clearfix u-sheet u-sheet-1">
                                                    <div class="u-expanded-width u-list u-list-1">
                                                        <div class="u-repeater u-repeater-1">
                                                            <div class="u-align-center pointer u-container-style u-custom-item u-image u-image-default u-list-item u-repeater-item u-shape-round u-image-1" style="position: relative; max-width: 200px;">
                                                                <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" class="movie-poster" style="width: 100%;" data-imdbid="${movie.id}" onerror="this.src='fallback-image.jpg'; this.onerror=null;" alt="${movie.title} Poster">
                                                                <div class="movie-title"><h4 class="u-align-center u-hover-feature u-text u-text-body-alt-color u-text-14 text">${movie.title}</h4></div> 
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </section>
                                        </center>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Evento di click per reindirizzare alla pagina di descrizione
                        listItem.addEventListener('click', function () {
                            const tmdbID = this.querySelector('img').getAttribute('data-imdbid');
                            fetchMovieDetails(tmdbID);
                        });
                        rowContainer.appendChild(listItem); // Aggiunta del film alla riga
                    }
                });
                resultsDiv.appendChild(rowContainer); // Aggiunta della riga al div
            });
        } else {
            showNoResultsMessage(); // Mostra il messaggio di nessun risultato
        }
    }

    // Funzione per porzionare ogni riga in 4 colonne
    function chunkArray(arr, size) {
        // chucks = accumulatore delle porzioni   item = l'elemento dell'array  i = indice dell'eleemnto
        return arr.reduce((chunks, item, i) => {
            // Contollo se è il contatore è multiplo di 4 
            if (i % size === 0) {
                chunks.push([item]); // Inizia una nuova porzione
            } else {
                chunks[chunks.length - 1].push(item); // Aggiunge l'elemento alla porzione corrente
            }
            return chunks;
        }, []);
    }

    // Funzione per mostrare il messaggio di nessun risultato
    function showNoResultsMessage() {
        resultsDiv.innerHTML = '';
        var icon = document.createElement('img');
        icon.src = 'images/notFound.png';
        icon.alt = 'No results found';
        var message = document.createElement('p');
        message.textContent = 'No results found';
        message.style.color = 'white';
        resultsDiv.appendChild(icon);
        resultsDiv.appendChild(message);
    }

    // Funzione per cercare e visualizzare i film consigliati
    async function fetchAndDisplayRecommendedMovies() {
        try {
            const popularMovies = await fetchPopularMovies();
            totalMovies = popularMovies; // Salva i film popolari nell'array totale
            currentPage = 1; 
            updatePagination(); 
            displayResults(popularMovies.slice(0, moviesPerPage)); // Mostra i risultati della prima pagina
        } catch (error) {
            console.error('Error fetching and displaying popular movies:', error);
        }
    }

    // Funzione per cercare i film popolari 
    async function fetchPopularMovies() {
        const apiKey = '801056529bee61b32d6106f6327cb8f4';
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
        try {
            const response = await fetch(apiUrl); // Richiesta HTTP get
            const data = await response.json();  // Legge il corpo della risposta HTTP
            return data.results; 
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return [];
        }
    }

    // Funzione per aggiornare la paginazione
    function updatePagination() {
        const totalPages = Math.ceil(totalMovies.length / moviesPerPage);
        pageNumberSpan.textContent = currentPage;
        prevPageButton.disabled = currentPage === 1;
        nextPageButton.disabled = currentPage === totalPages;
    }

    // Funzione per cambiare pagina
    function changePage(direction) {
        const totalPages = Math.ceil(totalMovies.length / moviesPerPage);
        currentPage += direction; // Aggiorna la pagina corrente
        currentPage = Math.max(1, Math.min(currentPage, totalPages)); // Assicura che la pagina corrente sia valida
        const start = (currentPage - 1) * moviesPerPage;
        const end = start + moviesPerPage;
        displayResults(totalMovies.slice(start, end)); // Mostra i risultati della nuova pagina
        updatePagination(); // Aggiorna la paginazione
    }

    // Event Listener per il bottone di film casuali
    const randomMoviesButton = document.getElementById('randomMoviesButton');
    randomMoviesButton.addEventListener('click', async () => {
        try {
            const randomMovies = await fetchRandomMovies(); // Funzione per recuperare film casuali
            totalMovies = randomMovies; // Salva i film casuali nell'array totale
            currentPage = 1;
            updatePagination();
            displayResults(randomMovies.slice(0, moviesPerPage)); // Mostra i risultati della prima pagina
        } catch (error) {
            console.error('Error fetching and displaying random movies:', error);
        }
    });

    // Funzione per recuperare film casuali
    async function fetchRandomMovies() {
        const apiKey = '801056529bee61b32d6106f6327cb8f4';
        const totalPages = 500; // Limite massimo consentito di pagine
        const randomPage = Math.floor(Math.random() * totalPages) + 1; // Genera un numero casuale tra 1 e totalPages
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc&page=${randomPage}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            // Controlla se i dati sono validi
            if (response.ok && data.results && data.results.length > 0) {
                const randomMovies = data.results;
                return randomMovies;
            } else {
                throw new Error('Invalid data received from API');
            }
        } catch (error) {
            console.error('Error fetching random movies:', error);
            return [];
        }
    }

});


// Funzione per reindirizzare alla pagina di descrizione del film
function fetchMovieDetails(tmdbID) {
    const url = `description.html?tmdbID=${tmdbID}`;
    window.location.href = url;
}
