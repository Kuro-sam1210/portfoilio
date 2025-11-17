# Live Wallpaper Clone

A Windows application that displays animated GIFs as live wallpapers behind the desktop icons, similar to Wallpaper Engine.

## Building

Requires Visual Studio with C++ workload and CMake installed.

1. Open command prompt in the project directory.
2. Run `cmake -S . -B build`
3. Run `cmake --build build`

## Usage

Run `LiveWallpaperClone.exe`

If no command-line argument is provided, a file selection dialog will appear where you can choose a GIF file. Alternatively, you can provide the GIF file path as a command-line argument: `LiveWallpaperClone.exe "path\to\file.gif"`

The application will create a full-screen window positioned behind the desktop icons and display the animated GIF.

## Features

- Loads and animates GIF files using Windows Imaging Component
- Positions the wallpaper window behind desktop icons using the WorkerW method
- Full-screen DirectX 11 rendering
- Loop playback of animations
- Command-line file input

## Notes

- Currently supports GIF files; video support can be added similarly using Media Foundation
- Tested on single monitor setups
- Requires Windows 10/11 with DirectX 11 support