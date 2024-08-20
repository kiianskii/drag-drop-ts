"use strict";
class ProjectInput {
    constructor() {
        this.templateEl = document.getElementById("project-input");
        this.hostEl = document.getElementById("app");
        const importedData = document.importNode(this.templateEl.content, true);
        this.element = importedData.firstElementChild;
        this.element.id = "user-input";
        this.attach();
    }
    attach() {
        this.hostEl.insertAdjacentElement("afterbegin", this.element);
    }
}
const prInput = new ProjectInput();
//# sourceMappingURL=app.js.map