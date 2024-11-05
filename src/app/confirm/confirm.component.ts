import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm.component.html',
  styleUrl: './confirm.component.css'
})
export class ConfirmComponent {
  @Output() result = new EventEmitter<boolean>();
  visible = false;
  animatingOut = false;
  title = 'Confirmación';
  message = '';

  show(title: string, message: string) {
    this.title = title;
    this.message = message;
    this.visible = true;
    this.animatingOut = false;

    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.classList.remove('hide');
      }
    }, 10);
  }

  confirm() {
    this.startCloseAnimation(() => {
      this.result.emit(true);
    });
  }

  cancel() {
    this.startCloseAnimation(() => {
      this.result.emit(false);
    });
  }

  private startCloseAnimation(callback: () => void) {
    const modalElement = document.querySelector('.modal');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.classList.add('hide');
      this.animatingOut = true;

      setTimeout(() => {
        this.visible = false;
        this.animatingOut = false;
        callback();
      }, 500);
    }
  }
}
