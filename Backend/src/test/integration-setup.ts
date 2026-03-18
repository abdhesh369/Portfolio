// Set test environment variables before any module imports
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
process.env.DATABASE_URL = "postgres://postgres:postgres@localhost:5432/portfolio_test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.RESEND_API_KEY = "re_test_123";
process.env.PORT = "3001";
process.env.CLOUDINARY_CLOUD_NAME = "test";
process.env.CLOUDINARY_API_KEY = "test";
process.env.CLOUDINARY_API_SECRET = "test";

export {};
