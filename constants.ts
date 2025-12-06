// Base times in seconds
export const BASE_DEV_TIME_SECONDS = 570; // 9:30 minutes
export const FIXER_TIME_SECONDS = 300; // 5:00 minutes
export const STOP_BATH_SECONDS = 60; // 1 minute standard
export const WASH_SECONDS = 600; // 10 minutes standard wash
export const RINSE_SECONDS = 60; // 1 minute Photo Flo

// Adjustments
export const SECONDS_PER_REUSE = 15; // Conservative +15s per previous roll
export const SECONDS_PER_STOP_PUSH = 30; // +30s per stop push
export const SECONDS_PER_STOP_PULL = 30; // -30s per stop pull (logic handles sign)

export const DEFAULT_SYSTEM_INSTRUCTION = `
Eres un experto asistente de cuarto oscuro (darkroom) para fotografía analógica en blanco y negro.
Tu base de conocimientos principal es el proceso Kodak D-76 Stock.
Responde de forma concisa y útil.
Datos clave:
- D-76 Stock: 9:30 min a 20°C.
- Fijador: 5:00 min.
- Agitación: Primeros 30 seg constantes, luego 5-10 seg cada minuto.
- Push: +30s por paso.
- Pull: -30s por paso.
- Reuso: +15-20s por rollo previo.
El usuario está en medio del proceso, sé directo.
`;