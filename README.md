# 📁 API Forense – Plataforma de Certificación Digital

## 📖 Visión General

Esta solución es una **plataforma web full‑stack** que permite a una agencia de análisis forense digital generar certificados PDF con evidencia, códigos QR y reportes automáticos. Los usuarios pueden subir imágenes, pagar por análisis, y obtener un certificado firmado con un hash verificable.

- **Frontend**: **Next.js 14** (TypeScript, Tailwind‑CSS, `next-themes` para modo claro/oscuro). 
- **Backend**: **FastAPI** (Python) expone endpoints para gestión de evidencias, pagos y generación de PDFs. 
- **Base de datos**: **SQLite** en desarrollo y **Turso (SQLite server‑less)** en producción, accedido mediante Prisma y el adaptador `@prisma/adapter‑libsql`.
- **Despliegue**: **Vercel** para el frontend y **Render** para el backend.

> **Nota**: Todos los recursos estáticos generados por los usuarios (uploads, PDFs, QR) se guardan en el directorio `public/uploads/` y no forman parte del repositorio (están ignorados en `.gitignore`).

---

## 🛠️ Stack Tecnológico

| Área | Tecnologías |
|------|-------------|
| **Frontend** | Next.js 14, React 18, TypeScript, Tailwind CSS, `next-themes`, `lucide-react` |
| **Backend** | FastAPI, Uvicorn, Python 3.12, Pillow, OpenCV‑headless, imagehash, requests |
| **Base de datos** | Prisma ORM, SQLite (dev), Turso (producción) |
| **Autenticación** | JWT en cookies HttpOnly |
| **Despliegue** | Vercel (frontend), Render (backend) |
| **CI/CD** | GitHub Actions (opcional) |

---

## 📦 Características Principales

- **Registro / login** con JWT y protección de rutas vía middleware.
- **Gestión de evidencias**: subida de imágenes, revisión de estado, generación de pagos.
- **Análisis forense** (ELA, EXIF, histogram, etc.) – ejecutado en el backend.
- **Generación de certificado PDF** con QR que contiene el hash de la evidencia.
- **Modo claro/oscuro** con animaciones fluidas y diseño glassmorphism.
- **Soporte multilingüe** (código preparado para i18n si se desea).

---

## 📦 Requisitos Previos

| Herramienta | Versión mínima |
|-------------|----------------|
| **Node.js** | 20.x |
| **pnpm** | 8.x |
| **Python** | 3.12 |
| **Git** | cualquier versión |
| **Cuenta Turso** | gratuita (para producción) |
| **Cuenta Vercel** | para despliegue del frontend |
| **Cuenta Render** | para despliegue del backend |

---

## 🚀 Desarrollo Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/davidt369/api-python-forense.git
cd api-python-forense
```

### 2. Backend (FastAPI)
```bash
# Crear entorno virtual
python -m venv .venv
source .venv/Scripts/activate   # en Windows
# Instalar dependencias
pip install -r backend/requirements.txt
# Ejecutar servidor de desarrollo
uvicorn backend/app.main:app --reload
```
El API estará disponible en `http://localhost:8000`.

### 3. Frontend (Next.js)
```bash
# Instalar dependencias
pnpm install
# Copiar ejemplo de variables de entorno
cp .env.example .env
# Editar .env si quieres cambiar puertos o usar la base SQLite local (por defecto)
# Iniciar servidor de desarrollo
pnpm dev
```
Visita `http://localhost:3000`.

### 4. Base de datos local
El proyecto crea automáticamente `frontend/dev.db` (SQLite) al ejecutar Prisma. No es necesario hacer nada más.

---

## 🗄️ Configuración de Turso (Producción)

1. Regístrate en **[turso.tech](https://turso.tech)** y crea una base de datos.
2. Copia la **Database URL** (ej.: `libsql://<id>.turso.io`) y el **Auth Token**.
3. Añade estas variables a los *Environment Variables* de Vercel y Render:
   ```env
   TURSO_DATABASE_URL="libsql://<id>.turso.io"
   TURSO_AUTH_TOKEN="<token>"
   ```
4. En producción el código de `frontend/app/lib/prisma.ts` elegirá automáticamente estas variables; en desarrollo seguirá usando `DATABASE_URL` o el archivo `dev.db`.

---

## 📦 Despliegue a Producción

### Frontend → Vercel
1. Conecta tu repositorio GitHub a Vercel.
2. En la configuración del proyecto, añade las variables de entorno del paso anterior (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`, `NEXT_PUBLIC_API_URL` apuntando al endpoint de Render).
3. Vercel detecta automáticamente que es un proyecto **Next.js** y ejecuta `pnpm install && pnpm build`.
4. Después de la compilación, la URL preview será algo como `https://<project>.vercel.app`.

### Backend → Render
1. En Render, crea un nuevo *Web Service*.
2. Selecciona **Python** como entorno.
3. En **Build Command** escribe:
   ```bash
   cd backend && pip install -r requirements.txt
   ```
4. En **Start Command** escribe:
   ```bash
   cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
5. Añade las mismas variables de entorno (`TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`).
6. Render asignará automáticamente un puerto (`$PORT`) que debes exponer en la variable `NEXT_PUBLIC_API_URL` del frontend.

> **Tip**: Si deseas usar un dominio propio, configura DNS CNAME en Vercel y Render.

---

## 📂 Estructura del Proyecto
```
api-python-forense/
├─ backend/                 # FastAPI
│   ├─ app/
│   │   ├─ main.py
│   │   └─ ...
│   └─ requirements.txt
├─ frontend/                # Next.js
│   ├─ app/                 # Rutas Next.js (pages)
│   │   ├─ layout.tsx
│   │   ├─ page.tsx (landing)
│   │   ├─ admin/ …
│   │   └─ api/ …
│   ├─ lib/                 # Prisma client, utils, PDF generator
│   ├─ components/          # UI (glassmorphism, theme toggle)
│   ├─ public/              # Assets, uploads (runtime only)
│   ├─ prisma/              # schema.prisma
│   ├─ .env.example
│   ├─ .gitignore
│   └─ package.json
├─ render.yaml              # Blueprint para Render (backend)
├─ .github/                # (opcional) workflows CI
└─ README.md               # <‑‑ ESTE ES EL ARCHIVO RECIÉN CREADO
```

---

## 🔐 Seguridad y Buenas Prácticas
- ** Nunca** comprometas el archivo `.env` ni los tokens de Turso en el repositorio. Usa `.env.example` como plantilla.
- **JWT_SECRET** debe ser una cadena larga y aleatoria; mantenla en los entornos de Vercel/Render.
- **HTTPS** está garantizado por Vercel y Render; los cookies HttpOnly hacen que los tokens no sean accesibles por JavaScript.
- **Rate limiting** y **validación de ficheros** pueden añadirse al backend para prevenir abusos (no incluido en este MVP).

---

## 📜 Licencia
Este proyecto está bajo licencia **MIT**. Consulta el archivo `LICENSE` para más detalles.

---

## 🤝 Contribuciones
1. Fork the repository.
2. Crea una rama (`git checkout -b feature/awesome-feature`).
3. Haz commit de tus cambios siguiendo el **convention** `type: description` (ej.: `feat: add dark mode toggle`).
4. Abre un Pull Request.

---

## 📞 Contacto
**David Torres** – desarrollador principal
- GitHub: https://github.com/davidt369
- Email: david@example.com

---

¡Listo! Con este README puedes **entender rápidamente** el proyecto, **levantarlo localmente** y **desplegarlo** a producción usando Turso, Vercel y Render.
