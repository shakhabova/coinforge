import { Component, computed, input } from '@angular/core';
import { TuiIcon } from '@taiga-ui/core';
import { TransactionDto } from 'services/transactions.service';

const ICON_TYPE_MAP: Record<TransactionDto['type'], string> = {
  IN: '@tui.chevron-down',
  F2C: '@tui.chevron-down',
  C2C: '@tui.chevron-down',
  CSTD_IN: '@tui.chevron-down',

  OUT: '@tui.chevron-up',
  C2F: '@tui.chevron-up',
  CSTD_OUT: '@tui.chevron-up',
};

@Component({
  selector: 'app-transaction-type-icon',
  standalone: true,
  imports: [TuiIcon],
  templateUrl: './transaction-type-icon.component.html',
  styleUrl: './transaction-type-icon.component.css'
})
export class TransactionTypeIconComponent {
  type = input.required<TransactionDto['type']>();

  typeIcon = computed(() => ICON_TYPE_MAP[this.type()]);
}
