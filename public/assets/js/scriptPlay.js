document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.querySelector('#partidas-table tbody');

    // Función para cargar partidas
    const cargarPartidas = async () => {
        try {
            const response = await fetch('/api/partidas');
            if (!response.ok) throw new Error('Error al cargar las partidas');

            const partidas = await response.json();
            tbody.innerHTML = ''; // Limpiar tabla

            if (partidas.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3">No hay partidas disponibles.</td></tr>';
                return;
            }

            partidas.forEach(partida => {
                const row = `
                    <tr>
                        <td>${partida.id_partida}</td>
                        <td>${partida.estado || 'En progreso'}</td>
                        <td>
                            <button class="btn btn-sm btn-info unirse-btn" data-partida-id="${partida.id_partida}">Unirse</button>
                            <button class="btn btn-sm btn-danger borrar-btn" data-partida-id="${partida.id_partida}">🗑️ Borrar</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });

            // Agregar eventos a los botones de "Unirse"
            document.querySelectorAll('.unirse-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const id_partida = button.dataset.partidaId;
                    try {
                        const response = await fetch(`/api/partida/${id_partida}/join`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' }
                        });

                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || 'Error al unirse a la partida');
                        }

                        const data = await response.json();
                        alert(`Te has unido a la partida ${id_partida}`);
                        window.location.href = `/select/`;
                    } catch (error) {
                        alert(`Error: ${error.message}`);
                    }
                });
            });

            // Agregar eventos a los botones de "Borrar"
            document.querySelectorAll('.borrar-btn').forEach(button => {
                button.addEventListener('click', async () => {
                    const id_partida = button.dataset.partidaId;
                    if (confirm(`¿Estás seguro de que quieres borrar la partida ${id_partida}?`)) {
                        try {
                            const response = await fetch(`/api/partida/${id_partida}`, {
                                method: 'DELETE',
                                headers: { 'Content-Type': 'application/json' }
                            });

                            if (!response.ok) throw new Error('Error al borrar la partida');

                            alert(`Partida ${id_partida} borrada exitosamente`);
                            cargarPartidas(); 
                        } catch (error) {
                            alert(`Error: ${error.message}`);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error al cargar partidas:', error);
            tbody.innerHTML = '<tr><td colspan="3">Error al cargar las partidas. Intenta nuevamente.</td></tr>';
        }
    };

    // Cargar partidas al cargar la página
    cargarPartidas();

    // Crear partida
    document.getElementById('crear-partida-btn').addEventListener('click', async () => {
        try {
            const response = await fetch('/api/partida', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear la partida');
            }

            const data = await response.json();
            alert(`Partida creada con ID: ${data.id_partida}`);
            window.location.href = `/select/`;
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    });

    // Recargar partidas al hacer clic en el botón
    document.getElementById('recargar-partidas').addEventListener('click', cargarPartidas);

    // Botón de salir
    document.getElementById('salir-btn').addEventListener('click', () => {
        window.location.href = '/logout';
    });

  
});