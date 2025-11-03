# CI/CD Pipeline Setup

## Status Badges

Add these to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/anandaa-arch/MyCanteen/actions/workflows/ci.yml/badge.svg)
![Deploy](https://github.com/anandaa-arch/MyCanteen/actions/workflows/deploy.yml/badge.svg)
```

## 🚀 What's Automated

### 1. **Continuous Integration (CI)** - `.github/workflows/ci.yml`
Runs on every push and pull request to `main` and `develop` branches:

- ✅ **Lint Check** - ESLint validation
- ✅ **Build Test** - Verifies production build succeeds
- ✅ **Security Audit** - npm audit for vulnerabilities
- ✅ **Type Check** - TypeScript validation (when applicable)
- ✅ **Test Summary** - Aggregated results

### 2. **Continuous Deployment (CD)** - `.github/workflows/deploy.yml`
Runs on push to `main` branch:

- ✅ Build verification
- ✅ Production deployment preparation
- ✅ Manual deployment trigger available

### 3. **Dependency Monitoring** - `.github/workflows/dependency-check.yml`
Runs weekly (every Monday):

- ✅ Check for outdated packages
- ✅ Security vulnerability scanning
- ✅ Audit report generation

## 🔧 Required Setup

### 1. Add GitHub Secrets

Go to: `Settings → Secrets and variables → Actions → New repository secret`

Add these secrets:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 2. Enable GitHub Actions

1. Go to your repository
2. Click `Actions` tab
3. Click "I understand my workflows, go ahead and enable them"

### 3. Verify Workflows

After pushing to GitHub:
```bash
git add .github/
git commit -m "Add CI/CD pipeline"
git push origin main
```

Check: `https://github.com/anandaa-arch/MyCanteen/actions`

## 📊 Pipeline Flow

```
┌─────────────────────────────────────────────┐
│  Push/PR to main or develop                 │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Job 1: Lint & Format Check                 │
│  - ESLint validation                        │
│  - Code style verification                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Job 2: Build Test                          │
│  - Install dependencies                     │
│  - Run Next.js production build             │
│  - Upload build artifacts                   │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Job 3: Security Audit                      │
│  - npm audit check                          │
│  - Vulnerability reporting                  │
└────────────────┬────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────┐
│  Job 4: Test Summary                        │
│  - Aggregate results                        │
│  - Generate summary report                  │
└─────────────────────────────────────────────┘
```

## 🎯 Workflow Triggers

### CI Pipeline (`ci.yml`)
- ✅ Push to `main` or `develop`
- ✅ Pull requests to `main` or `develop`
- ✅ Manual trigger via Actions tab

### Deploy Pipeline (`deploy.yml`)
- ✅ Push to `main` only
- ✅ Manual trigger via Actions tab

### Dependency Check (`dependency-check.yml`)
- ✅ Every Monday at 9 AM UTC
- ✅ Manual trigger via Actions tab

## 🔍 Monitoring & Notifications

### View Pipeline Status
```
https://github.com/anandaa-arch/MyCanteen/actions
```

### Enable Email Notifications
1. Go to GitHub Settings → Notifications
2. Enable "Actions" notifications
3. Choose notification preferences

### Slack Integration (Optional)
Add to workflow:
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🛠️ Common Commands

### Run locally before pushing
```bash
# Lint check
npm run lint

# Build test
npm run build

# Security audit
npm audit

# Check outdated packages
npm outdated
```

### Manual workflow trigger
```bash
# Using GitHub CLI
gh workflow run ci.yml
gh workflow run deploy.yml
gh workflow run dependency-check.yml
```

## 📈 Performance Metrics

The pipeline typically completes in:
- **Lint**: ~30-45 seconds
- **Build**: ~2-3 minutes
- **Security**: ~20-30 seconds
- **Total**: ~3-4 minutes

## 🔐 Security Best Practices

1. ✅ Never commit secrets to repository
2. ✅ Use GitHub Secrets for sensitive data
3. ✅ Enable branch protection rules
4. ✅ Require CI checks to pass before merge
5. ✅ Review dependency audit reports weekly

## 🚨 Troubleshooting

### Build fails in CI but works locally
- Check Node.js version matches (20.x)
- Verify environment variables are set in GitHub Secrets
- Check for missing dependencies

### Lint errors in CI
- Run `npm run lint` locally
- Fix all errors before pushing
- Update ESLint config if needed

### Security audit fails
- Review vulnerabilities: `npm audit`
- Update packages: `npm audit fix`
- Check for breaking changes

## 📝 Next Steps

### Add Unit Tests
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Update `package.json`:
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```

### Add E2E Tests
```bash
npm install --save-dev @playwright/test
```

### Code Coverage
```bash
npm install --save-dev @codecov/codecov
```

Add to workflow:
```yaml
- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 🎉 Benefits

- ✅ **Automated Quality Checks** - Catch errors before production
- ✅ **Consistent Builds** - Same environment every time
- ✅ **Security Monitoring** - Early vulnerability detection
- ✅ **Time Savings** - No manual testing required
- ✅ **Collaboration** - Clear status on PRs
- ✅ **Deployment Safety** - Build verification before deploy

## 📚 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js CI/CD Guide](https://nextjs.org/docs/deployment)
- [npm Audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
