declare module 'multer-storage-cloudinary' {
    import { v2 as cloudinary } from 'cloudinary';
    import { StorageEngine } from 'multer';

    interface Options {
        cloudinary: typeof cloudinary;
        params?: {
            folder?: string;
            allowed_formats?: string[];
            public_id?: (req: any, file: any) => string;
            [key: string]: any;
        };
    }

    export class CloudinaryStorage implements StorageEngine {
        constructor(options: Options);
        _handleFile(req: any, file: any, cb: (error: any, info?: any) => void): void;
        _removeFile(req: any, file: any, cb: (error: any, info?: any) => void): void;
    }
}
