# Jager ADS Mobile App

**The official mobile application for Jager ADS - an AI-driven beekeeping assistant designed to help beekeepers monitor hive health and protect pollinators.**

This React Native mobile application serves as the primary interface for beekeepers to interact with the Jager ADS system. It provides real-time monitoring of beehives, alerts for unusual conditions, and a comprehensive dashboard of hive health metrics, all powered by our advanced computer vision AI backend.

## Table of Contents

-   [Features](#features)
-   [Technology Stack](#technology-stack)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
        -   [Install Development Tools](#1-install-development-tools)
        -   [Set Up the Project](#2-set-up-the-project)
    -   [Running the App](#running-the-app)
        -   [Using Expo Dev Client](#using-expo-dev-client)
        -   [Development Build](#development-build-recommended-for-testing-native-features)
        -   [Troubleshooting](#troubleshooting-common-issues)
-   [App Structure](#app-structure)
-   [Environment Variables](#environment-variables)
-   [Building for Production](#building-for-production)
    -   [Android Production Build](#android-production-build)
    -   [iOS Production Build](#ios-production-build-macos-only)
    -   [Configuration Options](#configuration-options)
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
-   npm (v7.0 or higher) or yarn (v1.22 or higher)
-   Git

For Android development:

-   Android Studio (latest version recommended)
-   Java Development Kit (JDK) 11 or newer
-   Android SDK with platform tools
-   An Android Virtual Device (AVD) or a physical Android device

For iOS development (macOS only):

-   Xcode (latest version recommended)
-   CocoaPods
-   A physical iOS device or simulator

### Installation

#### 1. Install Development Tools

**For Windows/Linux/macOS:**

1. Install Node.js and npm:

    - Download and install from [Node.js official website](https://nodejs.org/)
    - Verify installation:
        ```bash
        node --version
        npm --version
        ```

2. Install Expo CLI:
    ```bash
    npm install -g expo-cli
    ```

**For Android Development:**

1. Install Android Studio:

    - Download from [Android Developer website](https://developer.android.com/studio)
    - During installation, ensure you select:
        - Android SDK
        - Android SDK Platform
        - Android Virtual Device

2. Configure Android SDK:

    - Open Android Studio
    - Go to Settings/Preferences > Appearance & Behavior > System Settings > Android SDK
    - In the SDK Platforms tab, select Android 13 (API Level 33) or newer
    - In the SDK Tools tab, select:
        - Android SDK Build-Tools
        - Android Emulator
        - Android SDK Platform-Tools
    - Click "Apply" to install the selected components

3. Configure environment variables:

    - Add ANDROID_HOME to your path (typically `C:\Users\<Your Username>\AppData\Local\Android\Sdk` on Windows or `/Users/<Your Username>/Library/Android/sdk` on macOS)
    - Add platform-tools to your path (`%ANDROID_HOME%\platform-tools` on Windows or `$ANDROID_HOME/platform-tools` on macOS/Linux)

4. Create an Android Virtual Device (AVD):
    - Open Android Studio
    - Go to Tools > AVD Manager
    - Click "Create Virtual Device"
    - Select a device (e.g., Pixel 6) and click "Next"
    - Select a system image (e.g., Android 13) and click "Next"
    - Name your AVD and click "Finish"

**For iOS Development (macOS only):**

1. Install Xcode from the App Store

2. Install Xcode Command Line Tools:

    ```bash
    xcode-select --install
    ```

3. Install CocoaPods:
    ```bash
    sudo gem install cocoapods
    ```

#### 2. Set Up the Project

1. Clone the repository:

    ```bash
    git clone <repository-url>
    cd mobileapp
    ```

2. Install project dependencies:

    ```bash
    npm install
    # or
    yarn install
    ```

3. Configure the backend connection:
    - Copy the `.env.example` file to create a new `.env` file:
        ```bash
        cp .env.example .env
        ```
    - Open the `.env` file in your editor and update the backend URLs to point to your development and production servers

### Running the App

#### Using Expo Dev Client

1. Start the Expo development server:

    ```bash
    npx expo start
    ```

2. Run on a physical device:

    - Install the Expo Go app on your device:
        - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
        - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
    - Make sure your device is on the same Wi-Fi network as your computer
    - Scan the QR code shown in the terminal or Expo Dev Tools using:
        - iOS: Camera app
        - Android: Expo Go app

3. Run on an emulator/simulator:

    - For Android:

        - Start your Android emulator from Android Studio or command line:
            ```bash
            # List available AVDs
            emulator -list-avds
            # Start a specific AVD
            emulator -avd <avd_name>
            ```
        - In the Expo terminal, press 'a' to open on Android emulator

    - For iOS (macOS only):
        - Make sure your simulator is installed with Xcode
        - In the Expo terminal, press 'i' to open on iOS simulator

#### Development Build (Recommended for Testing Native Features)

For testing native features that aren't supported in Expo Go, create a development build:

1. Install EAS CLI:

    ```bash
    npm install -g eas-cli
    ```

2. Log in to your Expo account:

    ```bash
    eas login
    ```

3. Create a development build:

    - For Android:
        ```bash
        eas build --profile development --platform android
        ```
    - For iOS (macOS only):
        ```bash
        eas build --profile development --platform ios
        ```

4. Install the development build:

    - Download the build from the URL provided by EAS
    - Install it on your device/emulator

5. Start the development server:
    ```bash
    npx expo start --dev-client
    ```

#### Troubleshooting Common Issues

-   **Metro Bundler Issues**:

    ```bash
    npx expo start --clear
    ```

-   **Android Emulator Connection Issues**:

    -   Ensure ADB is running: `adb devices`
    -   Try running: `adb reverse tcp:8081 tcp:8081`

-   **iOS Simulator Issues**:
    -   Reset the simulator: Device > Erase all content and settings
    -   Reinstall the Expo Go app

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
-   **types/**: TypeScript type definitions
    -   **backend.ts**: Types for backend communication
    -   **env.d.ts**: Type declarations for environment variables

## Environment Variables

The application uses environment variables to manage backend URLs and other configuration settings. These are loaded from an `.env` file in the root directory:

-   **DEV_WS_URL**: WebSocket URL for development environment
-   **DEV_API_BASE**: REST API base URL for development environment
-   **PROD_WS_URL**: WebSocket URL for production environment
-   **PROD_API_BASE**: REST API base URL for production environment

To set up your environment:

1. Copy the `.env.example` file to `.env`
2. Update the URLs to point to your backend servers
3. The app will automatically use development URLs when in dev mode and production URLs in production mode

## Building for Production

### Android Production Build

1. Ensure you have set up your Android keystore for signing:

    ```bash
    eas credentials
    ```

2. Create a production build:

    ```bash
    # For internal testing
    eas build --platform android --profile preview

    # For store submission
    eas build --platform android --profile production
    ```

3. Submit to Google Play Store:
    ```bash
    eas submit -p android
    ```

### iOS Production Build (macOS only)

1. Set up your iOS credentials (certificates and provisioning profiles):

    ```bash
    eas credentials
    ```

2. Create a production build:

    ```bash
    # For TestFlight
    eas build --platform ios --profile preview

    # For App Store
    eas build --platform ios --profile production
    ```

3. Submit to App Store:
    ```bash
    eas submit -p ios
    ```

### Configuration Options

For advanced configuration, you can modify:

-   **app.json**: Main Expo configuration file including app name, version, etc.
-   **eas.json**: EAS Build configuration for different build profiles
-   **android/app/build.gradle**: Android-specific build settings
-   **ios/App/App.xcodeproj**: iOS-specific build settings (macOS only)

## Contributing

We welcome contributions to improve the Jager ADS Mobile App! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit them: `git commit -m 'Add some feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Create a pull request

### Development Guidelines

-   Follow the existing code style and architecture
-   Write clean, maintainable, and testable code
-   Add comments for complex logic
-   Update documentation as necessary
-   Test your changes thoroughly

## License

This project is licensed under the MIT License - see the LICENSE file for details.

© 2025 Catfish Con. All rights reserved.
