# Prototipo Oficial: Torneo de Eliminatorias FIFA PS4 (16 Participantes · Round Robin)

Prototipo interactivo desarrollado con **React**, **Tailwind CSS**, y una estética gaming **EA Sports FC / PS4 UI**.

![Vista Principal de la Interfaz](C:\Users\Noel Tejeda\.gemini\antigravity-ide\brain\23408bd7-9564-43fe-aab7-4c6e873e68c4\after_save_result_1791893814440.png)

---

## 1. Integridad Matemática del Fixture (120 Partidos Únicos)

Para 16 jugadores en formato *Todos contra Todos* (Round Robin simple):
$$\text{Total de Partidos} = \frac{n \times (n - 1)}{2} = \frac{16 \times 15}{2} = 120\text{ partidos únicos}$$

- Cada jugador disputa exactamente **15 partidos** (1 contra cada uno de los otros 15 participantes).
- **Algoritmo de Berger (Circle Method)** implementado en [mockTournamentData.js](file:///c:/Noel/EliminatoriasMundial/src/data/mockTournamentData.js):
  - Organiza los 120 partidos en **15 jornadas o fechas de 8 partidos cada una**.
  - Garantiza que **ningún enfrentamiento se repita, se omita o quede huérfano**.
  - Permite alternancia equitativa de localías.

---

## 2. Componentes y Módulos Desarrollados

### A. Panel de Asistencia Diaria (Filtro por Jugadores en la Casa)
- Archivo: [AttendancePanel.jsx](file:///c:/Noel/EliminatoriasMundial/src/components/AttendancePanel.jsx)
- **Matriz de Pills interactiva**: 16 participantes con sus avatares, colores y clubes favoritos.
- **Detección inteligente de disponibilidad**:
  - Calcula al instante cuántos de los partidos pendientes corresponden **únicamente** a personas presentes hoy en la casa.
  - Botones de acción rápida: *Marcar Todos*, *Desmarcar Todos*, y *Simular 8 en Casa*.
  - Alerta preventiva si hay menos de 2 participantes presentes.

### B. Módulo de Carga de Resultado (Partido Activo)
- Archivo: [ScoreSubmissionCard.jsx](file:///c:/Noel/EliminatoriasMundial/src/components/ScoreSubmissionCard.jsx)
- Marcador estilo **HUD EA Sports FC**:
  - Escudos, nombres destacados y selectores de partido.
  - Inputs numéricos grandes con botones de control rápido `+` y `-` para operar fácilmente en pantalla o mandos.
  - Botón **[GUARDAR RESULTADO OFICIAL]** con feedback visual instantáneo (Toast flotante).
  - Al guardar: el partido sale de la cola de pendientes y pasa al historial de jugados, actualizando de inmediato la tabla de posiciones.

### C. Tabla de Posiciones en Tiempo Real (Leaderboard)
- Archivo: [LeaderboardTable.jsx](file:///c:/Noel/EliminatoriasMundial/src/components/LeaderboardTable.jsx)
- **Criterio de ordenamiento estricto**:
  1. Puntos (**PTS**)
  2. Diferencia de Goles (**DG = GF - GC**)
  3. Goles a Favor (**GF**)
  4. Partidos Ganados (**PG**)
- **Línea de corte visual obligatoria**:
  - Entre el puesto 8 y el puesto 9 se dibuja una barra divisoria brillante:  
    `┈┈┈┈┈┈┈┈┈ LÍNEA DE CLASIFICACIÓN · SOLO EL TOP 8 AVANZA AL MUNDIAL ┈┈┈┈┈┈┈┈┈`
  - Puestos 1 al 8: Fondo verde esmeralda y medallas/insignia `[ZONA MUNDIAL]`.
  - Puestos 9 al 16: Fondo neutro y badge `[ELIMINADO]`.
  - Indicador `HOY` para participantes que están presentes en la jornada actual.
  - Racha de forma reciente con píldoras W/D/L.

### D. Módulo de Control y Validación de Fixture
- Archivo: [FixtureViewer.jsx](file:///c:/Noel/EliminatoriasMundial/src/components/FixtureViewer.jsx)
- 4 vistas de validación:
  1. **"Sugeridos Hoy"**: Lista de partidos pendientes donde **ambos jugadores están en la casa**. Botón directo *Cargar en Marcador*.
  2. **"Todos los Partidos (120)"**: Buscador por texto, filtros por estado (Todos, Jugados, Pendientes) y selector de Jornada (Fechas 1 a 15).
  3. **"Ver por Jugador"**: Selector individual (ej. *Noel*) que desglosa sus 15 partidos, estadísticas particulares y rivales presentes.
  4. **"Matriz 16x16"**: Cuadrícula de doble entrada para auditoría visual completa de los 120 enfrentamientos.

---

## 3. Demostración Visual y Vistas

````carousel
![Todos los Partidos (120)](C:\Users\Noel Tejeda\.gemini\antigravity-ide\brain\23408bd7-9564-43fe-aab7-4c6e873e68c4\todos_los_partidos_view_1791893860782.png)
<!-- slide -->
![Matriz Cruzada 16x16](C:\Users\Noel Tejeda\.gemini\antigravity-ide\brain\23408bd7-9564-43fe-aab7-4c6e873e68c4\matriz_16x16_view_1791893892223.png)
<!-- slide -->
![Video Demostración de Navegación](C:\Users\Noel Tejeda\.gemini\antigravity-ide\brain\23408bd7-9564-43fe-aab7-4c6e873e68c4\fifa_tournament_demo_1791893731007.webp)
````

---

## 4. Persistencia y Utilidades

- **Almacenamiento Local (`localStorage`)**: Las jornadas, resultados guardados y estados de asistencia se conservan automáticamente en el navegador.
- **Acciones Rápidas en Cabecera**:
  - `Cargar Demo`: Restaura el set inicial con 28 partidos simulados para pruebas.
  - `Reiniciar a 0`: Restablece los 120 partidos a estado pendiente para comenzar un torneo oficial desde cero.
