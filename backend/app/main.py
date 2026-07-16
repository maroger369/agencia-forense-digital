from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
import uuid
import os
from fastapi.staticfiles import StaticFiles

from app.services.exif import analyze_exif
from app.services.hashes import analyze_hashes
from app.services.ela import analyze_ela
from app.services.histogram import analyze_histogram
from app.services.noise import analyze_noise
from app.services.compression import analyze_compression

app = FastAPI(
    title="Image Forensic API",
    description="API de análisis forense de imágenes",
    version="1.0.0",
)


# ==========================
# CORS CONFIGURATION
# ==========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"

UPLOAD_DIR = DATA_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
TEMP_DIR = DATA_DIR / "temp"
TEMP_DIR.mkdir(parents=True, exist_ok=True)

app.mount("/temp", StaticFiles(directory=str(TEMP_DIR)), name="temp")
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}


@app.get("/")
def root():
    return {"message": "Image Forensic API", "status": "running"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...), folder: str = Form("evidencias")):
    extension = Path(file.filename).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Formato de imagen no soportado.")

    filename = f"{uuid.uuid4()}{extension}"
    target_dir = UPLOAD_DIR / folder
    target_dir.mkdir(parents=True, exist_ok=True)
    filepath = target_dir / filename

    print(f"💾 Guardando archivo permanentemente: {filepath}")

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{folder}/{filename}",
        "filename": f"{folder}/{filename}"
    }


@app.post("/analyze")
async def analyze_image(filename: str = Form(...), original_name: str = Form(...)):

    print(f"📥 Solicitud de análisis para: {filename}")
    filepath = UPLOAD_DIR / filename

    if not filepath.exists():
        raise HTTPException(status_code=404, detail="El archivo especificado no existe.")

    try:
        print("🔍 Iniciando análisis forense...")

        exif = analyze_exif(filepath)
        print("✅ EXIF:", exif)

        hashes = analyze_hashes(filepath)
        print("✅ Hashes:", hashes)

        ela = analyze_ela(filepath, TEMP_DIR)
        print("✅ ELA:", ela)

        histogram = analyze_histogram(filepath)
        print("✅ Histograma:", histogram)

        noise = analyze_noise(filepath)
        print("✅ Ruido:", noise)

        compression = analyze_compression(filepath)
        print("✅ Compresión:", compression)

        result = {
            "file": {
                "original_name": original_name,
                "saved_name": filename,
                "path": str(filepath),
            },
            "exif": exif,
            "hashes": hashes,
            "ela": ela,
            "histogram": histogram,
            "noise": noise,
            "compression": compression,
        }

        print("📊 Resultado final generado exitosamente.")
        return JSONResponse(result)

    except Exception as e:
        print(f"❌ Error durante el análisis: {e}")
        raise HTTPException(status_code=500, detail=f"Error interno en análisis: {str(e)}")
