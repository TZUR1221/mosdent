import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    nodeEnv: 'development' | 'production' | 'test';
  };
  database: {
    url?: string;
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
    ssl: boolean;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpFrom: string;
  };
  externalApis: {
    ndarimPlus: {
      baseUrl: string;
      apiKey: string;
    };
  };
  logging: {
    level: string;
    dir: string;
  };
  apiDocs: {
    enabled: boolean;
    path: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'mosdent',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    ssl: process.env.DB_SSL === 'true',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key-min-32-characters-long-please',
    expiresIn: process.env.JWT_EXPIRE_IN || '24h',
  },
  email: {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
    smtpUser: process.env.SMTP_USER || '',
    smtpPassword: process.env.SMTP_PASSWORD || '',
    smtpFrom: process.env.SMTP_FROM || 'noreply@mosdent.com',
  },
  externalApis: {
    ndarimPlus: {
      baseUrl: process.env.NDARIM_PLUS_API_URL || 'https://api.ndarim-plus.com',
      apiKey: process.env.NDARIM_PLUS_API_KEY || '',
    },
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || './logs',
  },
  apiDocs: {
    enabled: process.env.API_DOCS_ENABLED === 'true',
    path: process.env.API_DOCS_PATH || '/api/docs',
  },
};

export default config;
