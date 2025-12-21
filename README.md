# Link Redirect Service - Cloudflare Pages Version

This is a secure link redirection service based on Cloudflare Pages Functions, supporting multiple encryption methods and comprehensive security features.

## Key Features

- ✅ **Multiple Redirection Methods**
  - Traditional URL parameter redirection
  - AES-256 encrypted redirection

- 🔐 **Security Features**
  - JWT session management
  - Domain whitelist validation
  - Referer security checks
  - Delayed redirection with target URL display
  - Click statistics and logging

- 🎨 **User-Friendly**
  - Clean management interface
  - One-click encrypted link generation
  - Support for custom source identification
  - Configurable delay time

## Quick Start

### 1. Deploy to Cloudflare Pages

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy the project
wrangler pages deploy public --project-name=link-redirect-service
```

### 2. Configure Environment Variables

Add the following environment variables in your Cloudflare Pages project settings:

#### Required Variables

- `GENERATE_PAGE_PASSWORD`: Password for accessing the generation page
- `ENCRYPTION_KEY`: AES encryption key (recommended: 32+ characters)
- `JWT_SECRET`: JWT signing secret (recommended: 32+ characters)

#### Optional Variables

- `SESSION_TIMEOUT`: Session timeout in seconds (default: 3600)
- `DEFAULT_DELAY`: Default delay time in milliseconds (default: 3000)
- `ENABLE_REFERER_CHECK`: Enable Referer checking (default: true)
- `ENABLE_DELAY`: Enable delayed redirection (default: true)
- `ALLOWED_DOMAINS`: Allowed target domains, comma-separated
- `ALLOWED_REFERERS`: Allowed source domains, comma-separated
- `NO_REFERER_CHECK_DOMAINS`: Domains where Referer checking is skipped, comma-separated
- `ALLOW_EMPTY_REFERER_DOMAINS`: Domains allowing empty Referer, comma-separated
- `WEBHOOK_URL`: Statistics webhook URL

### 3. Configure KV Namespace (Optional)

If you need persistent statistics:

```bash
# Create KV namespace
wrangler kv:namespace create "REDIRECT_STATS"

# Bind KV namespace in Pages project settings
# Variable name: REDIRECT_STATS
# KV namespace: Select the one you just created
```

## Usage

### 1. Traditional Redirection (Unencrypted)

Pass parameters directly in the URL:

```
https://your-domain.pages.dev/redirect?to=https://example.com&source=newsletter&delay=5000
```

Parameter description:
- `to`: Target URL (required)
- `source`: Source identifier (optional)
- `delay`: Delay time in milliseconds (optional)

### 2. Encrypted Redirection

After logging in at `/login`, use the generation tool to create encrypted links:

1. Visit `https://your-domain.pages.dev/login`
2. Enter password to login
3. Fill in the target URL and parameters on the generation page
4. Click to generate the link

Generated link format:
- AES: `https://your-domain.pages.dev/e/encrypted-data`

## Project Structure

```
.
├── functions/              # Cloudflare Pages Functions
│   ├── api/               # API routes
│   │   ├── login.js       # Login API
│   │   ├── logout.js      # Logout API
│   │   └── generate.js    # Link generation API
│   ├── e/                 # AES encrypted redirection
│   │   └── [[path]].js    # Dynamic route
│   ├── lib/               # Utility library
│   │   └── utils.js       # Common functions
│   ├── index.js           # Home page
│   ├── login.js           # Login page
│   ├── generate.js        # Generation page
│   ├── redirect.js        # Traditional redirection
│   └── health.js          # Health check
├── public/                # Static files directory
├── wrangler.toml          # Cloudflare configuration
└── README.md              # Project documentation
```

## API Endpoints

- `GET /` - Home page and usage instructions
- `GET /login` - Login page
- `POST /api/login` - Login API
- `POST /api/logout` - Logout API
- `GET /generate` - Link generation page (requires login)
- `GET /api/generate` - Link generation API (requires login)
- `GET /redirect?to=URL` - Traditional redirection
- `GET /e/{encrypted}` - AES encrypted redirection
- `GET /health` - Health check

## Security Recommendations

1. **Strong Password**: Use a strong password for `GENERATE_PAGE_PASSWORD`
2. **Key Management**: Regularly rotate `ENCRYPTION_KEY` and `JWT_SECRET`
3. **Domain Restrictions**: Configure `ALLOWED_DOMAINS` to limit target domains
4. **Referer Checks**: Configure `ALLOWED_REFERERS` to limit sources
5. **HTTPS**: Ensure the service is accessed over HTTPS
6. **Log Monitoring**: Regularly check logs for abnormal access

## Differences from Workers Version

### Advantages of Cloudflare Pages Functions

1. **File System Routing**: More intuitive route structure
2. **Static Assets**: Can directly host static files
3. **Automatic Deployment**: Git integration with automatic deployment
4. **Free Tier**: Higher free request quota

### Major Changes

1. **Routing Method**: Changed from single entry to file system routing
2. **Context Object**: Uses `context` object instead of `env` and `ctx`
3. **Export Method**: Uses `onRequest*` functions for exports
4. **Modularization**: Better code organization and modularity

## Development

### Local Development

```bash
# Install dependencies
npm install wrangler -g

# Run locally
wrangler pages dev public

# Access http://localhost:8788
```

### Deployment

```bash
# Deploy to production
wrangler pages deploy public --project-name=link-redirect-service

# Deploy to preview environment
wrangler pages deploy public --project-name=link-redirect-service --branch=preview
```

## Troubleshooting

### 1. Login Failure

- Check if the `GENERATE_PAGE_PASSWORD` environment variable is correctly configured
- Check the browser console for error messages

### 2. Encrypted Link Inaccessible

- Check if the `ENCRYPTION_KEY` environment variable is configured
- Ensure the key is consistent between generation and access

### 3. JWT Session Expired

- Check if the `JWT_SECRET` environment variable is configured
- Adjust `SESSION_TIMEOUT` to increase session duration

## License

MIT License

## Contributing

Contributions via Issues and Pull Requests are welcome!
