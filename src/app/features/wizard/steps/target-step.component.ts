import { Component, computed, inject } from '@angular/core';

import { EndpointFormComponent } from '../../../shared/components/endpoint-form/endpoint-form.component';
import { WizardService } from '../wizard.service';
import { EndpointConfig } from '../../../core/models/transfer-config.model';

@Component({
  selector: 'app-target-step',
  imports: [EndpointFormComponent],
  template: `
    <p class="helper-text">{{ description() }}</p>
    <app-endpoint-form
      [endpoint]="endpoint()"
      (endpointChange)="onChange($event)"
      [placeholder]="placeholder()"
      side="to"
    />
  `,
})
export class TargetStepComponent {
  private readonly wizard = inject(WizardService);

  protected readonly endpoint = computed<EndpointConfig>(() => this.wizard.config().target);

  protected readonly description = computed(() =>
    this.wizard.config().target.kind === 'server'
      ? 'Target Unblu server — entities will be written here.'
      : 'Target file or folder — the export will be written here.',
  );

  protected readonly placeholder = computed(() =>
    this.wizard.config().target.kind === 'file' ? '/tmp/out' : '',
  );

  protected onChange(endpoint: EndpointConfig): void {
    this.wizard.update({ target: endpoint });
  }
}
