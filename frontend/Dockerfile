FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and yarn.lock to work directory
COPY package.json .
COPY yarn.lock .

# Install dependencies
RUN yarn install

# Copy everything to work directory
COPY . .

# Build the React app
RUN yarn build

# Expose port 3000
EXPOSE 3000

# Serve the app
CMD ["http-server", "./build", "-p", "3000"]