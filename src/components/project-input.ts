import { autobind } from "../decorators/autobind";
import { projectState } from "../state/project-state";
import { Validatable, validate } from "./../util/validation";
import { Component } from "./base-comp";

// Project Input class

export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
