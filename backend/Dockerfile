#Python base image for ML tasks
FROM python:3.10-slim

# Install Node.js, npm, and required system libraries for image processing
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# 1. Install Node.js dependencies
COPY package*.json ./
RUN npm install

# 2. Install Python dependencies 
COPY python-service/requirements.txt ./python-service/
RUN pip install --no-cache-dir -r python-service/requirements.txt

# 3. Copy all of your code over
COPY . .

# 4. Make the startup script executable
RUN chmod +x start.sh

# Expose the mandatory Hugging Face port
EXPOSE 7860

# Run the startup script to boot both servers
CMD ["./start.sh"]