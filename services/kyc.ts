import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

interface KYCSubmission {
  fullName: string;
  dateOfBirth: string;
  phone: string;
  nationality: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  documentType: 'passport' | 'national_id' | 'drivers_license';
  documentNumber: string;
  documentFile: any;
  proofOfAddressFile: any;
  selfieFile: any;
}

export async function submitKYCDocuments(userId: string, data: KYCSubmission) {
  try {
    // 1. Update profile with personal information
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: data.fullName,
        phone: data.phone,
        country: data.address.country,
        kyc_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (profileError) throw profileError;

    // 2. Upload documents to Supabase Storage
    const uploadedDocuments = await Promise.all([
      uploadDocument(userId, 'id-document', data.documentFile),
      uploadDocument(userId, 'proof-of-address', data.proofOfAddressFile),
      uploadDocument(userId, 'selfie', data.selfieFile),
    ]);

    const [idDocUrl, addressProofUrl, selfieUrl] = uploadedDocuments;

    // 3. Create KYC document records with metadata
    const kycDocuments = [
      {
        user_id: userId,
        document_type: data.documentType,
        document_url: idDocUrl,
        status: 'pending',
        metadata: {
          documentNumber: data.documentNumber,
          fullName: data.fullName,
          dateOfBirth: data.dateOfBirth,
          nationality: data.nationality,
          address: data.address,
        },
      },
      {
        user_id: userId,
        document_type: 'proof_of_address' as const,
        document_url: addressProofUrl,
        status: 'pending' as const,
        metadata: {
          address: data.address,
        },
      },
      {
        user_id: userId,
        document_type: data.documentType,
        document_url: selfieUrl,
        status: 'pending' as const,
        metadata: {
          type: 'selfie_with_id',
        },
      },
    ];

    // Insert all documents
    const { error: documentsError } = await supabase
      .from('kyc_documents')
      .insert(kycDocuments);

    if (documentsError) throw documentsError;

    return { success: true };
  } catch (error: any) {
    console.error('KYC Submission Error:', error);
    throw new Error(error.message || 'Failed to submit KYC documents');
  }
}

async function uploadDocument(
  userId: string,
  documentType: string,
  file: any
): Promise<string> {
  try {
    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${documentType}-${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('kyc-documents')
      .upload(fileName, decode(base64), {
        contentType: file.mimeType || 'image/jpeg',
        upsert: false,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('kyc-documents')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error: any) {
    console.error('Document Upload Error:', error);
    throw new Error(`Failed to upload ${documentType}: ${error.message}`);
  }
}

export async function getUserKYCStatus(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('kyc_status, kyc_level')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getUserKYCDocuments(userId: string) {
  const { data, error } = await supabase
    .from('kyc_documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}
