import { Sequelize, DataTypes, Model } from 'sequelize';
import config from './config.js';

const sequelizeOptions = {
  dialect: 'postgres' as const,
  logging: false,
  pool: {
    max: 10,
    min: 2,
    idle: 10000,
  },
  dialectOptions: config.database.ssl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
};

const sequelize = config.database.url
  ? new Sequelize(config.database.url, sequelizeOptions)
  : new Sequelize(
      config.database.name,
      config.database.user,
      config.database.password,
      {
        ...sequelizeOptions,
        host: config.database.host,
        port: config.database.port,
      },
    );

// Tenant Model
export class Tenant extends Model {}
Tenant.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    legalName: DataTypes.STRING,
    subscriptionTier: {
      type: DataTypes.ENUM('starter', 'professional', 'enterprise'),
      defaultValue: 'starter',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    maxInstitutions: DataTypes.INTEGER,
    maxUsers: DataTypes.INTEGER,
    features: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'tenants',
    timestamps: true,
  },
);

// Institution Model
export class Institution extends Model {}
Institution.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    institutionType: {
      type: DataTypes.ENUM('school', 'kindergarten', 'network', 'community'),
      allowNull: false,
    },
    principalName: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    parentInstitution: {
      type: DataTypes.UUID,
      references: {
        model: 'institutions',
        key: 'id',
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdBy: DataTypes.UUID,
    updatedBy: DataTypes.UUID,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'institutions',
    timestamps: true,
  },
);

// User Model
export class User extends Model {}
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    passwordHash: DataTypes.STRING,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    lastLoginAt: DataTypes.DATE,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'email'] },
    ],
  },
);

// User-Institution Assignment (Multi-Institution Staffing)
export class UserInstitution extends Model {}
UserInstitution.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    institutionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'institutions',
        key: 'id',
      },
    },
    roleId: {
      type: DataTypes.UUID,
      references: {
        model: 'roles',
        key: 'id',
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'user_institutions',
    timestamps: false,
    indexes: [
      { fields: ['userId', 'institutionId'] },
    ],
  },
);

// Role Model (RBAC)
export class Role extends Model {}
Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    institutionId: {
      type: DataTypes.UUID,
      references: {
        model: 'institutions',
        key: 'id',
      },
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'name'] },
    ],
  },
);

// Student Model
export class Student extends Model {}
Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idNumber: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    gender: {
      type: DataTypes.ENUM('M', 'F', 'Other'),
    },
    institutionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'institutions',
        key: 'id',
      },
    },
    familyId: DataTypes.UUID,
    enrollmentStatus: {
      type: DataTypes.ENUM('active', 'inactive', 'graduated', 'suspended'),
      defaultValue: 'active',
    },
    academicYear: DataTypes.INTEGER,
    classGrade: DataTypes.STRING,
    ndarimPlusId: DataTypes.STRING,
    createdBy: DataTypes.UUID,
    updatedBy: DataTypes.UUID,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'students',
    timestamps: true,
    indexes: [
      { fields: ['tenantId', 'idNumber'] },
      { fields: ['tenantId', 'institutionId'] },
    ],
  },
);

// Audit Log Model
export class AuditLog extends Model {}
AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tenantId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'tenants',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    entityId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    changes: DataTypes.JSON,
    userId: DataTypes.UUID,
    userEmail: DataTypes.STRING,
    ipAddress: DataTypes.STRING,
    userAgent: DataTypes.TEXT,
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: false,
    indexes: [
      { fields: ['tenantId', 'entityType', 'entityId'] },
      { fields: ['createdAt'] },
    ],
  },
);

// Define associations
Tenant.hasMany(Institution, { foreignKey: 'tenantId' });
Institution.belongsTo(Tenant, { foreignKey: 'tenantId' });

Institution.hasMany(Institution, { foreignKey: 'parentInstitution', as: 'childInstitutions' });
Institution.belongsTo(Institution, { foreignKey: 'parentInstitution', as: 'parentInstitutionRecord' });

Tenant.hasMany(User, { foreignKey: 'tenantId' });
User.belongsTo(Tenant, { foreignKey: 'tenantId' });

User.belongsToMany(Institution, {
  through: UserInstitution,
  foreignKey: 'userId',
  otherKey: 'institutionId',
  as: 'institutions',
});
Institution.belongsToMany(User, {
  through: UserInstitution,
  foreignKey: 'institutionId',
  otherKey: 'userId',
  as: 'users',
});

Tenant.hasMany(Role, { foreignKey: 'tenantId' });
Role.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Student, { foreignKey: 'tenantId' });
Student.belongsTo(Tenant, { foreignKey: 'tenantId' });

Institution.hasMany(Student, { foreignKey: 'institutionId' });
Student.belongsTo(Institution, { foreignKey: 'institutionId' });

Tenant.hasMany(AuditLog, { foreignKey: 'tenantId' });
AuditLog.belongsTo(Tenant, { foreignKey: 'tenantId' });

export { sequelize };
