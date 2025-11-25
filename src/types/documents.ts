export type DocumentType =
    | 'passport'
    | 'visa'
    | 'payment_receipt'
    | 'ticket'
    | 'hotel_confirmation'
    | 'cnic'
    | 'other';

export interface ClientDocument {
    id: string;
    client_id: string;
    name: string;
    type: DocumentType;
    file_path: string;
    file_type: string;
    size: number;
    created_at: string;
    created_by: string;
    url?: string; // Signed URL for display
}
