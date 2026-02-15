# Contributing Guide

## Welcome! 👋

We'd love your contributions to the ERP Starter Template. This guide will help you get started.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others succeed

## Getting Started

### 1. Fork and Clone
```bash
git clone https://github.com/yourusername/erp-starter.git
cd erp-starter
git checkout -b feature/your-feature-name
```

### 2. Setup Development Environment
```bash
# Backend
cd backend
npm install
npm run prisma:generate

# Frontend
cd frontend
npm install
```

### 3. Create a Feature Branch
```bash
git checkout -b feature/my-awesome-feature
# or
git checkout -b bugfix/issue-description
```

## Development Workflow

### Making Changes

1. **Create your changes**
   ```bash
   # Edit files in your IDE
   ```

2. **Follow code style**
   ```bash
   # Lint and format
   npm run lint
   npm run format
   ```

3. **Write tests**
   ```bash
   npm test
   npm run test:cov  # Check coverage
   ```

4. **Test locally**
   ```bash
   npm run start:dev  # Backend
   npm run dev        # Frontend
   ```

### Commit Guidelines

Use conventional commits:

```bash
git commit -m "feat: add employee import feature"
git commit -m "fix: resolve login token expiration issue"
git commit -m "docs: update API documentation"
git commit -m "style: format code with prettier"
git commit -m "test: add auth service tests"
git commit -m "chore: update dependencies"
```

**Format:** `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code formatting
- `test`: Adding tests
- `chore`: Maintenance
- `refactor`: Code refactoring
- `perf`: Performance improvement

**Examples:**
```bash
git commit -m "feat(auth): add two-factor authentication"
git commit -m "fix(employee): prevent duplicate employee IDs"
git commit -m "docs(api): update endpoint documentation"
```

## Pull Request Process

### 1. Prepare Your Branch
```bash
# Update main branch
git fetch origin
git rebase origin/main

# Verify tests pass
npm test
npm run build
```

### 2. Push Your Changes
```bash
git push origin feature/your-feature-name
```

### 3. Create Pull Request

**Title:** Follow conventional commit format
- `feat: add new feature description`
- `fix: describe the bug fix`

**Description:**
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Documentation update
- [ ] Breaking change

## Testing
Describe how you tested this:
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing performed

## Checklist
- [ ] Documentation updated
- [ ] Code follows style guide
- [ ] Tests pass locally
- [ ] No linting errors
- [ ] Commits follow convention
```

### 4. Address Feedback
- Respond to review comments
- Make requested changes
- Push updated commits

### 5. Merge
Once approved, your PR will be merged!

## Code Style Guide

### TypeScript

```typescript
// Use clear naming
const getUserWithBranches = async (userId: string) => {};

// Use type safety
interface CreateUserDto {
  email: string;
  password: string;
  roleId: string;
}

// Use const arrow functions in modules
export const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Use proper error handling
try {
  const user = await userService.findById(id);
  if (!user) throw new NotFoundException('User not found');
} catch (error) {
  logger.error(error);
  throw error;
}
```

### React

```typescript
// Use functional components
export const EmployeeList: React.FC<EmployeeListProps> = ({ employees }) => {
  return (
    <div className="space-y-4">
      {employees.map((emp) => (
        <EmployeeCard key={emp.id} employee={emp} />
      ))}
    </div>
  );
};

// Use hooks properly
const Dashboard = () => {
  const [data, setData] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  return <DashboardView data={data} />;
};
```

### File Organization

```
modules/feature/
├── dto/
│   ├── create-feature.dto.ts
│   ├── update-feature.dto.ts
│   └── feature-response.dto.ts
├── feature.controller.ts    // Route handlers
├── feature.service.ts       // Business logic
├── feature.module.ts        // Module definition
└── feature.entity.ts        // Entity (if using)
```

## What to Contribute

### Great Starting Issues
- Look for `good first issue` label
- Look for `help wanted` label
- Documentation improvements
- Bug fixes with clear reproduction

### Feature Ideas
- New modules (e.g., Inventory, CRM)
- Enhanced reporting
- Mobile app
- Advanced analytics

### Documentation
- API examples
- Architecture diagrams
- Deployment guides
- Video tutorials

### Testing
- Unit test coverage
- Integration tests
- E2E tests
- Performance tests

## Development Tips

### Local Testing with Docker

```bash
# Full stack test
docker-compose up --build -d
docker-compose logs -f

# Test specific service
docker-compose logs backend -f
docker-compose logs frontend -f
```

### Database Testing

```bash
# Connect to database
docker exec -it erp-postgres psql -U postgres -d erp_db

# Run migrations
docker exec erp-backend npm run prisma:migrate

# Reset database
docker exec erp-backend npm run prisma:reset
```

### Performance Profiling

```bash
# Backend profiling
node --prof dist/main.js
node --prof-process isolate-*.log > report.txt

# Frontend performance
# Use Chrome DevTools Performance tab
```

## Reporting Issues

### Bug Reports

Include:
1. **Description**: What's the issue?
2. **Steps to Reproduce**: How to trigger it?
3. **Expected Behavior**: What should happen?
4. **Actual Behavior**: What happens instead?
5. **Environment**: OS, Node version, Docker version
6. **Logs**: Error messages and logs
7. **Screenshots**: Visual issues

### Feature Requests

Include:
1. **Description**: What feature?
2. **Use Case**: Why is it needed?
3. **Proposed Solution**: How should it work?
4. **Alternatives**: Other options?
5. **Additional Context**: Any other info?

## Maintainer Notes

### Reviewing PRs

Checklist for maintainers:
- [ ] Tests pass
- [ ] Code follows style guide
- [ ] Commits follow convention
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
- [ ] Performance acceptable
- [ ] Security implications reviewed

### Merging PRs

1. Squash commits if needed
2. Add PR to changelog
3. Tag version if release
4. Close related issues

### Releasing

Version format: `MAJOR.MINOR.PATCH`

```bash
npm version major|minor|patch
npm publish
git push origin main --tags
```

## Resources

- [NestJS Docs](https://nestjs.com)
- [Prisma Docs](https://prisma.io/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Docker Docs](https://docs.docker.com)

## Questions?

- Open a GitHub discussion
- Join our Discord (if available)
- Email maintainers
- Check documentation first

## License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT).

---

**Thank you for contributing to make ERP Starter Template better! 🙏**
