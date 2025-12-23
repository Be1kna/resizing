class ImageResizer {
    constructor() {
        this.files = [];
        this.processedImages = [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const processBtn = document.getElementById('processBtn');
        const maintainAspectCheckbox = document.getElementById('maintainAspect');
        const widthInput = document.getElementById('width');
        const heightInput = document.getElementById('height');
        const downloadAllBtn = document.getElementById('downloadAllBtn');
        const folderModeCheckbox = document.getElementById('folderMode');
        const resizeModeSelect = document.getElementById('resizeMode');
        const percentageInput = document.getElementById('percentage');

        // Click to browse
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // Drag and drop events
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });

        // Process button
        processBtn.addEventListener('click', () => {
            this.processImages();
        });

        // Maintain aspect ratio
        maintainAspectCheckbox.addEventListener('change', () => {
            this.toggleAspectRatio();
        });

        // Width/height inputs
        widthInput.addEventListener('input', () => {
            if (document.getElementById('maintainAspect').checked) {
                this.updateHeightFromWidth();
            }
        });

        heightInput.addEventListener('input', () => {
            if (document.getElementById('maintainAspect').checked) {
                this.updateWidthFromHeight();
            }
        });

        // Download all button
        downloadAllBtn.addEventListener('click', () => {
            this.downloadAllImages();
        });

        // Folder mode toggle
        folderModeCheckbox.addEventListener('change', () => {
            this.toggleFolderMode();
        });

        // Resize mode toggle
        resizeModeSelect.addEventListener('change', () => {
            this.toggleResizeMode();
        });

        // Percentage input
        percentageInput.addEventListener('input', () => {
            this.updateDimensionsFromPercentage();
        });
    }

    toggleFolderMode() {
        const fileInput = document.getElementById('fileInput');
        const folderMode = document.getElementById('folderMode').checked;
        
        if (folderMode) {
            fileInput.setAttribute('webkitdirectory', '');
            fileInput.setAttribute('directory', '');
        } else {
            fileInput.removeAttribute('webkitdirectory');
            fileInput.removeAttribute('directory');
        }
    }

    toggleResizeMode() {
        const resizeMode = document.getElementById('resizeMode').value;
        const pixelControls = document.getElementById('pixelControls');
        const percentageControls = document.getElementById('percentageControls');
        const maintainAspectCheckbox = document.getElementById('maintainAspect');
        
        if (resizeMode === 'percentage') {
            pixelControls.style.display = 'none';
            percentageControls.style.display = 'block';
            maintainAspectCheckbox.checked = true; // Always maintain aspect ratio for percentage
            maintainAspectCheckbox.disabled = true;
            this.updateDimensionsFromPercentage();
        } else {
            pixelControls.style.display = 'block';
            percentageControls.style.display = 'none';
            maintainAspectCheckbox.disabled = false;
        }
    }

    updateDimensionsFromPercentage() {
        if (this.files.length === 0) return;
        
        const percentage = parseFloat(document.getElementById('percentage').value) || 100;
        const firstFile = this.files[0];
        
        const img = new Image();
        img.onload = () => {
            const newWidth = Math.round(img.width * (percentage / 100));
            const newHeight = Math.round(img.height * (percentage / 100));
            
            document.getElementById('width').value = newWidth;
            document.getElementById('height').value = newHeight;
        };
        img.src = URL.createObjectURL(firstFile);
    }

    handleFiles(fileList) {
        console.log('Files received:', fileList.length);
        this.files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
        
        console.log('Image files filtered:', this.files.length);
        
        if (this.files.length > 0) {
            document.getElementById('processBtn').disabled = false;
            console.log(`Loaded ${this.files.length} image(s)`);
            
            // Show file count
            const fileCount = document.getElementById('fileCount');
            const fileCountText = document.getElementById('fileCountText');
            fileCount.style.display = 'block';
            fileCountText.textContent = `${this.files.length} file${this.files.length > 1 ? 's' : ''} selected`;
            
            // Show current image size info
            this.showCurrentImageSize();
            
            // Show a success message
            const uploadArea = document.getElementById('uploadArea');
            uploadArea.style.borderColor = '#4CAF50';
            setTimeout(() => {
                uploadArea.style.borderColor = '#fff';
            }, 2000);
        } else {
            console.log('No image files found');
            alert('No image files found. Please select valid image files.');
        }
    }

    showCurrentImageSize() {
        if (this.files.length === 0) return;
        
        const firstFile = this.files[0];
        const img = new Image();
        
        img.onload = () => {
            const currentSize = document.getElementById('currentSize');
            const currentDimensions = document.getElementById('currentDimensions');
            const currentFileSize = document.getElementById('currentFileSize');
            
            currentSize.style.display = 'block';
            currentDimensions.textContent = `${img.width} × ${img.height} pixels`;
            currentFileSize.textContent = this.formatFileSize(firstFile.size);
            
            // If percentage mode is selected, update dimensions
            if (document.getElementById('resizeMode').value === 'percentage') {
                this.updateDimensionsFromPercentage();
            }
        };
        
        img.src = URL.createObjectURL(firstFile);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    toggleAspectRatio() {
        const maintainAspect = document.getElementById('maintainAspect').checked;
        if (maintainAspect && this.files.length > 0) {
            // Load first image to get aspect ratio
            const firstFile = this.files[0];
            const img = new Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const width = document.getElementById('width').value;
                if (width) {
                    document.getElementById('height').value = Math.round(width / aspectRatio);
                }
            };
            img.src = URL.createObjectURL(firstFile);
        }
    }

    updateHeightFromWidth() {
        if (this.files.length === 0) return;
        
        const width = document.getElementById('width').value;
        if (!width) return;

        const firstFile = this.files[0];
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            document.getElementById('height').value = Math.round(width / aspectRatio);
        };
        img.src = URL.createObjectURL(firstFile);
    }

    updateWidthFromHeight() {
        if (this.files.length === 0) return;
        
        const height = document.getElementById('height').value;
        if (!height) return;

        const firstFile = this.files[0];
        const img = new Image();
        img.onload = () => {
            const aspectRatio = img.width / img.height;
            document.getElementById('width').value = Math.round(height * aspectRatio);
        };
        img.src = URL.createObjectURL(firstFile);
    }

    async processImages() {
        const resizeMode = document.getElementById('resizeMode').value;
        const method = document.getElementById('interpolationMethod').value;
        
        let targetWidth, targetHeight;
        
        if (resizeMode === 'percentage') {
            const percentage = parseFloat(document.getElementById('percentage').value);
            if (!percentage || percentage <= 0) {
                alert('Please enter a valid percentage value');
                return;
            }
            // For percentage mode, we'll calculate dimensions per image
        } else {
            targetWidth = parseInt(document.getElementById('width').value);
            targetHeight = parseInt(document.getElementById('height').value);
            
            if (!targetWidth || !targetHeight) {
                alert('Please enter valid width and height values');
                return;
            }
        }

        this.processedImages = [];
        this.showProgress(true);

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            this.updateProgress(i, this.files.length, `Processing ${file.name}...`);

            try {
                let finalWidth = targetWidth;
                let finalHeight = targetHeight;
                
                if (resizeMode === 'percentage') {
                    const percentage = parseFloat(document.getElementById('percentage').value);
                    const img = new Image();
                    await new Promise((resolve) => {
                        img.onload = () => {
                            finalWidth = Math.round(img.width * (percentage / 100));
                            finalHeight = Math.round(img.height * (percentage / 100));
                            resolve();
                        };
                        img.src = URL.createObjectURL(file);
                    });
                }
                
                const processedImageData = await this.resizeImage(file, finalWidth, finalHeight, method);
                this.processedImages.push({
                    name: file.name,
                    data: processedImageData,
                    originalSize: `${file.size} bytes`
                });
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
            }
        }

        this.showProgress(false);
        this.showResults();
    }

    async resizeImage(file, targetWidth, targetHeight, method) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;

                    // Get original image data
                    const originalCanvas = document.createElement('canvas');
                    const originalCtx = originalCanvas.getContext('2d');
                    originalCanvas.width = img.width;
                    originalCanvas.height = img.height;
                    originalCtx.drawImage(img, 0, 0);
                    const originalData = originalCtx.getImageData(0, 0, img.width, img.height);

                    // Apply interpolation method
                    const resizedData = this.interpolateImage(originalData, targetWidth, targetHeight, method);
                    
                    // Create new image data
                    const newImageData = ctx.createImageData(targetWidth, targetHeight);
                    newImageData.data.set(resizedData);
                    
                    // Draw to canvas
                    ctx.putImageData(newImageData, 0, 0);
                    
                    // Convert to blob
                    canvas.toBlob((blob) => {
                        resolve(blob);
                    }, 'image/png');
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }

    interpolateImage(imageData, targetWidth, targetHeight, method) {
        const { width: sourceWidth, height: sourceHeight, data: sourceData } = imageData;
        const targetData = new Uint8ClampedArray(targetWidth * targetHeight * 4);

        const scaleX = sourceWidth / targetWidth;
        const scaleY = sourceHeight / targetHeight;

        for (let y = 0; y < targetHeight; y++) {
            for (let x = 0; x < targetWidth; x++) {
                const targetIndex = (y * targetWidth + x) * 4;
                
                let r, g, b, a;
                
                switch (method) {
                    case 'nearest':
                        ({ r, g, b, a } = this.nearestNeighbor(sourceData, sourceWidth, sourceHeight, x * scaleX, y * scaleY));
                        break;
                    case 'bilinear':
                        ({ r, g, b, a } = this.bilinearInterpolation(sourceData, sourceWidth, sourceHeight, x * scaleX, y * scaleY));
                        break;
                    case 'bicubic':
                        ({ r, g, b, a } = this.bicubicInterpolation(sourceData, sourceWidth, sourceHeight, x * scaleX, y * scaleY));
                        break;
                }

                targetData[targetIndex] = r;
                targetData[targetIndex + 1] = g;
                targetData[targetIndex + 2] = b;
                targetData[targetIndex + 3] = a;
            }
        }

        return targetData;
    }

    nearestNeighbor(sourceData, sourceWidth, sourceHeight, x, y) {
        const x1 = Math.round(x);
        const y1 = Math.round(y);
        
        // Clamp coordinates
        const clampedX = Math.max(0, Math.min(sourceWidth - 1, x1));
        const clampedY = Math.max(0, Math.min(sourceHeight - 1, y1));
        
        const index = (clampedY * sourceWidth + clampedX) * 4;
        
        return {
            r: sourceData[index],
            g: sourceData[index + 1],
            b: sourceData[index + 2],
            a: sourceData[index + 3]
        };
    }

    bilinearInterpolation(sourceData, sourceWidth, sourceHeight, x, y) {
        const x1 = Math.floor(x);
        const y1 = Math.floor(y);
        const x2 = Math.min(x1 + 1, sourceWidth - 1);
        const y2 = Math.min(y1 + 1, sourceHeight - 1);

        const fx = x - x1;
        const fy = y - y1;

        const getPixel = (px, py) => {
            const index = (py * sourceWidth + px) * 4;
            return {
                r: sourceData[index],
                g: sourceData[index + 1],
                b: sourceData[index + 2],
                a: sourceData[index + 3]
            };
        };

        const p1 = getPixel(x1, y1);
        const p2 = getPixel(x2, y1);
        const p3 = getPixel(x1, y2);
        const p4 = getPixel(x2, y2);

        const interpolate = (a, b, c, d) => {
            return a * (1 - fx) * (1 - fy) +
                   b * fx * (1 - fy) +
                   c * (1 - fx) * fy +
                   d * fx * fy;
        };

        return {
            r: Math.round(interpolate(p1.r, p2.r, p3.r, p4.r)),
            g: Math.round(interpolate(p1.g, p2.g, p3.g, p4.g)),
            b: Math.round(interpolate(p1.b, p2.b, p3.b, p4.b)),
            a: Math.round(interpolate(p1.a, p2.a, p3.a, p4.a))
        };
    }

    bicubicInterpolation(sourceData, sourceWidth, sourceHeight, x, y) {
        const x1 = Math.floor(x);
        const y1 = Math.floor(y);
        
        const fx = x - x1;
        const fy = y - y1;

        const getPixel = (px, py) => {
            const clampedX = Math.max(0, Math.min(sourceWidth - 1, px));
            const clampedY = Math.max(0, Math.min(sourceHeight - 1, py));
            const index = (clampedY * sourceWidth + clampedX) * 4;
            return {
                r: sourceData[index],
                g: sourceData[index + 1],
                b: sourceData[index + 2],
                a: sourceData[index + 3]
            };
        };

        // Cubic interpolation kernel
        const cubicKernel = (t) => {
            const a = -0.5;
            if (Math.abs(t) <= 1) {
                return (a + 2) * Math.abs(t) * Math.abs(t) * Math.abs(t) - (a + 3) * Math.abs(t) * Math.abs(t) + 1;
            } else if (Math.abs(t) <= 2) {
                return a * Math.abs(t) * Math.abs(t) * Math.abs(t) - 5 * a * Math.abs(t) * Math.abs(t) + 8 * a * Math.abs(t) - 4 * a;
            }
            return 0;
        };

        let r = 0, g = 0, b = 0, a = 0;
        let weightSum = 0;

        for (let dy = -1; dy <= 2; dy++) {
            for (let dx = -1; dx <= 2; dx++) {
                const pixel = getPixel(x1 + dx, y1 + dy);
                const wx = cubicKernel(fx - dx);
                const wy = cubicKernel(fy - dy);
                const weight = wx * wy;
                
                r += pixel.r * weight;
                g += pixel.g * weight;
                b += pixel.b * weight;
                a += pixel.a * weight;
                weightSum += weight;
            }
        }

        return {
            r: Math.round(Math.max(0, Math.min(255, r / weightSum))),
            g: Math.round(Math.max(0, Math.min(255, g / weightSum))),
            b: Math.round(Math.max(0, Math.min(255, b / weightSum))),
            a: Math.round(Math.max(0, Math.min(255, a / weightSum)))
        };
    }

    showProgress(show) {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = show ? 'block' : 'none';
    }

    updateProgress(current, total, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        
        const percentage = (current / total) * 100;
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = text;
    }

    showResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsGrid = document.getElementById('resultsGrid');
        
        resultsGrid.innerHTML = '';
        
        this.processedImages.forEach((image, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(image.data);
            img.alt = image.name;
            
            const filename = document.createElement('div');
            filename.className = 'filename';
            filename.textContent = image.name;
            
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'download-btn';
            downloadBtn.textContent = 'Download';
            downloadBtn.onclick = () => this.downloadImage(image.data, image.name);
            
            resultItem.appendChild(img);
            resultItem.appendChild(filename);
            resultItem.appendChild(downloadBtn);
            
            resultsGrid.appendChild(resultItem);
        });
        
        resultsSection.style.display = 'block';
    }

    downloadImage(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename.replace(/\.[^/.]+$/, '_resized.png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    downloadAllImages() {
        this.processedImages.forEach((image, index) => {
            setTimeout(() => {
                this.downloadImage(image.data, image.name);
            }, index * 100); // Small delay between downloads
        });
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageResizer();
});
