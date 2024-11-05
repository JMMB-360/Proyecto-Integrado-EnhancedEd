import { Injectable, ComponentFactoryResolver, ApplicationRef, Injector } from '@angular/core';
import { ConfirmComponent } from './confirm/confirm.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {
  private confirmComponentRef: any;
  
  constructor(private componentFactoryResolver: ComponentFactoryResolver,
              private appRef: ApplicationRef,
              private injector: Injector) {
  }

  private createComponent() {
    const factory = this.componentFactoryResolver.resolveComponentFactory(ConfirmComponent);
    this.confirmComponentRef = factory.create(this.injector);
    this.appRef.attachView(this.confirmComponentRef.hostView);
    document.body.appendChild(this.confirmComponentRef.location.nativeElement);
  }

  ask(title: string, message: string): Promise<boolean> {
    if (!this.confirmComponentRef) {
      this.createComponent();
    }
    const instance = this.confirmComponentRef.instance as ConfirmComponent;
    return new Promise<boolean>((resolve) => {
      instance.show(title, message);
      instance.result.subscribe((confirmed: boolean) => {
        resolve(confirmed);
      });
    });
  }
}
