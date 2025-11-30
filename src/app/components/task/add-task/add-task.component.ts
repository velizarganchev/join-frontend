import { Component, OnInit } from '@angular/core';
import { MultiSelectDropdownComponent } from "../../shared/multi-select-dropdown/multi-select-dropdown.component";
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClickStopPropagationDirective } from '../../shared/click-stop-propagation.directive';
import { __values } from 'tslib';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [ClickStopPropagationDirective, ReactiveFormsModule, MultiSelectDropdownComponent],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit {
  name = 'Angular';
  bgColor = 'orange';
  isPrioSelected = false;
  showAddSubtaskIcons = false;
  subtaskInput = '';
  members: any[] = [];

  taskForm!: FormGroup;

  constructor() { }

  ngOnInit(): void {
    this.initForm();
  }

  onHandleSelectedContacts(contacts: any[]) {
    contacts.forEach(el => {
      this.members.push(el.id);
    });
  }

  choosePrio(prio: any) {
    switch (prio) {
      case 'low':
        this.bgColor = 'limegreen'
        break;
      case 'medium':
        this.bgColor = 'orange'
        break;
      case 'high':
        this.bgColor = 'red'
        break;
      default:
        this.bgColor = 'orange'
        break;
    }

    this.taskForm.value['priority'] = prio
  }

  onTogleSubtaskIcons() {
    this.showAddSubtaskIcons = !this.showAddSubtaskIcons;
  }

  onAddSubtask() {
    console.log(this.subtaskInput);

  }

  onCreateTask() {
    this.taskForm.value['members'] = this.members;
    console.log(this.taskForm.value);
  }

  private initForm() {

    let title = '';
    let category = 'user_story';
    let description = '';
    let status = '';
    let color = '';
    let priority = '';
    let members = new FormArray([]);
    let due_date = '';
    let checked = false;
    let subtasks = new FormArray([]);

    this.taskForm = new FormGroup({
      title: new FormControl(title, Validators.required),
      category: new FormControl(category, Validators.required),
      description: new FormControl(description),
      status: new FormControl(status, Validators.required),
      color: new FormControl(color, Validators.required),
      priority: new FormControl(priority, Validators.required),
      members: members,
      due_date: new FormControl(due_date, Validators.required),
      checked: new FormControl(checked, Validators.required),
      subtasks: subtasks
    });

  }

  get formSubtasks() {
    return (<FormArray>this.taskForm.get('subTasksArray')).controls;
  }
}
