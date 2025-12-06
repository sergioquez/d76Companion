# Guía de Exportación Android y Publicación Play Store (2025)

Esta guía detalla cómo convertir esta Web App de React en una aplicación nativa de Android (.apk / .aab) y los pasos para publicarla.

## 1. Requisitos Previos

Antes de ejecutar los scripts, asegúrate de tener instalado:

1.  **Node.js** (v18 o superior).
2.  **Java JDK 17** (Requerido para las herramientas actuales de Android).
3.  **Android Studio Koala (o superior):**
    *   Durante la instalación, asegúrate de instalar "Android SDK", "Android SDK Platform-Tools" y "Android SDK Build-Tools".
4.  **Cuenta de Google Play Console** ($25 USD pago único).

## 2. Configuración Inicial (Capacitor)

Como esta es una app React, usaremos **Capacitor** para crear el contenedor nativo.

Ejecuta estos comandos en tu terminal (raíz del proyecto) una sola vez:

```bash
# 1. Instalar dependencias de Capacitor
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Inicializar Capacitor (Nombre de la App y ID de paquete)
# IMPORTANTE: El ID (com.example.app) debe ser único en la Play Store.
npx cap init "D-76 Companion" "com.tusitio.darkroomd76"

# 3. Configurar 'webDir' en capacitor.config.json
# Asegúrate de que apunte a tu carpeta de build (usualmente 'dist' en Vite o 'build' en CRA).
# Abre capacitor.config.json y edita: "webDir": "dist" (o "build")
```

## 3. Compilación y Generación del APK

Puedes usar los scripts automatizados incluidos en la carpeta `scripts/` o hacerlo manualmente.

### Opción A: Scripts Automáticos
*   **Windows:** Ejecuta `.\scripts\build_android.ps1` en PowerShell.
*   **Mac/Linux:** Ejecuta `./scripts/build_android.sh` en Bash.

### Opción B: Manual
1.  Construir la web app: `npm run build`
2.  Añadir plataforma Android: `npx cap add android`
3.  Sincronizar cambios: `npx cap sync`
4.  Abrir en Android Studio: `npx cap open android`

Una vez en Android Studio:
1.  Espera a que termine el indexado (Gradle Sync).
2.  Ve al menú **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3.  El APK aparecerá en `android/app/build/outputs/apk/debug/`.

## 4. Publicación en Google Play Store (Estándares 2025)

Google ha endurecido las reglas para cuentas personales en 2024-2025. Sigue estos pasos estrictamente:

### Paso 1: Generar el Android App Bundle (.aab)
La Play Store ya no acepta `.apk` para publicación, requiere `.aab`.

1.  En Android Studio: **Build > Generate Signed Bundle / APK**.
2.  Selecciona **Android App Bundle**.
3.  **Keystore:** Crea una nueva llave de firma (KeyStore).
    *   **IMPORTANTE:** Guarda el archivo `.jks` y las contraseñas en un lugar seguro (Drive/Dropbox). Si pierdes esto, **no podrás actualizar tu app nunca más**.
4.  Genera el archivo `.aab` (Release).

### Paso 2: Crear la Ficha en Google Play Console
1.  Crea una nueva App.
2.  Completa la información: Nombre, Descripción corta, Descripción larga, Icono (512x512), Gráficos de función (1024x500).
3.  **Política de Privacidad:** Es obligatoria. Genera una URL pública que diga que tu app no recopila datos (Stateless).

### Paso 3: Pruebas Cerradas (El requisito de los 20 Testers)
Si tu cuenta es personal (creada después de Nov 2023), **es obligatorio**:

1.  Subir el `.aab` al canal de **Pruebas Cerradas (Closed Testing)**.
2.  Reclutar a **20 personas** con cuentas de Gmail diferentes.
3.  Ellos deben instalar tu app y mantenerla instalada por **14 días continuos**.
4.  Solo después de cumplir esto, se habilitará el botón para "Aplicar a Producción".

### Paso 4: Producción
Una vez superada la prueba cerrada:
1.  Promueve el release de "Pruebas Cerradas" a "Producción".
2.  La revisión de Google suele tardar entre 2 a 7 días.

## 5. Tips Adicionales para el Android Manifest

Para que la pantalla no se apague durante el revelado, instala este plugin:
```bash
npm install @capacitor-community/keep-awake
npx cap sync
```
Y úsalo en tu `App.tsx` (dentro de `useEffect`).
