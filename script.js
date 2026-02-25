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

        uploadArea.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            await this.handleFiles(e.dataTransfer.files);
        });

        // File input change
        fileInput.addEventListener('change', async (e) => {
            await this.handleFiles(e.target.files);
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

    async handleFiles(fileList) {
        console.log('Files received:', fileList.length);
        const incomingFiles = Array.from(fileList);
        const imageFiles = incomingFiles.filter(file => file.type.startsWith('image/'));
        const zipFiles = incomingFiles.filter(file => file.name.toLowerCase().endsWith('.zip'));

        if (zipFiles.length > 0) {
            if (typeof JSZip === 'undefined') {
                alert('ZIP support is not available. Please refresh the page.');
                return;
            }
        }

        const extractedFiles = [];

        for (const zipFile of zipFiles) {
            try {
                const zip = await JSZip.loadAsync(zipFile);
                const entries = Object.values(zip.files);

                for (const entry of entries) {
                    if (entry.dir) continue;
                    const filename = entry.name.toLowerCase();
                    if (!this.isImageFilename(filename)) continue;

                    const blob = await entry.async('blob');
                    const mimeType = blob.type || this.getMimeTypeFromName(entry.name);
                    const file = new File([blob], entry.name, { type: mimeType || 'image/png' });
                    file.relativePath = entry.name;
                    extractedFiles.push(file);
                }
            } catch (error) {
                console.error('Error reading zip file:', zipFile.name, error);
                alert(`Unable to read zip file: ${zipFile.name}`);
            }
        }

        this.files = [...imageFiles, ...extractedFiles].filter(file => file.type.startsWith('image/') || this.isImageFilename(file.name));

        this.files.forEach((file) => {
            if (!file.relativePath) {
                file.relativePath = file.webkitRelativePath || file.name;
            }
        });
        
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

    isImageFilename(filename) {
        return /\.(png|jpe?g|gif|bmp|webp|svg)$/i.test(filename);
    }

    getMimeTypeFromName(filename) {
        const ext = filename.toLowerCase().split('.').pop();
        switch (ext) {
            case 'png': return 'image/png';
            case 'jpg':
            case 'jpeg': return 'image/jpeg';
            case 'gif': return 'image/gif';
            case 'bmp': return 'image/bmp';
            case 'webp': return 'image/webp';
            case 'svg': return 'image/svg+xml';
            default: return 'image/png';
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
        const fitMode = document.getElementById('fitMode').value;
        
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
                
                const processedImageData = await this.resizeImage(file, finalWidth, finalHeight, method, fitMode);
                this.processedImages.push({
                    name: file.name,
                    relativePath: file.relativePath || file.webkitRelativePath || file.name,
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

    async resizeImage(file, targetWidth, targetHeight, method, fitMode) {
        return new Promise(async (resolve, reject) => {
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { colorSpace: 'srgb' }) || canvas.getContext('2d');

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                // Apply interpolation method via canvas scaling
                if (method === 'nearest') {
                    ctx.imageSmoothingEnabled = false;
                } else {
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = method === 'bicubic' ? 'high' : 'medium';
                }

                let source;
                if (typeof createImageBitmap === 'function') {
                    try {
                        source = await createImageBitmap(file, { colorSpaceConversion: 'default' });
                    } catch (error) {
                        console.warn('createImageBitmap failed, falling back to Image()', error);
                    }
                }

                if (source) {
                    const sourceWidth = source.width;
                    const sourceHeight = source.height;
                    this.drawWithFitMode(ctx, source, sourceWidth, sourceHeight, targetWidth, targetHeight, fitMode);
                    if (typeof source.close === 'function') {
                        source.close();
                    }
                } else {
                    const img = new Image();
                    await new Promise((resolveImage, rejectImage) => {
                        img.onload = resolveImage;
                        img.onerror = rejectImage;
                        img.src = URL.createObjectURL(file);
                    });
                    const sourceWidth = img.naturalWidth || img.width;
                    const sourceHeight = img.naturalHeight || img.height;
                    this.drawWithFitMode(ctx, img, sourceWidth, sourceHeight, targetWidth, targetHeight, fitMode);
                }

                // Export from canvas -> strips metadata and uses sRGB output
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
    }

    drawWithFitMode(ctx, source, sourceWidth, sourceHeight, targetWidth, targetHeight, fitMode) {
        if (fitMode === 'extend') {
            const scale = Math.min(targetWidth / sourceWidth, targetHeight / sourceHeight);
            const drawWidth = Math.round(sourceWidth * scale);
            const drawHeight = Math.round(sourceHeight * scale);
            const dx = Math.round((targetWidth - drawWidth) / 2);
            const dy = Math.round((targetHeight - drawHeight) / 2);
            ctx.clearRect(0, 0, targetWidth, targetHeight);
            ctx.drawImage(source, dx, dy, drawWidth, drawHeight);
            return;
        }

        // Default: stretch to fill
        ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
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
        a.download = this.getResizedFileName(filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async downloadAllImages() {
        if (this.processedImages.length === 0) return;

        if (typeof JSZip === 'undefined') {
            alert('ZIP download is not available. Please refresh the page.');
            return;
        }

        const zip = new JSZip();

        this.processedImages.forEach((image) => {
            const resizedName = this.getResizedFileName(image.name);
            const relativePath = image.relativePath || image.name;
            const zipPath = this.replaceFileNameInPath(relativePath, resizedName);
            zip.file(zipPath, image.data);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        this.downloadBlob(zipBlob, 'resized-images.zip');
    }

    getResizedFileName(filename) {
        return filename.replace(/\.[^/.]+$/, '') + '_resized.png';
    }

    replaceFileNameInPath(path, newFileName) {
        const parts = path.split('/');
        parts[parts.length - 1] = newFileName;
        return parts.join('/');
    }

    downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageResizer();
});
