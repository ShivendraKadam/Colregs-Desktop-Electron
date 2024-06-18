import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SystemInfoService {
  private electronAPI: any;

  constructor() {
    if (window && (window as any).electronAPI) {
      this.electronAPI = (window as any).electronAPI;
    } else {
      console.warn(
        'electronAPI is not available. The app is not running in Electron.'
      );
    }
  }

  async getSystemInfo(): Promise<any> {
    try {
      if (this.electronAPI && this.electronAPI.getSystemInfo) {
        return await this.electronAPI.getSystemInfo();
      } else {
        throw new Error('getSystemInfo function is not available.');
      }
    } catch (err) {
      console.error('Error while fetching system information:', err);
      return null;
    }
  }
}
