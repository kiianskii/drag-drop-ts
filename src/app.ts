class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    const importedData = document.importNode(this.templateEl.content, true);

    this.element = importedData.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    this.attach();
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.element);
  }
}

const prInput = new ProjectInput();
