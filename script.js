/*                                                           -----------------------TEORIA-----------------------
 Un'API (Application Programming Interface) è un insieme di definizioni, protocolli e strumenti che permette a diverse applicazioni software di comunicare tra loro. 
 Le API definiscono i metodi e i dati che le applicazioni possono utilizzare per interagire con altre applicazioni, servizi o sistemi.
 Nel codice sono utilizzate per cercare e visualizzare i film accedendo al TMBD 
 
 async: utilizzata per dichiarare una funzione asincrona. Questa ritorna una Promise cioè un oggetto che rappresenta il completamneto o il fallimento di un operazione
 await: utilizzata nelle funzioni async per metterle in pausa l'esecuzione fino a qunado una funzione asincrona viene completata
*/ 

// Event Listener che si attiva quando viene caricata tutta la pagina
document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('searchInput');
    const resultsDiv = document.getElementById('results');

    // Caricamento dei film consigliati
    fetchAndDisplayRecommendedMovies();

    // Event Listener che si attiva quando viene premuto il tasto invio sulla searchbar
    searchForm.addEventListener('submit', async function (event) {
        event.preventDefault(); // Evita il comportamento predefinito della searchbar ad esempio riaggiornare la pagina
        const searchQuery = searchInput.value.trim(); 

        // Controlla se searchQuery contiene un valore non vuoto
        if (searchQuery) {
            const movies = await fetchMovies(searchQuery); // Ricerca film
            displayResults(movies); // Mostra Film
        } else {
            resultsDiv.innerHTML = '';
            fetchAndDisplayRecommendedMovies(); // Ricerca e Mostra i film consigliati
        }
    });

    // Ricerca dei Film con l'API TMDb
    async function fetchMovies(query) {
        const apiKey = '801056529bee61b32d6106f6327cb8f4';
        const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`;
        const movies = [];

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.results && data.results.length > 0) {
                movies.push(...data.results);
            } else {
                console.log('No results found');
            }
        } catch (error) {
            console.error('Error fetching movie data:', error);
        }

        return movies;
    }


    // Funzione per porzionare ogni riga in 4 colonne
    function chunkArray(arr, size) {
        // chucks = accumulatore delle porzioni   item = l'elemento dell'array  i = indice dell'eleemnto
        return arr.reduce((chunks, item, i) => {
            // Contollo se è il contatore è multiplo di 4 
            if (i % size === 0) {
                chunks.push([item]); // Aggiunta dell'item ad un nuovo array chunks
            } else {
                chunks[chunks.length - 1].push(item); // Aggiunta dell'item ad un chunks in costruzione
            }
            return chunks;
        }, []);
    }

    // Funzione per visualizzare i film
    function displayResults(movies) {
        resultsDiv.innerHTML = '';

        // Controlla se ci sono film
        if (movies.length > 0) {
            const rows = chunkArray(movies, 4); // Porziona le righe in 4 colonne
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

                        rowContainer.appendChild(listItem); // Aggiunta dell'film alla riga
                    }
                });
                resultsDiv.appendChild(rowContainer); // Aggiunta della riga al div
            });
        } else {
            showNoResultsMessage(); // Messaggio di errore
        }
    }

    // Funzione per mostrare il messaggio d'errore
    function showNoResultsMessage() {
        resultsDiv.innerHTML = '';
    
        var icon = document.createElement('img');
        icon.src = 'images/notFound.png';
        icon.alt = 'No results found';
    
        var message = document.createElement('p');
        message.textContent = 'Not results found';
        message.style.color = 'white';

        // Aggiunta del'icona e del messaggio al div
        resultsDiv.appendChild(icon);
        resultsDiv.appendChild(message);
    }

    // Ricerca e Visualizzazione dei film consigliati
    async function fetchAndDisplayRecommendedMovies() {
        try {
            const popularMovies = await fetchPopularMovies();
            displayResults(popularMovies);
        } catch (error) {
            console.error('Error fetching and displaying popular movies:', error);
        }
    }

    // Ricerca dei film consigliati
    async function fetchPopularMovies() {
        const apiKey = '801056529bee61b32d6106f6327cb8f4'; // API TMDb
        const apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&sort_by=popularity.desc`;
    
        try {
            const response = await fetch(apiUrl); // Richiesta HTTP get
            const data = await response.json(); // Legge il corpo della risposta HTTP
            return data.results;
        } catch (error) {
            console.error('Error fetching popular movies:', error);
            return [];
        }
    }
});

// Reindirazzamento alla pagina delle descrizioni dei singoli film
function fetchMovieDetails(tmdbID) {
    // URL della pagina description.html con l'ID del film come parametro
    const url = `description.html?tmdbID=${tmdbID}`;
    
    // Reindirizza alla pagina description.html
    window.location.href = url;
}