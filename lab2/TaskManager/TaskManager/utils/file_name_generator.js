"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateUniqueFileName(originalName) {
    const fileExtension = originalName.split('.').pop();
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 10000);
    return `${timestamp}-${randomNum}.${fileExtension}`;
}
exports.default = generateUniqueFileName;
//# sourceMappingURL=file_name_generator.js.map