#!/bin/bash

# Test adding text segments to a note

# First, create a test note
echo "Creating test note..."
RESPONSE=$(curl -s -X POST http://localhost:4000/api/notes \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Original content",
    "color": "#FEF3C7",
    "textColor": "#1F2937",
    "fontFamily": "Arial",
    "fontWeight": "400",
    "fontSize": "14px",
    "x": 100,
    "y": 100,
    "rotation": 0,
    "isLocked": false
  }')

echo "Create response: $RESPONSE"
NOTE_ID=$(echo $RESPONSE | grep -o '"id":[0-9]*' | grep -o '[0-9]*')
echo "Created note ID: $NOTE_ID"

# Wait a moment
sleep 1

# Now add text segments
echo -e "\nAdding text segments..."
UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:4000/api/notes/$NOTE_ID \
  -H "Content-Type: application/json" \
  -d '{
    "textSegments": [
      {
        "content": " Additional text 1",
        "textColor": "#FF0000",
        "fontFamily": "Georgia",
        "fontWeight": "700",
        "fontSize": "16px"
      },
      {
        "content": " Additional text 2",
        "textColor": "#0000FF",
        "fontFamily": "Courier",
        "fontWeight": "400",
        "fontSize": "12px"
      }
    ]
  }')

echo "Update response: $UPDATE_RESPONSE"

# Get the note to verify
echo -e "\nGetting updated note..."
GET_RESPONSE=$(curl -s http://localhost:4000/api/notes/$NOTE_ID)
echo "Get response: $GET_RESPONSE"

echo -e "\nDone!"
