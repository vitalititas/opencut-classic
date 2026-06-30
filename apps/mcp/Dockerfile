FROM oven/bun:1-slim
WORKDIR /app
COPY package.json tsconfig.json ./
RUN bun install
COPY src ./src
RUN bun run build
EXPOSE 3001
CMD ["bun", "run", "dist/index.js"]
