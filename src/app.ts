// Project State Management

class ProjectState {
  private listeners: any = [];
  private projects: any[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addListener(listenerFn: Function) {
    this.listeners.push(listenerFn);
  }

  addProject(title: string, description: string, people: number) {
    const newProject = {
      id: Math.random().toString(),
      title,
      description,
      people,
    };
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

// Validation

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validationCrit: Validatable) {
  let isValid = true;

  if (validationCrit.required) {
    isValid = isValid && validationCrit.value.toString().trim().length !== 0;
  }

  if (
    validationCrit.minLength != null &&
    typeof validationCrit.value === "string"
  ) {
    isValid = isValid && validationCrit.value.length > validationCrit.minLength;
  }

  if (
    validationCrit.maxLength != null &&
    typeof validationCrit.value === "string"
  ) {
    isValid = isValid && validationCrit.value.length < validationCrit.maxLength;
  }

  if (validationCrit.min != null && typeof validationCrit.value === "number") {
    isValid = isValid && validationCrit.value > validationCrit.min;
  }

  if (validationCrit.max != null && typeof validationCrit.value === "number") {
    isValid = isValid && validationCrit.value < validationCrit.max;
  }

  return isValid;
}

// autobind decorator
function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const upgDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return upgDescriptor;
}

// Project List class

class ProjectList {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: any[];

  constructor(private type: "active" | "finished") {
    this.templateEl = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    const importedData = document.importNode(this.templateEl.content, true);
    this.assignedProjects = [];
    this.element = importedData.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    projectState.addListener((projects: any[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = prjItem.title;
      listEl.appendChild(listItem);
    }
  }

  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private attach() {
    this.hostEl.insertAdjacentElement("beforeend", this.element);
  }
}

// Project Input class

class ProjectInput {
  templateEl: HTMLTemplateElement;
  hostEl: HTMLDivElement;
  element: HTMLFormElement;
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    this.templateEl = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById("app")! as HTMLDivElement;

    const importedData = document.importNode(this.templateEl.content, true);

    this.element = importedData.firstElementChild as HTMLFormElement;
    this.element.id = "user-input";
    this.titleInputEl = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputEl = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputEl = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherInputs(): [string, string, number] | void {
    const userTitle = this.titleInputEl.value;
    const userDescription = this.descriptionInputEl.value;
    const userPeople = this.peopleInputEl.value;

    const validationTitle: Validatable = {
      value: userTitle,
      required: true,
      minLength: 10,
    };
    const validationDescription: Validatable = {
      value: userDescription,
      required: true,
      minLength: 10,
    };
    const validationPeople: Validatable = {
      value: +userPeople,
      required: true,
      min: 0,
      max: 10,
    };

    if (
      !validate(validationTitle) &&
      !validate(validationDescription) &&
      !validate(validationPeople)
    ) {
      alert("Invalid input, try again");
      return;
    } else {
      return [userTitle, userDescription, +userPeople];
    }
  }

  @autobind
  private handleSubmit(e: Event) {
    e.preventDefault();
    const userInfo = this.gatherInputs();
    if (Array.isArray(userInfo)) {
      projectState.addProject(...userInfo);
      this.element.reset();
    }
  }

  @autobind
  private configure() {
    this.element.addEventListener("submit", this.handleSubmit);
  }

  private attach() {
    this.hostEl.insertAdjacentElement("afterbegin", this.element);
  }
}

const prInput = new ProjectInput();
const finishedPrList = new ProjectList("finished");
const activePrList = new ProjectList("active");
