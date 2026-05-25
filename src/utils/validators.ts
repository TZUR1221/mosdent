import Joi from 'joi';

// Validation schemas for common entities

export const studentValidationSchema = Joi.object({
  firstName: Joi.string().required().min(2).max(100),
  lastName: Joi.string().required().min(2).max(100),
  idNumber: Joi.string().pattern(/^[0-9]{9}$/).required(),
  dateOfBirth: Joi.date().required(),
  gender: Joi.string().valid('M', 'F', 'Other'),
  institutionId: Joi.string().uuid().required(),
  enrollmentStatus: Joi.string().valid('active', 'inactive', 'graduated', 'suspended'),
  academicYear: Joi.number().integer().min(1),
  classGrade: Joi.string().max(10),
});

export const userValidationSchema = Joi.object({
  email: Joi.string().email().required(),
  firstName: Joi.string().required().min(2).max(100),
  lastName: Joi.string().required().min(2).max(100),
  password: Joi.string().required().min(8),
  roles: Joi.array().items(Joi.string().uuid()),
});

export const institutionValidationSchema = Joi.object({
  name: Joi.string().required().min(2).max(200),
  institutionType: Joi.string().valid('school', 'kindergarten', 'network', 'community').required(),
  principalName: Joi.string().max(100),
  address: Joi.string().max(200),
  city: Joi.string().max(50),
  zipCode: Joi.string().max(10),
  phone: Joi.string().pattern(/^[0-9\-+\s()]*$/).max(20),
  email: Joi.string().email(),
  parentInstitution: Joi.string().uuid(),
});

export const validateInput = (data: any, schema: Joi.ObjectSchema) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors: Record<string, string[]> = {};
    error.details.forEach(detail => {
      if (!errors[detail.path.join('.')]) {
        errors[detail.path.join('.')] = [];
      }
      errors[detail.path.join('.')].push(detail.message);
    });
    return { valid: false, errors };
  }

  return { valid: true, data: value };
};
