FROM node:lts-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:lts-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
COPY package*.json ./
RUN npm ci
COPY --from=build /app/build ./build
COPY --from=build /app/server ./server
EXPOSE 8787
CMD ["npm", "run", "start"]
