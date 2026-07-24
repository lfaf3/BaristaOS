"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = listCategories;
exports.createCategory = createCategory;
function listCategories(app, companyId) {
    return app.prisma.category.findMany({
        where: { companyId: companyId, active: true },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        select: { id: true, code: true, name: true, sortOrder: true }
    });
}
function createCategory(app, companyId, data) {
    return app.prisma.category.create({
        data: __assign({ companyId: companyId }, data),
        select: { id: true, code: true, name: true, sortOrder: true, active: true }
    });
}
