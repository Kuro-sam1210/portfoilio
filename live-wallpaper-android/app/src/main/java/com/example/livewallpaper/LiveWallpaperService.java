package com.example.livewallpaper;

import android.content.SharedPreferences;
import android.graphics.Canvas;
import android.graphics.Movie;
import android.media.MediaPlayer;
import android.net.Uri;
import android.service.wallpaper.WallpaperService;
import android.view.SurfaceHolder;
import android.widget.VideoView;
import java.io.FileInputStream;
import java.io.IOException;

public class LiveWallpaperService extends WallpaperService {

    @Override
    public Engine onCreateEngine() {
        return new LiveWallpaperEngine();
    }

    private class LiveWallpaperEngine extends Engine implements SharedPreferences.OnSharedPreferenceChangeListener {

        private MediaPlayer mediaPlayer;
        private Movie gifMovie;
        private long movieStart;
        private String filePath;
        private String fileType;
        private boolean isGif;

        @Override
        public void onCreate(SurfaceHolder surfaceHolder) {
            super.onCreate(surfaceHolder);

            SharedPreferences prefs = getSharedPreferences("wallpaper_prefs", MODE_PRIVATE);
            prefs.registerOnSharedPreferenceChangeListener(this);

            loadWallpaperSettings();
        }

        @Override
        public void onDestroy() {
            super.onDestroy();
            releaseResources();
        }

        @Override
        public void onVisibilityChanged(boolean visible) {
            if (visible) {
                if (isGif && gifMovie != null) {
                    movieStart = android.os.SystemClock.uptimeMillis();
                } else if (!isGif && mediaPlayer != null) {
                    mediaPlayer.start();
                }
            } else {
                if (!isGif && mediaPlayer != null) {
                    mediaPlayer.pause();
                }
            }
        }

        @Override
        public void onSurfaceCreated(SurfaceHolder holder) {
            super.onSurfaceCreated(holder);
            if (isGif && gifMovie != null) {
                drawGif(holder);
            }
        }

        @Override
        public void onSurfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            super.onSurfaceChanged(holder, format, width, height);
            if (!isGif && mediaPlayer != null) {
                mediaPlayer.setSurface(holder.getSurface());
            }
        }

        @Override
        public void onSurfaceDestroyed(SurfaceHolder holder) {
            super.onSurfaceDestroyed(holder);
            if (!isGif && mediaPlayer != null) {
                mediaPlayer.pause();
            }
        }

        private void loadWallpaperSettings() {
            SharedPreferences prefs = getSharedPreferences("wallpaper_prefs", MODE_PRIVATE);
            filePath = prefs.getString("file_path", null);
            fileType = prefs.getString("file_type", null);

            if (filePath != null && fileType != null) {
                isGif = "gif".equals(fileType);
                if (isGif) {
                    loadGif();
                } else {
                    loadVideo();
                }
            }
        }

        private void loadGif() {
            try {
                FileInputStream fis = new FileInputStream(filePath);
                gifMovie = Movie.decodeStream(fis);
                fis.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        private void loadVideo() {
            releaseResources();
            mediaPlayer = new MediaPlayer();
            try {
                mediaPlayer.setDataSource(filePath);
                mediaPlayer.setSurface(getSurfaceHolder().getSurface());
                mediaPlayer.setLooping(true);
                mediaPlayer.prepare();
                if (isVisible()) {
                    mediaPlayer.start();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        private void drawGif(SurfaceHolder holder) {
            if (gifMovie == null) return;

            Canvas canvas = null;
            try {
                canvas = holder.lockCanvas();
                if (canvas != null) {
                    canvas.drawColor(android.graphics.Color.BLACK);

                    long now = android.os.SystemClock.uptimeMillis();
                    if (movieStart == 0) {
                        movieStart = now;
                    }

                    int duration = gifMovie.duration();
                    if (duration == 0) {
                        duration = 1000;
                    }

                    int relTime = (int) ((now - movieStart) % duration);
                    gifMovie.setTime(relTime);

                    float scaleX = (float) canvas.getWidth() / gifMovie.width();
                    float scaleY = (float) canvas.getHeight() / gifMovie.height();
                    float scale = Math.max(scaleX, scaleY);

                    int scaledWidth = (int) (gifMovie.width() * scale);
                    int scaledHeight = (int) (gifMovie.height() * scale);

                    int x = (canvas.getWidth() - scaledWidth) / 2;
                    int y = (canvas.getHeight() - scaledHeight) / 2;

                    canvas.save();
                    canvas.scale(scale, scale);
                    canvas.translate(x / scale, y / scale);
                    gifMovie.draw(canvas, 0, 0);
                    canvas.restore();
                }
            } finally {
                if (canvas != null) {
                    holder.unlockCanvasAndPost(canvas);
                }
            }

            if (isVisible()) {
                getHandler().postDelayed(() -> drawGif(holder), 16); // ~60 FPS
            }
        }

        private void releaseResources() {
            if (mediaPlayer != null) {
                mediaPlayer.release();
                mediaPlayer = null;
            }
            gifMovie = null;
        }

        @Override
        public void onSharedPreferenceChanged(SharedPreferences sharedPreferences, String key) {
            if ("file_path".equals(key) || "file_type".equals(key)) {
                loadWallpaperSettings();
            }
        }
    }

    public static void setWallpaperFile(android.content.Context context, String filePath, String fileType) {
        SharedPreferences prefs = context.getSharedPreferences("wallpaper_prefs", MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString("file_path", filePath);
        editor.putString("file_type", fileType);
        editor.apply();
    }
}