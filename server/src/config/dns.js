import dns from 'node:dns';

/**
 * Node's c-ares resolver on this Windows setup uses 127.0.0.1, which refuses
 * mongodb+srv SRV lookups. Pin public resolvers before Mongoose connects.
 */
dns.setServers(['8.8.8.8', '8.8.4.4']);
