import os
import time
import json
import random
import uuid
from collections import deque
from datetime import datetime, timedelta
from flask import Flask, jsonify
from flask_sock import Sock

app = Flask(__name__)
sock = Sock(app)

# Store last 100 events in memory
events = deque(maxlen=100)
insights = deque(maxlen=20)
connected_clients = set()

# Static bee news articles
bee_news = [
    {
        "id": "news-1",
        "title": "New Breakthrough in Bee Disease Prevention",
        "summary": "Researchers have discovered a natural compound that protects honey bees from deadly parasites without harming the bees.",
        "date": "2025-05-10T09:30:00Z",
        "author": "Dr. Emma Johnson",
        "imageUrl": "https://images.unsplash.com/photo-1559131932-f9f845649ded?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YmVlfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60",
        "content": "A team of entomologists from the University of Minnesota has identified a naturally occurring compound that can protect honey bee colonies from Varroa destructor mites, a major threat to bee populations worldwide. The treatment, derived from a common plant extract, has shown 90% effectiveness in field trials without negative impacts on the bees themselves.",
    },
    {
        "id": "news-2",
        "title": "Urban Beekeeping on the Rise",
        "summary": "City dwellers are increasingly turning to beekeeping as both a hobby and environmental action.",
        "date": "2025-05-07T14:15:00Z",
        "author": "Miguel Santos",
        "imageUrl": "https://images.unsplash.com/photo-1593872220969-734d879654e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGJlZWtlZXBlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "content": "Urban beekeeping is experiencing a dramatic surge in popularity, with city permit applications for beehives increasing 300% over the past three years. Environmentally conscious residents are establishing hives on rooftops, backyards, and community gardens, creating vital pollinator habitats within urban environments. Many cities are now updating regulations to accommodate this growing trend while ensuring public safety.",
    },
    {
        "id": "news-3",
        "title": "Wild Bee Species Face Critical Habitat Loss",
        "summary": "A new study shows native bee populations are declining due to rapid loss of natural habitats.",
        "date": "2025-05-03T11:00:00Z",
        "author": "Dr. Sarah Chen",
        "imageUrl": "https://images.unsplash.com/photo-1567951205420-2e6e66d1fa1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d2lsZCUyMGJlZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "content": "A comprehensive 10-year study published in Nature Ecology reveals that wild bee populations have declined by up to 35% in regions experiencing rapid urbanization and agricultural intensification. Unlike managed honey bee colonies, wild bee species cannot be moved to new locations when their habitats are destroyed. Researchers recommend establishing protected wildflower corridors and reducing pesticide use in agricultural settings to support these essential pollinators.",
    },
    {
        "id": "news-4",
        "title": "Innovative Smart Hive Technology Monitors Bee Health",
        "summary": "New IoT-enabled beehives allow beekeepers to remotely monitor colony health and prevent problems.",
        "date": "2025-04-28T16:45:00Z",
        "author": "Lucia Fernandez",
        "imageUrl": "https://images.unsplash.com/photo-1587236987866-f556f0e62048?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YmVlaGl2ZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=500&q=60",
        "content": "A new generation of smart beehives equipped with sensors is transforming how beekeepers monitor and manage their colonies. These high-tech hives continuously track temperature, humidity, weight, and even bee movement patterns. The data is transmitted to smartphone apps that can alert beekeepers to potential issues before they become serious problems. Early adopters report 40% fewer colony losses and significantly improved honey production.",
    },
    {
        "id": "news-5",
        "title": "Record Breaking Honey Harvest in Midwestern States",
        "summary": "Favorable weather conditions lead to exceptional honey production across several states.",
        "date": "2025-04-22T13:20:00Z",
        "author": "James Wilson",
        "imageUrl": "https://images.unsplash.com/photo-1471943311424-646960669fbc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG9uZXl8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60",
        "content": "Beekeepers across Illinois, Iowa, and Wisconsin are reporting record honey harvests this season, with production up 25-30% compared to the five-year average. Experts attribute the bumper crop to ideal weather conditions, including a wet spring that produced abundant wildflowers and a moderate summer without extreme heat waves. The exceptional harvest has helped stabilize honey prices despite increasing demand for natural sweeteners.",
    },
]


def create_event(event_type, message, details=None, image_url=None):
    event = {
        "id": str(uuid.uuid4()),
        "type": event_type,
        "timestamp": datetime.now().isoformat(),
        "message": message,
        "details": details,
        "imageUrl": image_url,
    }
    events.appendleft(event)
    print(f"Created event: {json.dumps(event, indent=2)}")  # Debug log
    return event


def create_insight(title, description):
    insight = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "timestamp": datetime.now().isoformat(),
    }
    insights.appendleft(insight)
    return insight


def broadcast_event(event, exclude_client=None):
    print(f"Broadcasting event: {json.dumps(event, indent=2)}")  # Debug log
    dead_clients = set()
    for client in connected_clients:
        if client != exclude_client:
            try:
                client.send(json.dumps(event))
                print(f"Successfully sent event to a client")  # Debug log
            except Exception as e:
                print(f"Failed to send event to client: {e}")  # Debug log
                dead_clients.add(client)

    # Clean up dead clients
    connected_clients.difference_update(dead_clients)


def process_frame(frame_data):
    """Simulate AI processing of a frame"""
    # Randomly decide if we detect something interesting
    if random.random() < 0.6:  # 60% chance of detection
        detection_type = random.choice(["predator", "normal_activity"])
        if detection_type == "predator":
            event = create_event(
                "predator",
                "Potential predator detected",
                details=f"Confidence: {random.randint(70, 99)}%",
            )
        else:
            activity_level = random.choice(["low", "normal", "high", "swarming"])
            event = create_event(
                "normal_activity",
                f"Bee activity level: {activity_level}",
                details=f"Estimated bee count: {random.randint(50, 2000)}",
            )
        return event
    return None


# REST endpoints for getting historical data
@app.route("/api/events")
def get_events():
    return jsonify(list(events))


@app.route("/api/insights")
def get_insights():
    return jsonify(list(insights))


@app.route("/api/news")
def get_news():
    return jsonify(bee_news)


@sock.route("/live")
def live(ws):
    client_id = str(uuid.uuid4())
    print(f"WebSocket client {client_id} connected.")
    connected_clients.add(ws)

    # Send initial system status
    # try:
    #     status_event = create_event('system', 'Connected to backend', 'WebSocket connection established')
    #     print(f"Sending initial status event: {json.dumps(status_event, indent=2)}")  # Debug log
    #     ws.send(json.dumps(status_event))
    # except Exception as e:
    #     print(f"Error sending initial status to {client_id}: {e}")
    #     return

    try:
        while True:
            try:
                data = ws.receive()
                message = json.loads(data)
                print(
                    f"Received data from client {client_id}: {message.get('type', 'unknown')}"
                )

                if message.get("type") == "frame":
                    frame_data = message.get("data", {})
                    print(
                        f"Frame received from {client_id}, deviceId: {frame_data.get('deviceId')}"
                    )

                    # Process the frame and potentially generate an event
                    event = process_frame(frame_data)
                    if event:
                        broadcast_event(event)

            except json.JSONDecodeError as e:
                print(f"Received invalid JSON from {client_id}: {data}")
                print(f"JSON decode error: {e}")
            except Exception as e:
                if ws.connected:
                    print(f"Error processing message from {client_id}: {e}")
                break

    except Exception as e:
        print(f"WebSocket error with client {client_id}: {e}")
    finally:
        connected_clients.discard(ws)
        print(f"WebSocket client {client_id} disconnected.")


if __name__ == "__main__":
    # Create some initial insights
    create_insight(
        "System Initialized", "Bee monitoring system is now active and collecting data."
    )

    create_insight(
        "Seasonal Activity Pattern",
        "Bees are showing typical spring foraging patterns with increased activity in the morning hours.",
    )

    create_insight(
        "Queen Health Status",
        "The queen bee appears healthy based on worker bee movement patterns around the hive entrance.",
    )

    create_insight(
        "Predator Risk Assessment",
        "Low risk of predator activity in the current environment based on recent monitoring data.",
    )

    create_insight(
        "Hive Population Trend",
        "Hive population shows a 12% increase over the past week, indicating a healthy reproduction rate.",
    )

    port = int(os.environ.get("PORT", 8080))
    print(f"Starting Flask POC backend on port {port}...")
    app.run(host="0.0.0.0", port=port, debug=True)
