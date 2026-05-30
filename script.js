// Seleção de elementos do DOM
const charactersContainer = document.getElementById('characters-container');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const pageInfo = document.getElementById('page-info');
const themeToggle = document.getElementById('theme-toggle');
const randomBtn = document.getElementById('random-btn');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('modal-details');
const closeBtn = document.querySelector('.close-btn');

// Estado da aplicação
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
    name: '',
    status: ''
};

// Função principal para buscar personagens
async function fetchCharacters(page = 1, filters = {}) {
    try {
        charactersContainer.innerHTML = '<div id="loading" style="grid-column: 1/-1; text-align: center; font-size: 1.5rem; color: #00f2ff;">Iniciando varredura dimensional...</div>';
        
        let url = `https://rickandmortyapi.com/api/character/?page=${page}`;
        if (filters.name) url += `&name=${encodeURIComponent(filters.name)}`;
        if (filters.status) url += `&status=${filters.status}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error || !data.results) {
            charactersContainer.innerHTML = `<p class="error-msg" style="grid-column: 1/-1; text-align: center; color: #ff00ff;">Nenhum personagem detectado nesta coordenada.</p>`;
            updatePagination(0);
            return;
        }

        renderCharacters(data.results);
        updatePagination(data.info.pages);
    } catch (error) {
        console.error('Erro ao buscar personagens:', error);
        charactersContainer.innerHTML = `<p class="error-msg" style="grid-column: 1/-1; text-align: center; color: #ff00ff;">Erro na conexão intergaláctica. Tente novamente.</p>`;
    }
}

// Função para renderizar os cards dinamicamente (Requisito obrigatório)
function renderCharacters(characters) {
    charactersContainer.innerHTML = ''; // Limpa o container

    characters.forEach(char => {
        // Criação de elementos via JS (createElement)
        const card = document.createElement('div');
        card.className = 'card';
        
        // Definindo a cor do status
        const statusClass = `status-${char.status.toLowerCase()}`;

        card.innerHTML = `
            <img src="${char.image}" alt="${char.name}">
            <div class="card-info">
                <h2>${char.name}</h2>
                <div class="status-indicator">
                    <span class="status-dot ${statusClass}"></span>
                    <span class="status-text">${char.status} - ${char.species}</span>
                </div>
                <p><strong>Última localização:</strong><br>${char.location.name}</p>
                <button class="detail-btn" onclick="showDetails(${char.id})">Ver Detalhes</button>
            </div>
        `;

        // Adicionando ao DOM (appendChild)
        charactersContainer.appendChild(card);
    });
}

// Função para atualizar a paginação
function updatePagination(pages) {
    totalPages = pages;
    pageInfo.innerText = `Página ${currentPage} de ${totalPages || 1}`;
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// --- Funcionalidades Extras (Item 5) ---

// 1. Personagem Aleatório
async function showRandomCharacter() {
    try {
        const randomId = Math.floor(Math.random() * 826) + 1;
        await showDetails(randomId);
    } catch (error) {
        console.error('Erro ao buscar personagem aleatório:', error);
    }
}

// 2. Detalhes em Modal
async function showDetails(id) {
    try {
        const response = await fetch(`https://rickandmortyapi.com/api/character/${id}`);
        const char = await response.json();

        modalDetails.innerHTML = `
            <img src="${char.image}" alt="${char.name}" style="width: 200px; border-radius: 50%; margin-bottom: 20px; border: 3px solid #00f2ff;">
            <h2 style="color: #97ce4c;">${char.name}</h2>
            <div style="text-align: left; margin-top: 20px; color: #fff;">
                <p><strong>Gênero:</strong> ${char.gender}</p>
                <p><strong>Origem:</strong> ${char.origin.name}</p>
                <p><strong>Espécie:</strong> ${char.species}</p>
                <p><strong>Status:</strong> ${char.status}</p>
                <p><strong>Aparições:</strong> ${char.episode.length} episódios</p>
            </div>
        `;
        modal.style.display = 'block';
    } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
    }
}

// 3. Alternar Tema (Dark/Light)
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        const isDark = document.body.classList.contains('dark-theme');
        themeToggle.innerText = isDark ? '🌙' : '☀️';
    });
}

// Event Listeners para Busca e Filtros (Debounce para busca)
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentFilters.name = e.target.value;
        currentPage = 1;
        fetchCharacters(currentPage, currentFilters);
    }, 500); // Aguarda 500ms após o usuário parar de digitar
});

statusFilter.addEventListener('change', (e) => {
    currentFilters.status = e.target.value;
    currentPage = 1;
    fetchCharacters(currentPage, currentFilters);
});

// Event Listeners para Paginação
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchCharacters(currentPage, currentFilters);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
        currentPage++;
        fetchCharacters(currentPage, currentFilters);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// Fechar Modal
if (closeBtn) {
    closeBtn.onclick = () => modal.style.display = 'none';
}
window.onclick = (event) => {
    if (event.target == modal) modal.style.display = 'none';
};

if (randomBtn) {
    randomBtn.addEventListener('click', showRandomCharacter);
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    fetchCharacters();
});
