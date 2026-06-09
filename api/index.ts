import express from "express";

const handlerExpress = express();
handlerExpress.use(express.json());

handlerExpress.all("*", async (req, res, next) => {
  try {
    let app;
    try {
      // 1. Try loading our fully bundled, high-compatibility server compiled for Node
      const serverCjs = await import("../dist/server.cjs");
      app = serverCjs.default || serverCjs;
    } catch (cjsErr) {
      console.warn("Could not import pre-bundled server.cjs, falling back to source server.js");
      try {
        const serverTs = await import("../server.js");
        app = serverTs.default || serverTs;
      } catch (tsErr) {
        throw new Error(
          `CJS error: [${(cjsErr as any).message}], TS error: [${(tsErr as any).message}]`
        );
      }
    }

    if (typeof app !== "function") {
      // Handle cases where the default export is nested or is an object
      if (app.default && typeof app.default === "function") {
        app = app.default;
      } else {
        throw new Error("Imported module is not a function/Express app instance");
      }
    }

    return app(req, res, next);
  } catch (err: any) {
    console.error("Vercel Dynamic Routing Error:", err);
    res.status(500).json({
      error: "Vercel Dynamic Routing Error",
      message: err.message,
      stack: err.stack,
      cwd: process.cwd(),
      env: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL
      }
    });
  }
});

export default handlerExpress;
