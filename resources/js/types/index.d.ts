export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Array<{
        id: number;
        role: string;
        campus_id?: number;
        complaint_type_id?: number;
    }>;
}

export interface Campus {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface ComplaintType {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

declare function route(name: string, params?: any): string; 