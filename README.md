# Advanced Image Resizer

A modern web application for resizing images with professional interpolation methods. Upload single images or entire folders and resize them using nearest neighbor, bilinear, or bicubic interpolation algorithms.

## Features

- **Multiple Interpolation Methods**:
  - **Nearest Neighbor**: Fastest method, good for pixel art
  - **Bilinear**: Smooth interpolation, good balance of quality and speed
  - **Bicubic**: Highest quality interpolation, best for photographs

- **Flexible Input**:
  - Single image upload
  - Batch processing of entire folders
  - Drag and drop support

- **Smart Controls**:
  - Custom width and height settings
  - Maintain aspect ratio option
  - Real-time preview of processed images

- **Professional Output**:
  - Individual image downloads
  - Batch download all processed images
  - High-quality PNG output

## How to Use

1. **Open the Application**: Simply open `index.html` in your web browser

2. **Upload Images**: 
   - Drag and drop images onto the upload area, or
   - Click to browse and select individual images or entire folders

3. **Configure Settings**:
   - Choose interpolation method (Nearest Neighbor, Bilinear, or Bicubic)
   - Set target width and height
   - Toggle "Maintain Aspect Ratio" if desired

4. **Process Images**: Click "Process Images" to start resizing

5. **Download Results**: 
   - Download individual images using the download button on each result
   - Use "Download All" to get all processed images at once

## Interpolation Methods Explained

### Nearest Neighbor
- **Best for**: Pixel art, retro graphics, when you want to preserve sharp edges
- **Speed**: Fastest
- **Quality**: Lower quality but preserves original pixel values exactly

### Bilinear Interpolation
- **Best for**: General purpose resizing, smooth gradients
- **Speed**: Medium
- **Quality**: Good balance between quality and performance

### Bicubic Interpolation
- **Best for**: Photographs, high-quality images, when smoothness is important
- **Speed**: Slower
- **Quality**: Highest quality with smooth results

## Technical Details

- **Client-side Processing**: All image processing happens in your browser - no data is sent to external servers
- **Canvas API**: Uses HTML5 Canvas for high-performance image manipulation
- **Web Workers**: Efficient processing for large images and batch operations
- **Memory Efficient**: Processes images one at a time to avoid memory issues

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## File Format Support

- **Input**: JPEG, PNG, GIF, WebP, BMP
- **Output**: PNG (for best quality and transparency support)

## Performance Tips

- For large batches, consider processing smaller groups
- Bicubic interpolation takes longer but provides the best quality
- Nearest neighbor is fastest for pixel art or when quality isn't critical
- The application automatically handles memory management for large images

## Privacy & Security

- All processing happens locally in your browser
- No images are uploaded to external servers
- No data is stored or transmitted
- Your images never leave your device

---

**Note**: This application works entirely in your browser. No internet connection is required after the initial page load.
# resizing
