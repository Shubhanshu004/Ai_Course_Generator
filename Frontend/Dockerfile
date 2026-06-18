# --- Build Stage ---
FROM node:20-alpine AS build
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

# Set up build argument and pass it to environment
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Copy built files from build stage to nginx html folder
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

# Copy nginx config for client-side routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
