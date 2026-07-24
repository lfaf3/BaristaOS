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
exports.findProducts = findProducts;
exports.findProductById = findProductById;
exports.findCategory = findCategory;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
function findProducts(app, companyId, filters) {
    return app.prisma.product.findMany({
        where: __assign(__assign({ companyId: companyId, active: true }, (filters.categoryId ? { categoryId: filters.categoryId } : {})), (filters.favorites !== undefined ? { favorite: filters.favorites } : {})),
        include: { category: { select: { id: true, code: true, name: true } } },
        orderBy: [{ favorite: "desc" }, { name: "asc" }]
    });
}
function findProductById(app, companyId, id) {
    return app.prisma.product.findFirst({
        where: { id: id, companyId: companyId, active: true },
        include: { category: { select: { id: true, code: true, name: true } } }
    });
}
function findCategory(app, companyId, id) {
    return app.prisma.category.findFirst({ where: { id: id, companyId: companyId, active: true } });
}
function createProduct(app, companyId, data) {
    var _a;
    return app.prisma.product.create({
        data: {
            companyId: companyId,
            categoryId: data.categoryId,
            code: data.code,
            name: data.name,
            description: (_a = data.description) !== null && _a !== void 0 ? _a : null,
            price: data.price,
            aliases: data.aliases,
            favorite: data.favorite
        },
        include: { category: { select: { id: true, code: true, name: true } } }
    });
}
function updateProduct(app, id, data) {
    var _a;
    var updateData = {};
    if (data.categoryId !== undefined)
        updateData.categoryId = data.categoryId;
    if (data.code !== undefined)
        updateData.code = data.code;
    if (data.name !== undefined)
        updateData.name = data.name;
    if (Object.prototype.hasOwnProperty.call(data, "description"))
        updateData.description = (_a = data.description) !== null && _a !== void 0 ? _a : null;
    if (data.price !== undefined)
        updateData.price = data.price;
    if (data.aliases !== undefined)
        updateData.aliases = data.aliases;
    if (data.favorite !== undefined)
        updateData.favorite = data.favorite;
    return app.prisma.product.update({
        where: { id: id },
        data: updateData,
        include: { category: { select: { id: true, code: true, name: true } } }
    });
}
