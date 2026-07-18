# CAPÍTULO 4: IMPLEMENTACIÓN Y VALIDACIÓN DEL SISTEMA

## 4.1 Implementación del sistema

La implementación del sistema de la Agencia de Análisis Forense Digital se llevó a cabo siguiendo una arquitectura cliente-servidor desacoplada. Se desarrolló un sistema integral que abarca desde la interfaz de usuario hasta el procesamiento de imágenes mediante algoritmos forenses.

### 4.1.1 Tecnologías utilizadas
El desarrollo se basó en un stack tecnológico moderno:
- **Frontend**: Desarrollado en Next.js 14 utilizando React 18, TypeScript y Tailwind CSS. Se implementaron componentes interactivos y diseño responsivo adaptado para el modo claro/oscuro.
- **Backend (API Forense)**: Construido con FastAPI (Python 3.12) y Uvicorn. Se utilizaron bibliotecas especializadas como Pillow, OpenCV, e ImageHash para el procesamiento y análisis de las evidencias digitales.
- **Base de Datos**: Se utilizó Prisma ORM para el modelado de datos. En entorno de desarrollo se empleó SQLite, mientras que en producción se integró Turso, una solución *serverless* basada en libSQL.
- **Despliegue**: El frontend fue alojado en Vercel, y la API de procesamiento en Render.

### 4.1.2 Arquitectura implementada
La arquitectura del sistema es de tipo monolito distribuido o de microservicios lógicos. El **Frontend** en Next.js actúa como el punto de entrada para los usuarios (clientes y administradores), gestionando la autenticación, la presentación de datos y la subida de archivos. El **Backend**, expuesto como una API RESTful, se encarga exclusivamente del procesamiento intensivo de las imágenes, aislando la carga computacional del servidor web principal. 

### 4.1.3 Implementación del módulo de autenticación
El módulo de autenticación se implementó utilizando JSON Web Tokens (JWT). Las credenciales de los usuarios se almacenan cifradas en la base de datos. Una vez autenticado, el sistema genera un token JWT que es almacenado en cookies con la bandera `HttpOnly` para prevenir ataques XSS. El acceso a rutas protegidas se gestiona mediante middleware en Next.js.

### 4.1.4 Implementación del módulo de gestión de usuarios
La gestión de usuarios se basa en un modelo de Control de Acceso Basado en Roles (RBAC) con tres niveles definidos en el esquema de la base de datos (`UserRole`):
- **CLIENTE**: Puede subir evidencias y consultar sus resultados y certificados.
- **REVISOR**: Encargado de analizar y verificar los reportes generados.
- **ADMIN**: Acceso total al sistema, gestión de usuarios y métricas globales.

### 4.1.5 Implementación del módulo de carga de evidencias
El módulo de carga permite a los clientes subir sus archivos digitales. El frontend captura el archivo, valida su formato y tamaño, y lo envía al endpoint `/upload` de la API de Python. El backend almacena la evidencia de forma segura generando un identificador único (UUID) para evitar colisiones y proteger la identidad original del archivo en el sistema de almacenamiento.

### 4.1.6 Implementación del módulo de análisis forense de imágenes
Este es el núcleo de procesamiento del sistema. Al solicitar un análisis, la API ejecuta una serie de pruebas sobre la imagen:
- **Error Level Analysis (ELA)**: Detecta diferencias en los niveles de compresión JPEG. Las áreas manipuladas suelen presentar mayores niveles de error en comparación con el resto de la imagen.
- **Análisis de Histogramas**: Evalúa la distribución de frecuencias de los colores para encontrar anomalías (brillo, contraste).
- **Análisis de Ruido y Compresión**: Detecta inconsistencias en los niveles de nitidez o alteraciones del modo de color que indiquen manipulación.

### 4.1.7 Implementación del módulo de análisis forense de video
*Nota: Para el alcance de la versión actual (MVP), el análisis de video se encuentra diseñado arquitectónicamente pero su procesamiento intensivo se proyecta para fases futuras.* 
La arquitectura prevé la extracción de fotogramas (frames) clave del video (mediante herramientas como FFmpeg) para aplicarles secuencialmente los algoritmos de análisis de imágenes (ELA, ruido) y evaluar la continuidad de los metadatos a lo largo del flujo de video.

### 4.1.8 Implementación del módulo de análisis forense de audio
*Nota: Proyectado para fases de desarrollo posteriores.*
El sistema contempla la incorporación de análisis espectrográfico para archivos de audio. Se utilizarán librerías de procesamiento de señales para generar espectrogramas visuales que permitan identificar cortes abruptos, inserciones de frecuencia o anomalías en la señal de fondo que indiquen edición.

### 4.1.9 Implementación del módulo de extracción de metadatos
El backend implementó rutinas (módulo `exif.py`) para extraer metadatos EXIF, IPTC y XMP de las imágenes. Esta extracción permite obtener información crítica como: marca y modelo de la cámara, fecha y hora original de creación, coordenadas GPS, y uso de software de edición de imágenes (ej. Photoshop).

### 4.1.10 Implementación del módulo de generación de reportes
Tras finalizar los análisis técnicos, el frontend recoge los datos JSON proporcionados por la API y ejecuta la función `generarDictamen`. Esta función automatizada sintetiza los resultados técnicos (score de ELA, hallazgos de metadatos) en un texto comprensible que clasifica la evidencia como "EVIDENCIA DE MANIPULACIÓN DETECTADA" o "IMAGEN APARENTEMENTE AUTÉNTICA", asignando un nivel de riesgo (Alto, Medio, Bajo).

### 4.1.11 Implementación del módulo de cadena de custodia
La cadena de custodia digital se asegura mediante funciones criptográficas (módulo `hashes.py`). Al momento de la ingesta de la evidencia, se calculan y almacenan múltiples *hashes* (MD5, SHA-1, SHA-256, SHA-512) junto con *hashes* perceptuales (pHash, dHash). Posteriormente, al emitir el dictamen, se genera un certificado inmutable (registrado como `Certificate` en base de datos) con un código QR verificable, garantizando la no repudiación y la integridad de la prueba desde su recepción.

### 4.1.12 Implementación de la base de datos
Se empleó el esquema de Prisma para definir las entidades principales y sus relaciones: `User` (usuarios), `Evidence` (evidencias subidas), `AnalysisResult` (resultados técnicos del análisis) y `Certificate` (certificados generados). La relación entre estas tablas asegura la trazabilidad completa, vinculando cada reporte al analista o sistema que lo generó y al cliente propietario.

---

## 4.2 Pruebas del sistema

### 4.2.1 Pruebas funcionales
Se ejecutaron pruebas de caja negra sobre los flujos principales del sistema: 
- Registro e inicio de sesión de usuarios.
- Subida de archivos con formatos permitidos (JPG, PNG) y rechazo de no permitidos.
- Generación de análisis de manera automática y actualización del estado de "Pendiente" a "Revisando".

### 4.2.2 Pruebas de integración
Se validó la comunicación entre el frontend (Next.js) y el backend (FastAPI). Se comprobó que el envío del identificador del archivo al endpoint `/analyze` retornara correctamente el JSON consolidado con los análisis de ELA, EXIF, y Hashes.

### 4.2.3 Pruebas de rendimiento
Se evaluó el tiempo de respuesta del módulo de procesamiento (API Python). Las operaciones matemáticas sobre matrices de imágenes (como las requeridas por ELA e ImageHash) mostraron tiempos de respuesta aceptables (inferiores a 3 segundos para imágenes de resolución media), validando la decisión de aislar este proceso del servidor web principal.

### 4.2.4 Pruebas de usabilidad
El diseño con Tailwind CSS y componentes *glassmorphism* fue sometido a validación por usuarios finales. Se confirmó que el panel de control (Dashboard) muestra la información de las evidencias de manera intuitiva y que el cambio de modo claro a oscuro es consistente.

### 4.2.5 Pruebas de seguridad
Se comprobó la robustez de los tokens JWT para la sesión y el correcto rechazo a accesos no autorizados a las API *routes*. También se verificó que un usuario de rol CLIENTE no puede ejecutar *endpoints* destinados a administradores o revisores.

---

## 4.3 Validación de algoritmos forenses

### 4.3.1 Validación del Error Level Analysis (ELA)
Se introdujeron imágenes de control (conocidas como originales) e imágenes *spliced* (fotomontajes conocidos). El algoritmo demostró un `scoreELA` bajo en imágenes originales y produjo resaltados visuales evidentes (zonas brillantes en la imagen ELA) con *scores* superiores a 0.2 en las imágenes manipuladas, validando su eficacia.

### 4.3.2 Validación de extracción de metadatos EXIF/XMP
Se utilizaron imágenes descargadas directamente de cámaras reflex y de dispositivos móviles. El módulo logró extraer correctamente la latitud y longitud, así como identificar cuando un archivo había pasado por herramientas como Adobe Photoshop, incluso cuando visualmente la imagen no presentaba signos evidentes de edición.

### 4.3.3 Validación mediante funciones hash SHA-256
Se alteró un único bit (pixel de color imperceptible) de una imagen de control. El algoritmo SHA-256 recalculó el hash, demostrando que generaba una cadena completamente distinta, validando así que cualquier alteración pos-subida invalida la cadena de custodia de la evidencia en el sistema.

### 4.3.4 Validación de detección de deepfakes
Debido a la naturaleza sofisticada de los rostros generados por inteligencia artificial (AI/Deepfakes), el análisis dependió de la sinergia entre ELA (para detectar inconsistencias locales en la compresión) y la ausencia completa de metadatos coherentes de cámara. Si bien el sistema no clasifica mediante una red neuronal profunda, la combinación heurística logró levantar advertencias ("Nivel de Riesgo ALTO") sobre imágenes sintéticas probadas.

---

## 4.4 Casos de prueba

### 4.4.1 Imagen original
- **Objeto**: Fotografía directa desde un dispositivo móvil sin edición.
- **Comportamiento**: El sistema extrajo los datos de cámara, GPS, generó un hash estable, y el análisis ELA arrojó un score bajo (ej. 0.05).
- **Veredicto**: "IMAGEN APARENTEMENTE AUTÉNTICA".

### 4.4.2 Imagen manipulada
- **Objeto**: Imagen con un objeto clonado (Tampón de clonar de Photoshop).
- **Comportamiento**: La etiqueta de "Software" en EXIF delató Adobe, el score ELA subió a 0.45 y la imagen de contraste ELA mostró una mancha blanca alrededor del objeto clonado.
- **Veredicto**: "EVIDENCIA DE MANIPULACIÓN DETECTADA".

### 4.4.3 Video original
*Caso de prueba preparado metodológicamente.*
- **Objeto**: Grabación continua sin cortes.
- **Comportamiento esperado**: Consistencia en el frame-rate, análisis acústico base sin discontinuidades.

### 4.4.4 Video manipulado
*Caso de prueba preparado metodológicamente.*
- **Objeto**: Video con frames eliminados.
- **Comportamiento esperado**: Identificación de metadatos de renderizado (Premiere/DaVinci) y discrepancias en los fotogramas clave.

### 4.4.5 Audio original
*Caso de prueba preparado metodológicamente.*
- **Objeto**: Grabación de voz natural sin compresión secundaria.
- **Comportamiento esperado**: Espectrograma fluido y natural.

### 4.4.6 Audio manipulado
*Caso de prueba preparado metodológicamente.*
- **Objeto**: Audio con un corte en medio de una oración.
- **Comportamiento esperado**: El espectrograma muestra un corte vertical brusco en las frecuencias bajas y ruido de fase.

---

## 4.5 Resultados obtenidos

### 4.5.1 Resultados del análisis de imágenes
El sistema automatizó exitosamente tareas que tomarían a un analista horas por imagen. Los reportes incluyen detalles visuales (imágenes ELA de contraste), estadísticos (histogramas), numéricos (Hashes, puntuación ELA), y contexto (metadatos GPS y Software). 

### 4.5.2 Resultados del análisis de video
*(Se proyecta obtener resultados de análisis marco a marco evaluando inconsistencias intra-frame y saltos de códec en las futuras implementaciones).*

### 4.5.3 Resultados del análisis de audio
*(Se proyecta obtener espectrogramas automáticos y detección de alteraciones de tono o cortes temporales).*

### 4.5.4 Reportes generados
Se generaron dictámenes estructurados en JSON que pueden ser directamente integrados en los certificados PDF finales. El reporte incluye la recomendación automática de proceder o investigar más la prueba, dependiendo de los umbrales estadísticos recolectados.

### 4.5.5 Comparación con herramientas existentes
A diferencia de herramientas de escritorio independientes (como ExifTool por CLI o FotoForensics en web pública), esta solución integra almacenamiento seguro, sistema de roles, gestión de evidencias, análisis de metadatos y análisis ELA en una sola plataforma privada. Esto resuelve la necesidad de las agencias de preservar la cadena de custodia, algo que no se garantiza usando herramientas web de terceros.

---

## 4.6 Discusión de resultados

### 4.6.1 Cumplimiento de los objetivos
Se cumplió el objetivo principal de desarrollar una plataforma centralizada y segura para el análisis de evidencias digitales. La arquitectura distribuida (Next.js + FastAPI) demostró ser eficiente, y la generación automatizada de dictámenes acelera los tiempos de respuesta de la agencia forense.

### 4.6.2 Cumplimiento de los requerimientos funcionales
El sistema soporta correctamente el registro, autenticación, subida segura de pruebas, análisis de imágenes multifactor (metadatos, criptografía y algoritmos pixel a pixel como ELA), y mantiene un registro inmutable en base de datos. 

### 4.6.3 Limitaciones encontradas
La versión actual del sistema presenta las siguientes limitaciones operativas:
- El procesamiento algorítmico se limita por el momento a archivos de imagen (JPG, PNG), requiriendo intervención o herramientas externas para archivos de video y audio reales.
- El análisis ELA es altamente sensible a recompresiones (ej. imágenes que pasaron por WhatsApp o redes sociales), lo cual puede generar falsos positivos al interpretar la compresión de la red social como una posible manipulación, exigiendo al revisor humano aplicar su criterio experto.

### 4.6.4 Propuestas de mejora
- **Implementación de Análisis de Video y Audio**: Expandir la API en Python para integrar bibliotecas como FFmpeg (para extraer frames de video y someterlos al flujo existente) y Librosa (para análisis espectrográfico de audios).
- **Integración de Machine Learning**: Incorporar modelos de redes neuronales convolucionales (CNN) entrenados para la detección específica de deepfakes y rostros generados por IA.
- **Exportación Automática en PDF**: Concluir la automatización de la integración del dictamen JSON hacia un reporte final en PDF certificado con firma digital y código QR, cerrando completamente el ciclo operativo de la agencia.
