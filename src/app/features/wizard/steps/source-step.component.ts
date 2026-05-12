import { Component, computed, inject } from '@angular/core';

import { EndpointFormComponent } from '../../../shared/components/endpoint-form/endpoint-form.component';
import { WizardService } from '../wizard.service';
import { EndpointConfig } from '../../../core/models/transfer-config.model';

@Component({
  selector: 'app-source-step',
  imports: [EndpointFormComponent],
  template: `
    <p class="helper-text">{{ description() }}</p>
    <app-endpoint-form
      [endpoint]="endpoint()"
      (endpointChange)="onChange($event)"
      [placeholder]="placeholder()"
      side="from"
    />
  `,
})
export class SourceStepComponent {
  private readonly wizard = inject(WizardService);

  protected readonly endpoint = computed<EndpointConfig>(() => this.wizard.config().source);

  protected readonly description = computed(() =>
    this.wizard.config().source.kind === 'server'
      ? 'Source Unblu server — its credentials and entities will be read.'
      : 'Source file or folder — its previously exported entities will be read.',
  );

  protected readonly placeholder = computed(() =>
    this.wizard.config().source.kind === 'file' ? '/tmp/export.json' : '',
  );

  protected onChange(endpoint: EndpointConfig): void {
    this.wizard.update({ source: endpoint });
  }
}
