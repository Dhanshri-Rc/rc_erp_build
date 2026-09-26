FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:22-alpine
WORKDIR /app/backend
ENV NODE_ENV=production
ENV PORT=5000
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
EXPOSE 5000
CMD ["sh", "-c", "if [ \"$BOOTSTRAP_ADMIN\" = \"true\" ]; then npm run seed || exit 1; fi; npm start"]