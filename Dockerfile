# Stage 1: Build the React client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Setup the Express server
FROM node:18-alpine AS server
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm install --production

COPY server/ ./server/
# Copy built client to a public folder accessible by the server
COPY --from=client-builder /app/client/dist ./server/public

# Run the server
WORKDIR /app/server
ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
