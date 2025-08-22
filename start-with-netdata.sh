#!/bin/bash

# Start Netdata in the background
echo "Starting Netdata monitoring..."
netdata -c ./netdata-config.conf -D &
NETDATA_PID=$!

# Wait a moment for Netdata to start
sleep 3

# Check if Netdata started successfully
if ps -p $NETDATA_PID > /dev/null; then
    echo "Netdata started successfully on port 19998"
    echo "Netdata dashboard will be available at: https://gamoiwere.ge:19998"
else
    echo "Failed to start Netdata"
fi

# Start the main application
echo "Starting main application..."
npm run dev

# Clean up function
cleanup() {
    echo "Shutting down services..."
    if ps -p $NETDATA_PID > /dev/null; then
        kill $NETDATA_PID
        echo "Netdata stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for the main process
wait