# syntax=docker/dockerfile:1.7
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DATA_DIR=/data

WORKDIR /app
COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip pip install -r requirements.txt

RUN groupadd --system --gid 1001 luk && useradd --system --uid 1001 --gid luk --home /app luk \
  && mkdir -p /data && chown luk:luk /data
COPY --chown=luk:luk lukwolfly_bot ./lukwolfly_bot
USER luk
VOLUME ["/data"]

# Ponto de entrada: crie lukwolfly_bot/__main__.py
CMD ["python", "-m", "lukwolfly_bot"]
