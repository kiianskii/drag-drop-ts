// Validation

export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(validationCrit: Validatable) {
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
