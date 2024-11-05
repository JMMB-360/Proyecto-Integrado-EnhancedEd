import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private alertSubject = new Subject<{ type: string, message: string, longTime: boolean }>();
  alert$ = this.alertSubject.asObservable();

  showAlert(type: string, message: string, longTime: boolean = false) {
    this.alertSubject.next({ type, message, longTime });
  }
}
