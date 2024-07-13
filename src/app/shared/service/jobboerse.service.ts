import { Injectable, OnInit } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JobboerseService {
  private accessToken: string = '';
  private tokenExpiryTime: number = 0;
  private itemsPerPage = 25;
  private currentPage = 1;

  public currentFilters: string = '';
  public currentJobsPage = [];
  public currentJobsCount = 0;
  public currentPageCount = 0;

  constructor() {
    console.log('JobboerseService constructor');
    this.setFilters({
      'was': 'Softwareentwickler',
      'wo': 'Leipzig',
      'umkreis': 50,
    })
    this.fetchJobs();
  }

  async getToken(clientId: string, clientSecret: string, tokenUrl: string) {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to obtain token');
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiryTime = Date.now() + data.expires_in * 1000;
  }


  async getValidToken(clientId: string, clientSecret: string, tokenUrl: string) {
    if (!this.accessToken || Date.now() >= this.tokenExpiryTime) {
      console.log('Getting new token...');
      await this.getToken(clientId, clientSecret, tokenUrl);
    }
    return this.accessToken;
  }


  async getNextPage() {
    this.currentPage++;
    await this.fetchJobs();
  }


  getPageParameters() {
    return 'page=' + this.currentPage + '&size=' + this.itemsPerPage;
  }


  setFilters(filters: { [key: string]: any }) {
    this.currentFilters = Object.keys(filters).map(key => `${key}=${filters[key]}`).join('&');
    this.currentPage = 1;
  }


  async fetchJobs(page: number = 1) {
    const clientId = 'c003a37f-024f-462a-b36d-b001be4cd24a';
    const clientSecret = '32a39620-32b3-4307-9aa1-511e3d7f48a8';
    const tokenUrl = 'https://rest.arbeitsagentur.de/oauth/gettoken_cc';
    const apiUrl = 'https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs';

    try {
      const token = await this.getValidToken(clientId, clientSecret, tokenUrl);
      const response = await fetch(apiUrl + '?' + this.getPageParameters() + '&' + this.currentFilters, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch protected resource');
      }

      const data = await response.json();
      console.log(data);
      this.currentJobsPage = data.stellenangebote;
      this.currentJobsCount = data.maxErgebnisse;
      this.currentPageCount = data.maxErgebnisse / this.itemsPerPage;
    } catch (error) {
      console.error('Error:', error);
    }
  }

}
