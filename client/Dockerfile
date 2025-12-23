# 1. Base Image
FROM node:20-alpine

# 2. Working Directory
WORKDIR /app

# 3. Install Dependencies
COPY package*.json ./
RUN npm install

# 4. Copy Source Code
COPY . .

# 5. Build the Next.js app (Creates the .next folder)
RUN npm run build

# 6. Expose the Next.js Port
EXPOSE 3000

# 7. Start the App
CMD ["npm", "start"]