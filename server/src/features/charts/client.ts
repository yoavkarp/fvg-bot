import { restClient } from '@polygon.io/client-js';
import { config } from '../../config.js';


if (!config.POLYGON_IO_API_KEY) {
    throw new Error("invalid-polygon-io-api-key");
}

export const client = restClient(config.POLYGON_IO_API_KEY);