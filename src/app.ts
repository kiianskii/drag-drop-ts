// Drag & Drop interfaces
interface Draggable {
  dragStartHandle(event: DragEvent): void;
  dragEndHandle(event: DragEvent): void;
}
interface Dragtarget {
  dragOverHandle(event: DragEvent): void;
  dropHandle(event: DragEvent): void;
  dragLeaveHandle(event: DragEvent): void;
}

//Project Types

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// Project State Management
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];
  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    this.updateListeners();
  }
  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }
  private updateListeners() {
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

// Component Class

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateEl: HTMLTemplateElement;
  hostEl: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateEl = document.getElementById(
      templateId
    )! as HTMLTemplateElement;
    this.hostEl = document.getElementById(hostElementId)! as T;

    const importedData = document.importNode(this.templateEl.content, true);

    this.element = importedData.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }
  private attach(insertAtStart: boolean) {
    this.hostEl.insertAdjacentElement(
      insertAtStart ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure(): void;
  abstract renderContent(): void;
}

// Project Item class

class ProjectItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 person";
    } else {
      return `${this.project.people} persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @autobind
  dragStartHandle(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHandle(_: DragEvent): void {
    console.log("Dragend");
  }

  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandle);
    this.element.addEventListener("dragend", this.dragEndHandle);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent = this.persons + " assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// Project List class

class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements Dragtarget
{
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @autobind
  dragOverHandle(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autobind
  dropHandle(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }

  @autobind
  dragLeaveHandle(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandle);
    this.element.addEventListener("drop", this.dropHandle);
    this.element.addEventListener("dragleave", this.dragLeaveHandle);
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((prj) => {
        if (this.type === "active") {
          return prj.status === ProjectStatus.Active;
        }
        return prj.status === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
  }

  renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listEl = document.getElementById(
      `${this.type}-projects-list`
    )! as HTMLUListElement;
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProjects) {
      new ProjectItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }
}

// Project Input class

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputEl: HTMLInputElement;
  descriptionInputEl: HTMLInputElement;
  peopleInputEl: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");

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
  configure() {
    this.element.addEventListener("submit", this.handleSubmit);
  }
  renderContent() {}
}

const prInput = new ProjectInput();
const finishedPrList = new ProjectList("finished");
const activePrList = new ProjectList("active");
