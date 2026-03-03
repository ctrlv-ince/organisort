#!/bin/bash
# Start the Python AI service in the background
echo "Starting Python AI Service..."
cd python-service
python app.py &
PYTHON_PID=$!
cd ..

# Wait for the python service to be ready...
sleep 5

# Start the Node.js backend in the foreground
echo "Starting Node.js Backend..."
npm start

# If the backend exits, stop the python service as well
kill $PYTHON_PID
