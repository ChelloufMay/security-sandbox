# Use official Python image
FROM python:3.11-slim

# set workdir
WORKDIR /app

# Keep layer small + avoid cache leftover
ENV PYTHONUNBUFFERED=1

# install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
  && rm -rf /var/lib/apt/lists/*

# copy requirements if you have one; otherwise install common libs
COPY ./requirements.txt /app/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt

# copy project
COPY . /app

# make scripts executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]
