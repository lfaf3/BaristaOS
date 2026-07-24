"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
var adapter_pg_1 = require("@prisma/adapter-pg");
var client_js_1 = require("../generated/prisma/client.js");
var env_js_1 = require("../config/env.js");
var adapter = new adapter_pg_1.PrismaPg({ connectionString: env_js_1.env.DATABASE_URL });
exports.prisma = new client_js_1.PrismaClient({ adapter: adapter });
