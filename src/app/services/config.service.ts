import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class ConfigService {
  public serverUrl: string = 'https://crp-custody-dev.apps.ocp-dev.gps.local';

  constructor() { }
  
}