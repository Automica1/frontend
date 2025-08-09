import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Upload, X, AlertCircle, Lock } from "lucide-react";
import { useKindeAuth } from "@kinde-oss/kinde-auth-nextjs";
import { useRouter } from "next/navigation";

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

interface ValidationError {
  message: string;
  type: 'size' | 'type';
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
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
  const [isDragActive, setIsDragActive] = useState(false);
  const [validationError, setValidationError] = useState<ValidationError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Authentication
  const { isAuthenticated, user } = useKindeAuth();
  const router = useRouter();

  // File validation constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const ALLOWED_TYPES = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

  // Handle authentication check before file operations
  const handleAuthCheck = (): boolean => {
    if (!isAuthenticated) {
      router.push("/api/auth/login?post_login_redirect_url=/services");
      return false;
    }
    return true;
  };

  // Validate file type and size
  const validateFile = (file: File): ValidationError | null => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        type: 'size',
        message: `File "${file.name}" is too large. Maximum size is 10MB.`
      };
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExtension || '');
    
    if (!isValidType) {
      return {
        type: 'type',
        message: `File "${file.name}" is not supported. Only JPEG, JPG, PNG, and PDF files are allowed.`
      };
    }

    return null;
  };

  // Create preview URLs for image files (not for PDFs)
  const createPreview = (file: File): FileWithPreview => {
    if (file.type.startsWith('image/')) {
      const fileWithPreview = file as FileWithPreview;
      fileWithPreview.preview = URL.createObjectURL(file);
      return fileWithPreview;
    }
    return file as FileWithPreview;
  };

  // Clear validation error after 5 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Clean up all preview URLs only when component unmounts
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []); // Empty dependency array - only run on unmount

  const handleFileChange = (newFiles: File[]) => {
    // Check authentication first
    if (!handleAuthCheck()) return;

    // Clear any existing validation error
    setValidationError(null);

    // Calculate how many files we can add
    const remainingSlots = maxFiles - files.length;
    
    if (remainingSlots <= 0) {
      // No more slots available
      setValidationError({
        type: 'type',
        message: `Maximum ${maxFiles} files allowed. Remove some files first.`
      });
      return;
    }
    
    // Validate each file
    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        setValidationError(error);
        return; // Stop processing if any file is invalid
      }
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
    // Check authentication first
    if (!handleAuthCheck()) return;

    // Clear validation error when removing files
    setValidationError(null);
    
    // Clean up preview URL for the specific file being removed
    const fileToRemove = files[indexToRemove];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(updatedFiles);
    onChange && onChange(updatedFiles.map(f => f as File));
  };

  const handleClick = () => {
    if (!handleAuthCheck()) return;
    if (files.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    
    if (!handleAuthCheck()) return;
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileChange(droppedFiles);
    }
  };

  const canAcceptMore = files.length < maxFiles && isAuthenticated;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf') {
      return (
        <div className="w-full h-32 bg-red-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">📄</div>
            <div className="text-xs text-red-600 font-medium">PDF</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      className={cn("w-full h-full flex flex-col max-h-[600px]", className)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Authentication required message */}
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-amber-900/50 border border-amber-700 rounded-lg">
          <p className="text-amber-300 text-sm flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            Please log in to upload files
          </p>
        </div>
      )}

      {/* Validation Error Display */}
      {validationError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-200">{validationError.message}</p>
          </div>
        </motion.div>
      )}

      <div className={cn(
        "flex-1 flex flex-col min-h-0 overflow-hidden",
        !isAuthenticated ? 'opacity-50' : ''
      )}>
        <motion.div
          onClick={files.length === 0 ? (isAuthenticated ? handleClick : handleAuthCheck) : undefined}
          whileHover={canAcceptMore ? "animate" : undefined}
          className={cn(
            "flex-1 flex flex-col p-6 group/file block rounded-lg w-full relative overflow-hidden min-h-0",
            files.length === 0 && isAuthenticated ? "cursor-pointer hover:shadow-2xl" : 
            files.length === 0 && !isAuthenticated ? "cursor-pointer" : ""
          )}
        >
          <input
            ref={fileInputRef}
            id="file-upload-handle"
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
            onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
            className="hidden"
            disabled={!canAcceptMore}
          />
          
          {/* GridPattern Background */}
          <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
            <GridPattern />
          </div>

          {files.length === 0 ? (
            // Upload prompt with animations - perfectly centered
            <div className="flex-1 flex flex-col items-center justify-center relative z-20 min-h-0">
              <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto space-y-4">
                <div className="text-center">
                  <p className="relative z-20 font-sans font-bold text-neutral-300 text-base">
                    {isAuthenticated ? 'Upload Files' : 'Sign in to upload files'}
                  </p>
                  <p className="relative z-20 font-sans font-normal text-neutral-400 text-sm mt-2">
                    {isAuthenticated 
                      ? `Upload up to ${maxFiles} files (JPEG, JPG, PNG, PDF - Max 10MB each)`
                      : 'Please sign in to start uploading files'
                    }
                  </p>
                </div>
                
                {/* Progress indicator - only show when files.length === 0 */}
                <div className="flex items-center gap-2">
                  <div className="text-sm font-medium text-neutral-400">
                    {files.length}/{maxFiles} files uploaded
                  </div>
                  <div className="w-24 bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(files.length / maxFiles) * 100}%` }}
                    />
                  </div>
                </div>
                
                <div className="relative mt-4">
                  <motion.div
                    layoutId="file-upload"
                    variants={mainVariant}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                    }}
                    className="relative group-hover/file:shadow-2xl z-40 bg-neutral-900 flex items-center justify-center h-32 w-32 rounded-md shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
                  >
                    {!isAuthenticated ? (
                      <Lock className="h-8 w-8 text-neutral-400" />
                    ) : isDragActive && canAcceptMore ? (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-neutral-400 flex flex-col items-center text-xs"
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
                    className={cn(
                      "absolute opacity-0 border border-dashed inset-0 z-30 bg-transparent flex items-center justify-center h-32 w-32 rounded-md",
                      isAuthenticated ? "border-sky-400" : "border-amber-400"
                    )}
                  ></motion.div>
                </div>
              </div>
            </div>
          ) : (
            // File preview area - responsive layout for files
            <div className="flex-1 flex flex-col relative z-20 min-h-0">
              {/* Progress indicator - only show when files.length > 0 */}
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div className="text-sm font-medium text-neutral-400">
                  {files.length}/{maxFiles} files uploaded
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

              {/* Files layout - side by side or stacked depending on available space */}
              <div className="flex-1 flex flex-col gap-4 min-h-0">
                {files.length === 1 && (
                  // Single file + upload area
                  <div className="flex-1 flex flex-col gap-4 min-h-0">
                    {/* First file */}
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
                          <X className="h-4 w-4" />
                        </button>

                        {/* File label */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-900 text-blue-200">
                            File 1
                          </span>
                        </div>

                        {/* File preview */}
                        <div className="p-4 pt-12 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 bg-neutral-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center min-h-0 max-h-[200px] cursor-pointer hover:bg-neutral-700 transition-colors duration-200"
                               onClick={() => files[0].preview && setPreviewImage(files[0].preview)}>
                            {files[0].preview ? (
                              <motion.img
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={files[0].preview}
                                alt={files[0].name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              getFileIcon(files[0])
                            )}
                          </div>
                          
                          {/* File info */}
                          <div className="flex-shrink-0 space-y-1">
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm font-medium text-neutral-300 truncate"
                            >
                              {files[0].name}
                            </motion.p>
                            <p className="text-xs text-neutral-400">
                              {formatFileSize(files[0].size)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>

                    {/* Upload area for second file */}
                    {isAuthenticated && (
                      <div className="flex-1 min-h-0">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClick();
                          }}
                          className="relative bg-neutral-900 rounded-lg shadow-lg overflow-hidden cursor-pointer hover:border-blue-500 transition-all duration-200 hover:shadow-xl h-full flex flex-col"
                        >
                          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center mb-3">
                              <Upload className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-lg font-medium text-neutral-300 mb-2">
                              Upload Second File
                            </h3>
                            <p className="text-sm text-neutral-400 mb-3">
                              Click here or drag and drop your second file
                            </p>
                            <p className="text-xs text-neutral-500">
                              JPEG, JPG, PNG, PDF (Max 10MB)
                            </p>
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}

                {files.length === 2 && (
                  // Two files side by side
                  <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
                    {files.map((file, idx) => (
                      <motion.div
                        key={`file-${idx}`}
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
                          <X className="h-4 w-4" />
                        </button>

                        {/* File label */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-900 text-blue-200">
                            File {idx + 1}
                          </span>
                        </div>

                        {/* File preview */}
                        <div className="p-4 pt-12 flex-1 flex flex-col min-h-0">
                          <div className="flex-1 bg-neutral-800 rounded-lg overflow-hidden mb-2 flex items-center justify-center min-h-0 max-h-[150px] cursor-pointer hover:bg-neutral-700 transition-colors duration-200"
                               onClick={() => file.preview && setPreviewImage(file.preview)}>
                            {file.preview ? (
                              <motion.img
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                src={file.preview}
                                alt={file.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              getFileIcon(file)
                            )}
                          </div>
                          
                          {/* File info */}
                          <div className="flex-shrink-0 space-y-1">
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="text-sm font-medium text-neutral-300 truncate"
                            >
                              {file.name}
                            </motion.p>
                            <p className="text-xs text-neutral-400">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Login button when not authenticated */}
      {!isAuthenticated && (
        <div className="flex-shrink-0 p-4 pt-4">
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => router.push("/api/auth/login?post_login_redirect_url=/services")}
            className="w-full px-6 py-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-sm hover:shadow-md transform"
          >
            <Lock className="w-4 h-4" />
            <span>Sign In to Upload Files</span>
          </motion.button>
        </div>
      )}

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
              <X className="h-4 w-4" />
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

export default FileUpload2;