const fs = require('fs');
const path = require('path');

// Source and destination directories
const sourceDir = path.join(__dirname, 'src/frontend');
const destDir = path.join(__dirname, 'dist');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy files from source to destination
function copyFiles() {
  const files = fs.readdirSync(sourceDir);
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    
    // Check if it's a directory
    if (fs.statSync(sourcePath).isDirectory()) {
      // Create the directory in the destination
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      
      // Copy files in the directory
      const subFiles = fs.readdirSync(sourcePath);
      subFiles.forEach(subFile => {
        const subSourcePath = path.join(sourcePath, subFile);
        const subDestPath = path.join(destPath, subFile);
        
        fs.copyFileSync(subSourcePath, subDestPath);
        console.log(`Copied ${subSourcePath} to ${subDestPath}`);
      });
    } else {
      // Copy the file
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Copied ${sourcePath} to ${destPath}`);
    }
  });
}

// Execute the copy
try {
  copyFiles();
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Error building frontend:', error);
  process.exit(1);
}
