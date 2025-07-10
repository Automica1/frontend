// hooks/useSolutionApi.ts
import { apiService } from '../lib/apiService';
import { useApi } from './useApi';
import { SolutionType } from '../types/solution';

export const useSolutionApi = (solutionType: SolutionType) => {
  const qrExtract = useApi(apiService.extractQRCode.bind(apiService));
  const qrMask = useApi(apiService.maskQRCode.bind(apiService));
  const signatureVerify = useApi(apiService.verifySignatures.bind(apiService));
  const idCrop = useApi(apiService.processIdCrop.bind(apiService));
  const faceVerify = useApi(apiService.verifyFace.bind(apiService));
  const faceCrop = useApi(apiService.cropFace.bind(apiService));

  const getCurrentApi = () => {
    switch (solutionType) {
      case 'qr-extract':
        return qrExtract;
      case 'signature-verification':
        return signatureVerify;
      case 'qr-mask':
        return qrMask;
      case 'id-crop':
        return idCrop;
      case 'face-verify':
        return faceVerify;
      case 'face-cropping':
        return faceCrop;
      default:
        console.error('No matching API found for solution type:', solutionType);
        return qrExtract; // fallback
    }
  };

  return getCurrentApi();
};