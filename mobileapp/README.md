# JägerADS Mobile App

**The official mobile application for JägerADS - an AI-driven beekeeping assistant designed to help beekeepers monitor hive health and protect pollinators.**

This React Native mobile application serves as the primary interface for beekeepers to interact with the JägerADS system. It provides real-time monitoring of beehives, alerts for unusual conditions, and a comprehensive dashboard of hive health metrics, all powered by our advanced computer vision AI backend.

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Running the App](#running-the-app)
-   [App Structure](#app-structure)
-   [Contributing](#contributing)
-   [License](#license)

## Features

-   **Real-time Hive Monitoring**: Stream live video feed from your hive cameras
-   **AI-Powered Detection**: See real-time analysis of bee presence and activity
-   **Event Log**: Track historical data and events for all connected hives
-   **News Feed**: Stay updated with the latest beekeeping news and research
-   **Responsive Design**: Works across multiple device sizes and orientations

## Technology Stack

-   **Framework**: React Native with Expo
-   **Navigation**: React Navigation (Tab-based and Stack-based)
-   **State Management**: React Context API
-   **Networking**: WebSocket for real-time data, REST API for static content
-   **UI Components**: Custom themed components with consistent styling
-   **Animations**: React Native Animated API for smooth transitions

## Getting Started

### Prerequisites

-   Node.js (v16.0 or higher)
-   npm or yarn
-   Expo CLI
-   iOS/Android device or emulator

### Installation

1. Clone the repository:

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Configure the backend connection:
    - Open `constants/Config.ts`
    - Update the `BACKEND_CONFIG.API_BASE` and `BACKEND_CONFIG.WS_URL` to point to your backend server

### Running the App

-   Start the Expo development server:

```bash
npx expo start
```

-   Open the app on your device:
    -   Use the Expo Go app to scan the QR code
    -   Press 'i' or 'a' in the terminal to open in iOS or Android emulator

## App Structure

-   **app/**: Main application screens and navigation
    -   **(tabs)/**: Tab-based navigation screens
        -   **index.tsx**: Home screen with camera feed
        -   **logs.tsx**: Event log screen
        -   **news.tsx**: News feed screen
    -   **index.tsx**: Landing/authentication screen
-   **components/**: Reusable UI components

    -   **ThemedText.tsx**: Text component with consistent styling
    -   **ThemedView.tsx**: Container component with theming
    -   **HapticTab.tsx**: Tab navigation with haptic feedback

-   **constants/**: App configuration and styling constants

    -   **Colors.ts**: Color palette definitions
    -   **Config.ts**: Backend URLs and app configuration
    -   **Styles.ts**: Common style patterns

-   **contexts/**: React Context providers

    -   **BackendServiceContext.tsx**: Websocket and API service provider

-   **services/**: Business logic separated from UI
    -   **BackendService.ts**: API communication handler
