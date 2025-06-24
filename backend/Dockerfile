# Use Node.js 18
FROM node:18-alpine

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy backend package.json first for better caching
COPY backend/package.json ./backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy backend source
COPY backend/ ./backend/
COPY shared/ ./shared/

# Build the backend
RUN pnpm --filter backend build

# Expose port
EXPOSE 3001

# Start the application
CMD ["pnpm", "--filter", "backend", "start"] 