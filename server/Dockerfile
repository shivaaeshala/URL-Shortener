# 1. Base Image (Lightweight Node)
FROM node:18-alpine

# 2. Working Directory
WORKDIR /app

# 3. Copy Package Files (Optimizes Docker layer caching)
COPY package*.json ./

# 4. Install Dependencies
RUN npm install

# 5. Copy Source Code
COPY . .

# 6. Build TypeScript
RUN npm run build

# 7. Expose Port
EXPOSE 5000

# 8. Command to start
CMD ["npm", "start"]