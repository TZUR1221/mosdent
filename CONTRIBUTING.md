# Contributing to Mosdent

Thank you for your interest in contributing to Mosdent! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/mosdent.git
   cd mosdent
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes**
   - Follow the code style guidelines
   - Write tests for new features
   - Update documentation

5. **Run Checks**
   ```bash
   npm run lint    # Check code style
   npm run format  # Auto-format
   npm test        # Run tests
   npm run build   # Verify TypeScript
   ```

6. **Commit and Push**
   ```bash
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

7. **Create Pull Request**
   - Clear description of changes
   - Reference any related issues
   - Include screenshots if UI changes

## Code Standards

### TypeScript
- Strict mode enabled
- No `any` types without justification
- Proper typing for all function parameters and returns
- Interfaces for complex objects

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for classes and interfaces
- `UPPER_CASE` for constants
- `snake_case` for database columns

### File Organization
- One module per folder
- Services contain business logic
- Controllers handle requests
- Types/interfaces in separate files

### Comments
- JSDoc for public functions
- Explain "why" not "what"
- Keep comments updated with code

## Testing Requirements

- New features must include tests
- Tests should cover:
  - Happy path
  - Error cases
  - Edge cases
- Minimum 80% code coverage
- Run: `npm test -- --coverage`

## Database Changes

For schema changes:
1. Update Sequelize models
2. Document in DATABASE_SCHEMA.md
3. Create migration if in production
4. Test with sample data

## Module Development

To add a new feature to a module:

1. **Update Service**
   ```typescript
   export class YourService {
     async yourFeature() {
       // Business logic
     }
   }
   ```

2. **Add Controller**
   ```typescript
   export const yourHandler = async (req, res, next) => {
     // Request handling
   };
   ```

3. **Define Routes**
   ```typescript
   router.post('/endpoint', validate(schema), yourHandler);
   ```

4. **Add Tests**
   ```typescript
   describe('Your Feature', () => {
     it('should do something', () => {
       // Test assertion
     });
   });
   ```

5. **Document**
   - Update module documentation
   - Add JSDoc comments
   - Update API reference

## Documentation

When contributing:
- Update README if changing setup
- Document new modules in docs/
- Add JSDoc to public functions
- Include examples for complex features
- Keep Architecture.md current

## Security Considerations

- Validate all user input
- Sanitize before database queries
- Never log sensitive data
- Use prepared statements
- Include tenantId in all queries
- Implement RBAC checks
- Log security events

## Performance Guidelines

- Use database indexes
- Implement pagination (default: 20 items)
- Avoid N+1 queries
- Consider caching strategy
- Monitor slow queries (>1000ms)

## API Conventions

- RESTful endpoints
- Consistent response format
- Proper HTTP status codes
- Error details in response
- Version in path or header

## Commit Guidelines

```
feat: add new registration form builder
fix: resolve duplicate ID detection issue
docs: update API documentation
style: format code with Prettier
refactor: simplify student profile logic
test: add tests for grade recording
chore: update dependencies
```

### Commit Message Format
```
<type>(<module>): <subject>

<body - explain why not what>

Fixes #<issue-number>
```

## Pull Request Process

1. **Before submitting:**
   - Run `npm run lint`
   - Run `npm run format`
   - Run `npm test`
   - Run `npm run build`
   - All should pass

2. **PR Description should include:**
   - What problem does it solve?
   - How does it work?
   - Any breaking changes?
   - Screenshots (if UI)
   - Test coverage details

3. **Review Process:**
   - Maintainers review code
   - Address feedback
   - Keep branch updated with main

4. **Merge:**
   - Must pass all checks
   - At least one approval
   - CI/CD pipeline passes

## Reporting Issues

Use GitHub Issues to report:
- Bugs (with reproduction steps)
- Feature requests (with use case)
- Documentation improvements
- Performance issues

Include:
- Mosdent version
- Node.js version
- Database version
- Steps to reproduce
- Expected vs actual behavior

## Development Workflow

### Module Implementation Checklist
- [ ] Create module service with business logic
- [ ] Create controller with request handlers
- [ ] Add route definitions
- [ ] Add TypeScript types/interfaces
- [ ] Add database models (if needed)
- [ ] Write unit tests (80%+ coverage)
- [ ] Add integration tests
- [ ] Update documentation
- [ ] Add JSDoc comments
- [ ] Run linting and formatting
- [ ] Submit pull request

### Testing Workflow
```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/modules/admin/admin.service.test.ts

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test -- --coverage
```

### Code Quality Workflow
```bash
# Check linting
npm run lint

# Auto-format
npm run format

# Type checking
npm run build

# Full verification
npm run lint && npm run format && npm test && npm run build
```

## Questions?

- Check documentation in `docs/`
- Review existing module implementations
- Open a discussion issue
- Contact maintainers

## Recognition

Contributors are recognized:
- In git history (commit author)
- In CONTRIBUTORS.md file
- In release notes (for significant contributions)

Thank you for contributing to make Mosdent better!

---

**Last Updated**: May 24, 2026
**Version**: 4.0.0
