import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from '../alert.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.css'
})
export class AlertComponent implements OnInit, OnDestroy {
  alert: { type: string, message: string, longTime: boolean } | null = null;
  private alertSub!: Subscription;

  constructor(private alertService: AlertService) {}

  ngOnInit() {
    this.alertSub = this.alertService.alert$.subscribe(alert => {
      this.alert = alert;
      if(alert.longTime) {
        setTimeout(() => this.alert = null, 12000);
      } else {
        setTimeout(() => this.alert = null, 6000);
      };
    });
  }

  closeAlert() {
    this.alert = null;
  }

  ngOnDestroy() {
    this.alertSub.unsubscribe();
  }
}
