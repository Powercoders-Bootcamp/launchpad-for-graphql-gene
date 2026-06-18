FROM node:22-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY mcp-server/package.json mcp-server/package-lock.json ./mcp-server/

RUN npm ci --ignore-scripts
RUN npm ci --prefix mcp-server --ignore-scripts

COPY content ./content
COPY packages ./packages
COPY server/utils/playground ./server/utils/playground
COPY types ./types
COPY mcp-server ./mcp-server

RUN npm run mcp:build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV GRAPHQL_GENE_MCP_HOST=0.0.0.0
ENV GRAPHQL_GENE_MCP_PORT=3001
ENV GRAPHQL_GENE_MCP_PATH=/mcp
ENV GRAPHQL_GENE_MCP_HEALTH_PATH=/healthz
ENV GRAPHQL_GENE_MCP_MAX_BODY_BYTES=262144
ENV GRAPHQL_GENE_MCP_RATE_LIMIT_WINDOW_MS=60000
ENV GRAPHQL_GENE_MCP_RATE_LIMIT_MAX_REQUESTS=120
ENV GRAPHQL_GENE_MCP_ENABLE_ACCESS_LOGS=true

COPY --from=build /app/package.json ./package.json
COPY --from=build /app/content ./content
COPY --from=build /app/mcp-server/package.json ./mcp-server/package.json
COPY --from=build /app/mcp-server/node_modules ./mcp-server/node_modules
COPY --from=build /app/mcp-server/dist ./mcp-server/dist

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD node -e "const port=process.env.GRAPHQL_GENE_MCP_PORT||'3001'; const path=process.env.GRAPHQL_GENE_MCP_HEALTH_PATH||'/healthz'; fetch(`http://127.0.0.1:${port}${path}`).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "mcp-server/dist/mcp-server/src/http-entry.js"]
