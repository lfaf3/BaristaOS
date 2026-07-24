"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var token_hash_js_1 = require("../src/shared/security/token-hash.js");
(0, vitest_1.describe)("hashToken", function () {
    (0, vitest_1.it)("gera SHA-256", function () {
        var hash = (0, token_hash_js_1.hashToken)("token");
        (0, vitest_1.expect)(hash).toHaveLength(64);
        (0, vitest_1.expect)(hash).toBe((0, token_hash_js_1.hashToken)("token"));
    });
});
