package com.example.livewallpaper;

import android.Manifest;
import android.app.WallpaperManager;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.VideoView;
import android.widget.ImageView;
import android.graphics.drawable.Drawable;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.bumptech.glide.Glide;
import com.bumptech.glide.load.resource.gif.GifDrawable;

public class MainActivity extends AppCompatActivity {

    private static final int REQUEST_CODE_PICK_FILE = 1;
    private static final int REQUEST_CODE_PERMISSIONS = 2;
    private static final int REQUEST_CODE_SET_WALLPAPER = 3;

    private Button selectFileButton;
    private Button setWallpaperButton;
    private TextView fileInfoTextView;
    private FrameLayout previewContainer;
    private Uri selectedFileUri;
    private String selectedFileType;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initializeViews();
        setupClickListeners();
        checkPermissions();
    }

    private void initializeViews() {
        selectFileButton = findViewById(R.id.selectFileButton);
        setWallpaperButton = findViewById(R.id.setWallpaperButton);
        fileInfoTextView = findViewById(R.id.fileInfoTextView);
        previewContainer = findViewById(R.id.previewContainer);
    }

    private void setupClickListeners() {
        selectFileButton.setOnClickListener(v -> selectFile());
        setWallpaperButton.setOnClickListener(v -> setWallpaper());
    }

    private void checkPermissions() {
        String[] permissions;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions = new String[]{
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.READ_MEDIA_IMAGES
            };
        } else {
            permissions = new String[]{
                Manifest.permission.READ_EXTERNAL_STORAGE
            };
        }

        boolean allGranted = true;
        for (String permission : permissions) {
            if (ContextCompat.checkSelfPermission(this, permission) != PackageManager.PERMISSION_GRANTED) {
                allGranted = false;
                break;
            }
        }

        if (!allGranted) {
            ActivityCompat.requestPermissions(this, permissions, REQUEST_CODE_PERMISSIONS);
        }
    }

    private void selectFile() {
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        String[] mimeTypes = {"video/*", "image/gif"};
        intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes);
        startActivityForResult(intent, REQUEST_CODE_PICK_FILE);
    }

    private void setWallpaper() {
        if (selectedFileUri == null) {
            Toast.makeText(this, "Please select a file first", Toast.LENGTH_SHORT).show();
            return;
        }

        try {
            // Get the file path from URI
            String filePath = getFilePathFromUri(selectedFileUri);
            if (filePath != null) {
                // Set the wallpaper file in the service
                LiveWallpaperService.setWallpaperFile(this, filePath, selectedFileType);

                // Launch the wallpaper chooser
                Intent intent = new Intent(WallpaperManager.ACTION_CHANGE_LIVE_WALLPAPER);
                intent.putExtra(WallpaperManager.EXTRA_LIVE_WALLPAPER_COMPONENT,
                    new android.content.ComponentName(this, LiveWallpaperService.class));
                startActivityForResult(intent, REQUEST_CODE_SET_WALLPAPER);
            } else {
                Toast.makeText(this, "Unable to access selected file", Toast.LENGTH_SHORT).show();
            }
        } catch (Exception e) {
            Toast.makeText(this, "Failed to set wallpaper: " + e.getMessage(), Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);

        if (requestCode == REQUEST_CODE_PICK_FILE && resultCode == RESULT_OK && data != null) {
            selectedFileUri = data.getData();
            if (selectedFileUri != null) {
                String mimeType = getContentResolver().getType(selectedFileUri);
                if (mimeType != null) {
                    if (mimeType.startsWith("video/")) {
                        selectedFileType = "video";
                    } else if (mimeType.equals("image/gif")) {
                        selectedFileType = "gif";
                    } else {
                        Toast.makeText(this, "Unsupported file type", Toast.LENGTH_SHORT).show();
                        return;
                    }
                }

                String fileName = getFileName(selectedFileUri);
                fileInfoTextView.setText("Selected: " + fileName);
                previewFile();
                setWallpaperButton.setEnabled(true);
            }
        } else if (requestCode == REQUEST_CODE_SET_WALLPAPER) {
            if (resultCode == RESULT_OK) {
                Toast.makeText(this, "Wallpaper set successfully!", Toast.LENGTH_SHORT).show();
            } else {
                Toast.makeText(this, "Failed to set wallpaper", Toast.LENGTH_SHORT).show();
            }
        }
    }

    private void previewFile() {
        previewContainer.removeAllViews();

        if ("video".equals(selectedFileType)) {
            VideoView videoView = new VideoView(this);
            videoView.setVideoURI(selectedFileUri);
            videoView.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
            videoView.start();
            previewContainer.addView(videoView);
        } else if ("gif".equals(selectedFileType)) {
            ImageView imageView = new ImageView(this);
            imageView.setLayoutParams(new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
            imageView.setScaleType(ImageView.ScaleType.CENTER_CROP);

            // Using Glide for GIF support
            Glide.with(this)
                .asGif()
                .load(selectedFileUri)
                .into(imageView);

            previewContainer.addView(imageView);
        }
    }

    private String getFileName(Uri uri) {
        String result = null;
        if (uri.getScheme().equals("content")) {
            try (android.database.Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int nameIndex = cursor.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME);
                    if (nameIndex >= 0) {
                        result = cursor.getString(nameIndex);
                    }
                }
            }
        }
        if (result == null) {
            result = uri.getPath();
            int cut = result.lastIndexOf('/');
            if (cut != -1) {
                result = result.substring(cut + 1);
            }
        }
        return result;
    }

    private String getFilePathFromUri(Uri uri) {
        String filePath = null;
        if ("content".equals(uri.getScheme())) {
            try (android.database.Cursor cursor = getContentResolver().query(uri, null, null, null, null)) {
                if (cursor != null && cursor.moveToFirst()) {
                    int pathIndex = cursor.getColumnIndex("_data");
                    if (pathIndex >= 0) {
                        filePath = cursor.getString(pathIndex);
                    }
                }
            }
        } else if ("file".equals(uri.getScheme())) {
            filePath = uri.getPath();
        }
        return filePath;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            boolean allGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allGranted = false;
                    break;
                }
            }
            if (!allGranted) {
                Toast.makeText(this, "Permissions required to select files", Toast.LENGTH_SHORT).show();
            }
        }
    }
}