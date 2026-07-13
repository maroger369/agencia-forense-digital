mkdir -p analysis uploads reports temp && \
touch app.py requirements.txt README.md .gitignore && \
touch analysis/**init**.py && \
touch analysis/exif.py && \
touch analysis/hashes.py && \
touch analysis/ela.py && \
touch analysis/histogram.py && \
touch analysis/noise.py && \
touch analysis/compression.py && \
touch analysis/report.py && \
touch analysis/utils.py

source venv/bin/activate
uvicorn app:app --reload
