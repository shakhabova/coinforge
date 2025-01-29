import { Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiSwitch } from '@taiga-ui/kit';
import { TuiInputComponent, TuiInputModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    TuiInputModule,
    FormsModule,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiSwitch,
    TuiIcon
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
  
})
export class UserProfileComponent {
name = model('');
email = model('');
phone = model('');
googleAuth = model(false);

googleAuthChanged(){

}
}
