import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, X, File } from "lucide-react";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

interface FileWithPreview extends File {
  preview?: string;
}

export const FileUpload = ({
  onChange,
}: {
  onChange?: (files: File[]) => void;
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create preview URLs for image files
  const createPreview = (file: File): FileWithPreview => {
    if (file.type.startsWith('image/')) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    }
    return file as FileWithPreview;
  };

  // Clean up preview URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [files]);

  const handleFileChange = (newFiles: File[]) => {
    // Clean up existing previews
    files.forEach(file => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    
    const filesWithPreviews = newFiles.map(createPreview);
    setFiles(filesWithPreviews);
    onChange && onChange(newFiles);
  };

  const handleRemoveFile = (indexToRemove: number) => {
    // Clean up preview URL for removed file
    const fileToRemove = files[indexToRemove];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange && onChange(updatedFiles.map(f => f as File));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  const isImageFile = (file: FileWithPreview) => {
    return file.type.startsWith('image/');
  };

  const hasFiles = files.length > 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area with GridPattern Background */}
      <div
        className="w-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <motion.div
          onClick={!hasFiles ? handleClick : undefined}
          whileHover={!hasFiles ? "animate" : undefined}
          className={`p-10 pb-0 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden ${
            !hasFiles ? 'hover:shadow-2xl' : ''
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
          />
          
          {/* GridPattern Background */}
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>

          {!hasFiles ? (
            // Upload prompt with animations
            <div className="flex flex-col items-center justify-center relative z-20">
              <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-4">
                <div className="flex-1 flex flex-col items-center justify-center space-y-2">
                  <p className="relative z-20 font-sans font-bold text-neutral-300 text-base">
                    Upload file
                  </p>
                  <p className="relative z-20 font-sans font-normal text-neutral-400 text-base mt-2">
                    Drag or drop your files here or click to upload
                  </p>
                </div>
              </div>
              
              <div className="relative w-full mt-6 max-w-xl mx-auto">
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative group-hover/file:shadow-2xl z-40 bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                >
                  {isDragActive ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-600 flex flex-col items-center"
                    >
                      Drop it
                      <Upload className="h-4 w-4 text-neutral-400 mt-1" />
                    </motion.p>
                  ) : (
                    <Upload className="h-4 w-4 text-neutral-300" />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
                ></motion.div>
              </div>
            </div>
          ) : (
            // File preview area
            <div className="relative z-20">
              {files.map((file, idx) => (
                <motion.div
                  key={`file-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="relative bg-neutral-900 rounded-lg shadow-lg border border-neutral-700 overflow-hidden"
                >
                  {/* Remove button */}
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {isImageFile(file) && file.preview ? (
                    // Image preview
                    <div className="p-4">
                      <div className="relative bg-neutral-800 rounded-lg overflow-hidden mb-4">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-auto max-h-80 object-contain"
                        />
                      </div>
                      
                      {/* File details */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-base font-medium text-neutral-300 truncate pr-4"
                          >
                            {file.name}
                          </motion.p>
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-neutral-400 whitespace-nowrap"
                          >
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </motion.p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="inline-block px-3 py-1 bg-neutral-700 text-neutral-300 rounded-full text-xs font-medium"
                          >
                            {file.type}
                          </motion.span>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-neutral-400"
                          >
                            Modified {new Date(file.lastModified).toLocaleDateString()}
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Non-image file preview
                    <div className="p-6 flex items-center space-x-4">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex-shrink-0 w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center"
                      >
                        <File className="h-8 w-8 text-neutral-400" />
                      </motion.div>
                      <div className="flex-1 min-w-0 pr-8">
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-base font-medium text-neutral-300 truncate"
                        >
                          {file.name}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm text-neutral-400 mt-1"
                        >
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.type}
                        </motion.p>
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-neutral-400 mt-1"
                        >
                          Modified {new Date(file.lastModified).toLocaleDateString()}
                        </motion.p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upload different file button */}
      <div className="px-10 pb-1">

      {hasFiles && (
        <motion.button
        initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleClick}
          className="mt-4 w-full px-6 py-3 text-sm font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all duration-200 border border-neutral-600 shadow-sm hover:shadow-md transform hover:scale-[1.02]"
          >
          Upload Different File
        </motion.button>
      )}
      </div>
    </div>
  );
};

// GridPattern component
export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div className="flex bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-neutral-950"
                  : "bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          );
        })
      )}
    </div>
  );
}

export default FileUpload;