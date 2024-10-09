import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({providedIn: 'root'})
export class ConfigService {
  public serverUrl: string = 'https://crp-custody-dev.apps.ocp-dev.gps.local';
  public s3BucketLink: string = environment.s3BucketLink;

  constructor() { }
  
}