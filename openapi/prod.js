import { exec } from "node:child_process";

const generateOpenapiTsFile = () =>
  exec(
    `npx openapi-typescript ${process.env.OPENAPI_JSON_PATH} -o ${process.env.OPENAPI_TS_PATH}`,
  );

generateOpenapiTsFile();
