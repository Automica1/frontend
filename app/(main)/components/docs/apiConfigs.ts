// apiConfigs.ts
export interface ApiConfig {
  endpoint: string;
  requestBody: any;
  description: string;
}

export const configs: Record<string, ApiConfig> = {
  'id-crop': {
    endpoint: 'https://automica.ai/go/api/v1/id-cropping',
    requestBody: {
      req_id: "123",
      doc_base64: "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    },
    description: "Crop and extract ID documents from images"
  },
  'face-cropping': {
    endpoint: 'https://automica.ai/go/api/v1/face-detect',
    requestBody: {
      req_id: "123",
      doc_base64: "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    },
    description: "Detect and crop faces from images"
  },
  'qr-masking': {
    endpoint: 'https://automica.ai/go/api/v1/qr-masking',
    requestBody: {
      req_id: "123",
      base64_str: "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    },
    description: "Mask QR codes in documents for privacy"
  },
  'qr-extract': {
    endpoint: 'https://automica.ai/go/api/v1/qr-extraction',
    requestBody: {
      req_id: "123",
      doc_base64: "/9j/4AAQSkZJRgABAQAAAQABAAD..."
    },
    description: "Extract and decode QR codes from images"
  },
  'face-verify': {
    endpoint: 'https://automica.ai/go/api/v1/face-verification',
    requestBody: {
      req_id: "req_001",
      doc_base64_1: "/9j/4AAQSkZJRgABAQAAAQABAAD...",
      doc_base64_2: "/9j/4AAQSkZJRgABAQAAAQABAAD...",
      doc_type: "face"
    },
    description: "Verify and match faces between two images"
  },
  'signature-verification': {
    endpoint: 'https://automica.ai/go/api/v1/signature-verification',
    requestBody: {
      req_id: "abc123",
      doc_base64: ["/9j/4AAQSkZJRgABAQAAAQABAAD...", "/9j/4AAQSkZJRgABAQAAAQABAAD..."]
    },
    description: "Verify signatures across multiple document images"
  }
};

export const getApiConfig = (slug: string): ApiConfig => {
  return configs[slug] || {
    endpoint: 'https://automica.ai/go/api/v1/process',
    requestBody: { req_id: "123", doc_base64: "/9j/4AAQSkZJRgABAQAAAQABAAD..." },
    description: "Process your request"
  };
};