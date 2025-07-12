import { cn } from "@/app/lib/utils";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

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

export const FileUpload2 = ({
  onChange,
  maxFiles = 2,
  className = "",
}: {
  onChange?: (files: File[]) => void;
  maxFiles?: number;
  className?: string;
}) => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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
    // Calculate how many files we can add
    const remainingSlots = maxFiles - files.length;
    
    if (remainingSlots <= 0) {
      // No more slots available
      return;
    }
    
    // Take only the files we can fit
    const filesToAdd = newFiles.slice(0, remainingSlots);
    
    if (filesToAdd.length > 0) {
      // Create previews for new files
      const newFilesWithPreviews = filesToAdd.map(createPreview);
      
      // Combine existing files with new files
      const updatedFiles = [...files, ...newFilesWithPreviews];
      
      setFiles(updatedFiles);
      onChange && onChange(updatedFiles.map(f => f as File));
    }
    
    // Reset the input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
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
    if (files.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple: true,
    noClick: true,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp']
    },
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  const canAcceptMore = files.length < maxFiles;

  return (
    <div className={cn("w-full h-full flex flex-col max-h-[600px]", className)} {...getRootProps()}>
      <motion.div
        onClick={files.length === 0 ? handleClick : undefined}
        whileHover={canAcceptMore ? "animate" : undefined}
        className={cn(
          "flex-1 flex flex-col p-6 group/file block rounded-lg w-full relative overflow-hidden min-h-0",
          files.length === 0 && canAcceptMore ? "cursor-pointer hover:shadow-2xl" : ""
        )}
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          disabled={!canAcceptMore}
        />
        
        {/* GridPattern Background */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>

        {files.length === 0 ? (
          // Upload prompt with animations - centered in available space
          <div className="flex-1 flex flex-col items-center justify-center relative z-20 min-h-0">
            <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-4">
              <div className="text-center">
                <p className="relative z-20 font-sans font-bold text-neutral-300 text-base">
                  Upload Images
                </p>
                <p className="relative z-20 font-sans font-normal text-neutral-400 text-sm mt-2">
                  Upload exactly 2 images for comparison
                </p>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-neutral-400">
                  {files.length}/{maxFiles} images uploaded
                </div>
                <div className="w-24 bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(files.length / maxFiles) * 100}%` }}
                  />
                </div>
                {files.length === maxFiles && (
                  <span className="text-green-500 text-sm font-medium">✓ Ready</span>
                )}
              </div>
              
              <div className="relative">
                <motion.div
                  layoutId="file-upload"
                  variants={mainVariant}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                  }}
                  className="relative group-hover/file:shadow-2xl z-40 bg-neutral-900 flex items-center justify-center h-24 w-24 rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                >
                  {isDragActive && canAcceptMore ? (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-neutral-400 flex flex-col items-center text-xs"
                    >
                      Drop it
                      <IconUpload className="h-4 w-4 text-neutral-400 mt-1" />
                    </motion.p>
                  ) : (
                    <IconUpload className="h-4 w-4 text-neutral-300" />
                  )}
                </motion.div>

                <motion.div
                  variants={secondaryVariant}
                  className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-24 w-24 rounded-md"
                ></motion.div>
              </div>
            </div>
          </div>
        ) : (
          // File preview area - responsive layout for 2 images
          <div className="flex-1 flex flex-col relative z-20 min-h-0">
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-4 flex-shrink-0">
              <div className="text-sm font-medium text-neutral-400">
                {files.length}/{maxFiles} images uploaded
              </div>
              <div className="w-24 bg-neutral-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(files.length / maxFiles) * 100}%` }}
                />
              </div>
              {files.length === maxFiles && (
                <span className="text-green-500 text-sm font-medium">✓ Ready</span>
              )}
            </div>

            {/* Images layout - side by side or stacked depending on available space */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {files.length === 1 && (
                // Single image + upload area
                <div className="flex-1 flex flex-col gap-4 min-h-0">
                  {/* First image */}
                  <div className="flex-1 min-h-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="relative bg-neutral-900 rounded-lg shadow-lg border border-l-4 border-l-blue-500 overflow-hidden h-full flex flex-col"
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(0);
                        }}
                        className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <IconX className="h-4 w-4" />
                      </button>

                      {/* Image label */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-900 text-blue-200">
                          Image 1
                        </span>
                      </div>

                      {/* Image preview */}
                      <div className="p-4 pt-12 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 bg-neutral-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center min-h-0 max-h-[200px] cursor-pointer hover:bg-neutral-700 transition-colors duration-200"
                             onClick={() => setPreviewImage(files[0].preview || null)}>
                          <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={files[0].preview}
                            alt={files[0].name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        
                        {/* File name */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium text-neutral-300 truncate flex-shrink-0"
                        >
                          {files[0].name}
                        </motion.p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Upload area for second Image */}
                  <div className="flex-1 min-h-0">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                      }}
                      className="relative bg-neutral-900 rounded-lg shadow-lg border-2 border-dashed border-blue-600 overflow-hidden cursor-pointer hover:border-blue-500 transition-all duration-200 hover:shadow-xl h-full flex flex-col"
                    >
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mb-3">
                          <IconUpload className="h-6 w-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-300 mb-2">
                          Upload Second Image
                        </h3>
                        <p className="text-sm text-neutral-400 mb-3">
                          Click here or drag and drop your second image
                        </p>
                        <div className="flex items-center gap-2 text-xs text-neutral-500">
                          <span>Image 2</span>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              )}

              {files.length === 2 && (
                // Two images side by side
                <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                  {files.map((file, idx) => (
                    <motion.div
                      key={`image-${idx}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "flex-1 relative bg-neutral-900 rounded-lg shadow-lg border overflow-hidden flex flex-col",
                        idx === 0 ? "border-l-4 border-l-blue-500" : "border-l-4 border-l-green-500"
                      )}
                    >
                      {/* Remove button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(idx);
                        }}
                        className="absolute top-3 right-3 z-10 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <IconX className="h-4 w-4" />
                      </button>

                      {/* Image label */}
                      <div className="absolute top-3 left-3 z-10">
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-900 text-blue-200">
                          Image {idx + 1}
                        </span>
                      </div>

                      {/* Image preview */}
                      <div className="p-4 pt-12 flex-1 flex flex-col min-h-0">
                        <div className="flex-1 bg-neutral-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center min-h-0 max-h-[150px] cursor-pointer hover:bg-neutral-700 transition-colors duration-200"
                             onClick={() => setPreviewImage(file.preview || null)}>
                          <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            src={file.preview}
                            alt={file.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        
                        {/* File name */}
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-sm font-medium text-neutral-300 truncate flex-shrink-0"
                        >
                          {file.name}
                        </motion.p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Full-screen image preview modal */}
      {previewImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-4xl p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 z-10"
            >
              <IconX className="h-4 w-4" />
            </button>
            <motion.img
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </div>
        </motion.div>
      )}
    </div>
  );
};

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