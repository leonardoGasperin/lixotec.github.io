import { loadYouTubeAPI, createPlayer } from '../services/youtubeApi.js';
import { getComponents } from '../services/load.components.js';

function createPostHTML(post) {
    let html = `
        <section class="main-card" id="postId-${post.id}">
            <header class="main-card-header">
                <h2>${post.titulo0 || ''}</h2>
                <p class="lead">${post.conteudo0 || ''}</p>
            </header>
    `;

    const keys = Object.keys(post).sort();
    const videos = keys.filter(k => k.startsWith('video'));
    const imagens = keys.filter(k => k.startsWith('imagem'));
    const titulos = keys.filter(k => k.startsWith('titulo') && k !== 'titulo0');
    const conteudos = keys.filter(k => k.startsWith('conteudo') && k !== 'conteudo0');

    const maxIndex = Math.max(
        ...videos.map(k => parseInt(k.replace('video', ''))),
        ...imagens.map(k => parseInt(k.replace('imagem', ''))),
        ...titulos.map(k => parseInt(k.replace('titulo', ''))),
        ...conteudos.map(k => parseInt(k.replace('conteudo', '')))
    );

    for (let i = 1; i <= maxIndex; i++) {
        if (post[`video${i-1}`]) {
            html += `<div id="player-${i-1}-${post.codigo}" class="video-wrap"></div>`;
        }
        if (post[`titulo${i}`] || post[`conteudo${i}`]) {
            html += `
                <div class="content-body">
                    ${post[`titulo${i}`] ? `<h3>${post[`titulo${i}`]}</h3>` : ''}
                    ${post[`conteudo${i}`] ? `<p>${post[`conteudo${i}`]}</p>` : ''}
                </div>
            `;
        }
        if (post[`imagem${i-1}`]) {
            html += `
                <div class="content-body">
                    <img class="img-wrap" src="${post[`imagem${i-1}`]}" alt="LixoTec Community Image ${i}">
                </div>
            `;
        }
    }

    html += '</section>';
    return html;
}

async function loadFeed(page = 1) {
    const POSTS_PER_PAGE = 5;

    try {
        const response = await fetch('./src/data-base.json');
        const data = await response.json();
        let posts = data.paginas[0].posts;

        posts = posts.slice().reverse();

        const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
        const start = (page - 1) * POSTS_PER_PAGE;
        const end = start + POSTS_PER_PAGE;
        const paginatedPosts = posts.slice(start, end);

        const feedElement = document.querySelector('feed');
        if (feedElement) {
            feedElement.innerHTML = paginatedPosts.map(post => createPostHTML(post)).join('');

            renderPagination(totalPages, page);

            // Aguarda a API estar pronta
            loadYouTubeAPI().then(() => {
                paginatedPosts.forEach(post => {
                    Object.keys(post).forEach(key => {
                        if (key.startsWith('video')) {
                            const index = key.replace('video', '');
                            const playerId = `player-${index}-${post.codigo}`;
                            const playerElement = document.getElementById(playerId);
                            if (playerElement) {
                                createPlayer(playerId, post[key]);
                            }
                        }
                    });
                });
            });
        }

    } catch (error) {
        console.error('Erro ao carregar o feed:', error);
    }
}

function renderPagination(totalPages, currentPage) {
    const paginationElement = document.querySelector('#pagination');
    if (!paginationElement) return;

    const delta = 2; // quantas páginas mostrar antes/depois da atual
    let html = '';

    // Botão "Primeira"
    if (currentPage > 1) {
        html += `<button class="page-btn" data-page="1">« 1</button>`;
    }

    // Página anterior "..."
    if (currentPage - delta > 2) {
        html += `<span class="dots">...</span>`;
    }

    // Páginas ao redor da atual
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }

    // Página seguinte "..."
    if (currentPage + delta < totalPages - 1) {
        html += `<span class="dots">...</span>`;
    }

    // Botão "Última"
    if (currentPage < totalPages) {
        html += `<button class="page-btn" data-page="${totalPages}">${totalPages} »</button>`;
    }

    paginationElement.innerHTML = html;

    // Adiciona eventos
    document.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const page = parseInt(e.target.dataset.page);
            loadFeed(page); // função que você já tem
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadYouTubeAPI();
    loadFeed(1);
    getComponents('customheader');
    getComponents('customfooter');
});
