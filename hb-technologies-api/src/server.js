require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const { env } = require("./config/env");
const { apiRouter } = require("./routes");
const { errorHandler } = require("./middleware/errorHandler");
const { requestId } = require("./utils/requestId");
const { requestLogger } = require("./middleware/requestLogger");
const { requireHttps } = require("./middleware/requireHttps");
const { csrfProtection } = require("./middleware/csrfProtection");
const { securityHeadersMiddleware } = require("./middleware/securityHeaders");

const app = express();

app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(requestId);
app.use(requestLogger);
app.use(requireHttps);
app.use(securityHeadersMiddleware);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
  })
);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients with no origin (curl, server-to-server)
      if (!origin) return callback(null, true);

      if (env.corsOrigins.length === 0) return callback(null, false);
      if (env.corsOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
  })
);

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: true,
    legacyHeaders: false,
    handler(req, res) {
      return res.status(429).set("Retry-After", "60").json({
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many requests. Please retry after 60 seconds.",
        retryAfter: 60,
      });
    },
  })
);

app.use(express.json({ limit: "100kb" }));

app.use(csrfProtection);

app.use(apiRouter);

app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "The requested API route does not exist.",
    requestId: req.id,
  });
});

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`hb-technologies-api listening on :${env.PORT} (${env.NODE_ENV})`);
});
