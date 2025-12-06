# Contexto de la Aplicación: Darkroom D-76 Companion

Este documento sirve como fuente de verdad para entender la lógica, el propósito y el diseño de la aplicación "Darkroom D-76 Companion". Úsalo para alimentar a otros LLMs o desarrolladores.

## 1. Propósito General
La aplicación es una herramienta de cuarto oscuro (Darkroom) diseñada específicamente para el revelado manual de película fotográfica en Blanco y Negro, optimizada para el revelador **Kodak D-76 (Stock)**.

Funciona como un "Timer Inteligente" y Asistente, guiando al usuario paso a paso a través del proceso químico, manejando los tiempos críticos y cálculos matemáticos para compensar el desgaste del químico o la exposición de la película.

## 2. Experiencia de Usuario (UX/UI)
*   **Filosofía:** "Safety Light Friendly". La interfaz utiliza un esquema de colores estricto: Fondo Negro absoluto (#000000) y Texto Rojo (#FF0000/Rojos oscuros).
*   **¿Por qué?** En un cuarto oscuro, la luz blanca vela el papel fotográfico (aunque la película se revela en tanques cerrados, la preparación y el entorno suelen mantenerse en penumbra). Además, el rojo preserva la visión nocturna.
*   **Interacción:** Stateless. La app no guarda datos persistentes entre sesiones (no usa base de datos). Se asume que cada sesión de revelado es única.
*   **Feedback:** Visual (cronómetros grandes, barras de progreso) y Auditivo (beeps al terminar etapas o iniciar agitación).

## 3. Lógica de Negocio y Cálculos

### 3.1. Tiempos Base
Los tiempos están definidos en `constants.ts`:
*   **Revelador (D-76 Stock):** 570 segundos (9:30 min).
*   **Baño de Paro:** 60 segundos.
*   **Fijador:** 300 segundos (5:00 min).
*   **Lavado:** 600 segundos.
*   **Humectante:** 60 segundos.

### 3.2. Algoritmo de Compensación (Revelador)
El tiempo del revelador es dinámico. Se calcula en `App.tsx` / `SetupForm.tsx` con la siguiente fórmula:

$$T_{final} = T_{base} + (U \times C_{reuso}) + (PP \times C_{push\_pull})$$

Donde:
*   $T_{base} = 570s$
*   $U$ (Usos previos) = Cantidad de rollos revelados anteriormente con este litro de químico.
*   $C_{reuso}$ (Compensación reuso) = +15 segundos por cada uso previo.
*   $PP$ (Push/Pull Stops) = Número de pasos de forzado (positivo) o subexposición (negativo).
*   $C_{push\_pull}$ (Compensación ISO) = 30 segundos por paso (se suma para Push, se resta para Pull).

*Nota:* Si el usuario hace Pull (ej. -1 stop), se restan 30 segundos.

### 3.3. Lógica de Agitación
El sistema alerta cuándo agitar el tanque durante el Revelado y el Fijado:
1.  **Inicio:** Agitación constante durante los primeros 30 segundos.
2.  **Mantenimiento:** Cada minuto exacto posterior, agitar durante los primeros 10 segundos del minuto.
3.  **Reposo:** El resto del tiempo.

## 4. Arquitectura Técnica
*   **Framework:** React 18+.
*   **Estilos:** Tailwind CSS.
*   **IA:** Google Gemini API (`@google/genai`) para el componente `Assistant.tsx` (Chatbot de ayuda).
*   **Audio:** API nativa `AudioContext` para generar tonos osciladores (sin archivos mp3 externos para reducir latencia y dependencias).
*   **Deploy:** Diseñada como SPA (Single Page Application) exportable a PWA o empaquetada con Capacitor para Android.

## 5. Estructura de Datos (Typescript)
*   `ProcessConfig`: Almacena `previousUses` (number), `pushPullStops` (number), `isStock` (boolean).
*   `Step`: Objeto que define cada paso (`id`, `type`, `durationSeconds`, `agitationGuide`).

## 6. Integración con Gemini AI
El asistente (`Assistant.tsx`) recibe el contexto del sistema (`DEFAULT_SYSTEM_INSTRUCTION`) que lo instruye para comportarse como un experto en química fotográfica, respondiendo dudas sobre tiempos, temperaturas y errores comunes en D-76.
