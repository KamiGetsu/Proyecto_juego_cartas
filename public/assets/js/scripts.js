document.addEventListener('DOMContentLoaded', async () => {
    let player1Cards = [];
    let player2Cards = [];
    let player1Name = '';
    let player2Name = '';
    const selectedUsers = []; // Lista para almacenar usuarios seleccionados
    let currentPartidaId = null; // Almacena el ID de la partida actual

    try {
        // Cargar jugadores registrados
        const response = await fetch('/jugadores');
        if (!response.ok) {
            throw new Error('Error al cargar los jugadores desde la API');
        }
        const jugadores = await response.json();

        console.log("Respuesta de la API /jugadores:", jugadores);

        if (!Array.isArray(jugadores)) {
            throw new Error('La respuesta de la API no es un array');
        }

        const userSelect = document.getElementById('user-select');

        jugadores.forEach((jugador) => {
            const option = document.createElement('option');
            option.value = jugador.id_jugador;
            option.textContent = jugador.nombre_usuario;
            userSelect.appendChild(option);
        });

        userSelect.addEventListener('change', () => {
            document.getElementById('confirm-user-selection').disabled = !userSelect.value;
        });

        document.getElementById('confirm-user-selection').addEventListener('click', () => {
            const selectedUserId = userSelect.value;
            const selectedUserName = userSelect.options[userSelect.selectedIndex].textContent;

            if (!selectedUserName) {
                alert('Por favor, selecciona un jugador.');
                return;
            }

            // Verificar si el usuario ya fue seleccionado
            if (selectedUsers.includes(selectedUserId)) {
                alert('Este usuario ya ha sido seleccionado por otro jugador.');
                return;
            }

            if (!player1Name) {
                // Asignar al jugador 1
                player1Name = selectedUserName;
                document.getElementById('player1-name').textContent = player1Name;
                selectedUsers.push(selectedUserId); // Agregar a la lista de usuarios seleccionados
            } else {
                // Asignar al jugador 2
                player2Name = selectedUserName;
                document.getElementById('player2-name').textContent = player2Name;
                selectedUsers.push(selectedUserId); // Agregar a la lista de usuarios seleccionados
            }

            // Actualizar el menú desplegable para deshabilitar usuarios seleccionados
            Array.from(userSelect.options).forEach(option => {
                if (selectedUsers.includes(option.value)) {
                    option.disabled = true; // Deshabilitar opción
                }
            });

            if (player1Name && player2Name) {
                document.getElementById('user-selection-modal').style.display = 'none';
                document.getElementById('main-container').classList.remove('d-none');
                loadCharacters();
            } else {
                userSelect.value = '';
                document.getElementById('confirm-user-selection').disabled = true;
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
        alert('Hubo un error al cargar los jugadores. Revisa la consola.');
    }

    async function loadCharacters() {
        try {
            const response = await fetch('/api/personajes');
            if (!response.ok) {
                throw new Error('Error al cargar los personajes desde la API');
            }
            const personajes = await response.json();

            console.log("Respuesta de la API /api/personajes:", personajes);

            if (!Array.isArray(personajes)) {
                throw new Error('La respuesta de la API no es un array');
            }

            const container1 = document.querySelector('#player1-characters');
            const container2 = document.querySelector('#player2-characters');

            if (!container1 || !container2) {
                throw new Error('No se encontraron los contenedores de personajes.');
            }

            personajes.forEach((p) => {
                const card1 = createCard(p, '1');
                const card2 = createCard(p, '2');

                container1.appendChild(card1);
                container2.appendChild(card2);
            });
        } catch (error) {
            console.error('Error:', error.message);
            alert('Hubo un error al cargar los personajes. Revisa la consola.');
        }
    }

    function createCard(personaje, player) {
        const card = document.createElement('div');
        card.className = 'card h-100 personaje-card animate__animated shadow-sm';
        card.dataset.id = personaje.id_personaje;
        card.dataset.player = player;

        card.innerHTML = `
            <div class="card-body d-flex flex-column justify-content-between">
                <div class="front">
                    <h5 class="card-title text-center">${personaje.nombre || 'Sin Nombre'}</h5>
                    <hr class="my-2">
                    <ul class="list-unstyled small overflow-auto">
                        <li><i class="fas fa-dragon me-2"></i><strong>Raza:</strong> ${personaje.nombre_raza || 'Desconocida'}</li>
                        <li><i class="fas fa-shield-alt me-2"></i><strong>Tipo:</strong> ${personaje.nombre_tipo || 'Desconocido'}</li>
                        <li><i class="fas fa-bolt me-2"></i><strong>Poder:</strong> ${personaje.poder || 'N/A'}</li>
                        <li><i class="fas fa-heart me-2"></i><strong>Vida:</strong> ${personaje.vida || 'N/A'}</li>
                        <li><i class="fas fa-hat-wizard me-2"></i><strong>Magia:</strong> ${personaje.magia || 'N/A'}</li>
                    </ul>
                </div>
                <button class="btn btn-primary w-100 mt-3 select-btn">Seleccionar</button>
            </div>
        `;

        return card;
    }

    function toggleSelection(card, selectedCards) {
        const id = card.dataset.id;
        const index = selectedCards.indexOf(id);

        if (index !== -1) {
            card.classList.remove('selected');
            selectedCards.splice(index, 1);
        } else if (selectedCards.length < 5) {
            card.classList.add('selected');
            selectedCards.push(id);
        } else {
            alert("Ya has seleccionado 5 cartas. Deselecciona una para elegir otra.");
        }
    }

    function checkSelectionComplete() {
        const confirmButton = document.getElementById('confirm-selection');
        confirmButton.disabled = !(player1Cards.length === 5 && player2Cards.length === 5);
    }

    document.body.addEventListener('click', (e) => {
        const button = e.target.closest('.select-btn');
        if (!button) return;

        const card = button.closest('.card');
        const playerId = card.dataset.player;

        if (playerId === '1') {
            toggleSelection(card, player1Cards);
        } else {
            toggleSelection(card, player2Cards);
        }

        checkSelectionComplete();
    });

    document.getElementById('confirm-selection').addEventListener('click', async () => {
        // Verificar si ambos jugadores han seleccionado 5 cartas
        if (player1Cards.length === 5 && player2Cards.length === 5) {
            // Obtener todas las cartas de ambos jugadores
            const allPlayer1Cards = document.querySelectorAll('#player1-characters .card');
            const allPlayer2Cards = document.querySelectorAll('#player2-characters .card');

            // Función para eliminar las cartas no seleccionadas
            function removeUnselectedCards(cards, selectedCards) {
                cards.forEach(card => {
                    const cardId = card.dataset.id;
                    if (!selectedCards.includes(cardId)) {
                        card.remove(); // Eliminar la carta del DOM
                    }
                });
            }

            // Eliminar las cartas no seleccionadas para ambos jugadores
            removeUnselectedCards(allPlayer1Cards, player1Cards);
            removeUnselectedCards(allPlayer2Cards, player2Cards);

            // Deshabilitar todos los botones de selección
            document.querySelectorAll('.select-btn').forEach(button => {
                button.disabled = true;
            });

            // Llamar a la API para comparar estadísticas
            const response = await fetch('/api/comparar-estadisticas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jugador1: player1Cards, jugador2: player2Cards }),
            });

            const result = await response.json();

            // Mostrar el resultado del ganador
            alert(`Ganador: ${result.ganador}`);

            // Guardar el resultado de la partida en el backend
            if (currentPartidaId) {
                await fetch(`/api/partida/${currentPartidaId}/resultado`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ganador: result.ganador
                    })
                });
            }

            // Ocultar el botón de "Confirmar selección"
            const confirmButton = document.getElementById('confirm-selection');
            confirmButton.style.display = 'none'; // Ocultar el botón
        } else {
            alert("Ambos jugadores deben seleccionar exactamente 5 cartas.");
        }
    });
});