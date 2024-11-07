import { inject, Injectable } from '@angular/core';
import { environment } from '../../environment/environment';

@Injectable({providedIn: 'root'})
export class ConfigService {
  public serverUrl: string = environment.serverUrl;
  public s3BucketLink: string = environment.s3BucketLink;

  constructor() { }
  
}