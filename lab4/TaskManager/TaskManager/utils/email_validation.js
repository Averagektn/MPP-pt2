"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
exports.default = validateEmail;
//# sourceMappingURL=email_validation.js.map