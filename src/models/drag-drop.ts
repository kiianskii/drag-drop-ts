// Drag & Drop interfaces

export interface Draggable {
  dragStartHandle(event: DragEvent): void;
  dragEndHandle(event: DragEvent): void;
}
export interface Dragtarget {
  dragOverHandle(event: DragEvent): void;
  dropHandle(event: DragEvent): void;
  dragLeaveHandle(event: DragEvent): void;
}
