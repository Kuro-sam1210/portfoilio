# Live Wallpaper Android App

An Android application that allows users to set GIF or video files as live wallpapers.

## Features

- File picker for selecting GIF and video files
- Preview functionality for selected media
- Live wallpaper service for GIF/video playback
- Easy wallpaper setting integration

## Setup Instructions

1. Clone or download the project files
2. Open the project in Android Studio
3. Build and run the application on your device or emulator
4. Grant necessary permissions when prompted
5. Select a GIF or video file
6. Preview the media
7. Set it as your live wallpaper

## Permissions

The app requires the following permissions:
- READ_EXTERNAL_STORAGE (for Android < 13)
- READ_MEDIA_VIDEO (for Android 13+)
- READ_MEDIA_IMAGES (for Android 13+)

## Dependencies

- AndroidX AppCompat
- Google Material Components
- Glide (for GIF handling)

## How to Use

1. Launch the app
2. Tap "Select GIF/Video File" to choose a media file
3. Preview the selected file
4. Tap "Set as Wallpaper" to apply it as your live wallpaper
5. Go to your device's wallpaper settings and select the Live Wallpaper option

## Requirements

- Android API level 21 (Android 5.0) or higher
- Device with live wallpaper support