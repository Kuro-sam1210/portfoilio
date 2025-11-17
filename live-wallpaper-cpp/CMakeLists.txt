cmake_minimum_required(VERSION 3.10)

project(LiveWallpaperClone VERSION 1.0)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED True)

# Add executable as Win32 app
add_executable(${PROJECT_NAME} WIN32 src/main.cpp)

# Link Windows libraries
target_link_libraries(${PROJECT_NAME} d3d11.lib dxgi.lib mf.lib mfplat.lib mfreadwrite.lib windowscodecs.lib)

# Define UNICODE
target_compile_definitions(${PROJECT_NAME} PRIVATE UNICODE _UNICODE)