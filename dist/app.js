"use strict";
class ProjectInput {
    constructor() {
        this.templateEl = document.getElementById("project-input");
        this.hostEl = document.getElementById("app");
        const importedData = document.importNode(this.templateEl.content, true);
        this.element = importedData.firstElementChild;
        this.element.id = "user-input";
        this.titleInputEl = this.element.querySelector("#title");
        this.descriptionInputEl = this.element.querySelector("#description");
        this.peopleInputEl = this.element.querySelector("#people");
        this.configure();
        this.attach();
    }
    handleSubmit(e) {
        e.preventDefault();
    }
    configure() {
        this.element.addEventListener("submit", this.handleSubmit.bind(this));
    }
    attach() {
        this.hostEl.insertAdjacentElement("afterbegin", this.element);
    }
}
const prInput = new ProjectInput();
//# sourceMappingURL=app.js.map