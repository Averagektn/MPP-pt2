"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Task {
    constructor(name, description, status = null, id = null, date = null, photo = null) {
        this.id = id;
        this.date = date;
        this.name = name;
        this.description = description;
        this.status = status;
        this.photo = photo;
    }
}
exports.default = Task;
//# sourceMappingURL=Task.js.map