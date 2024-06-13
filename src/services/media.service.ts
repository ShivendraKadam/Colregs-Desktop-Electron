import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

const BACKEND_URL: any = environment.apiUrl;


@Injectable({
  providedIn: 'root'
})

export class MediaService {

  constructor(private http: HttpClient) { }


  async fetchVideoById1(id: any) {
    // try {
    // const headers = new HttpHeaders().set('Range', '10000');
    // const options = {
    //   headers: headers,
    //   responseType: 'arraybuffer' as 'json', // You may need to specify the responseType correctly
    // };

    // const Response = await this.http
    //   .get(BACKEND_URL + `/media/video/${15}/${13}`, options)
    //   .toPromise();
    // return Response as ArrayBuffer;

    return this.http.get(BACKEND_URL + `/media/video/${15}/${13}`)
    // } catch (error) {
    //   console.error('Error fetching video:', error);
    //   throw error; // Rethrow the error if needed
    // }
  }

  async fetchVideoById(courseId: any, videoId: any) {
    try {
      const videoUrl = await this.http
        .get(BACKEND_URL + `/media/video/${courseId}/${videoId}`, { responseType: 'text' })
        .toPromise();
      return videoUrl;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  async fetchToolBarVideos(courseId: any, videoId: any, type: any) {
    try {
      const videoUrl = await this.http
        .get(BACKEND_URL + `/media/tool-bar/${courseId}/${videoId}/${type}`, { responseType: 'text' })
        .toPromise();
      return videoUrl;
    }
    catch (err) {
      console.error('Error fetching video:', err);
      throw err;
    }
  }

  fetchColregsPlaylist(courseId: any, videoId: any) {
    return this.http.get(BACKEND_URL + `/media/COLREGS-Videos/${courseId}/${videoId}`)
  }



  async fetchCourseTrailer(courseId: any) {
    try {
      const videoUrl = await this.http
        .get(BACKEND_URL + `/media/course-trailer/${courseId}`, { responseType: 'text' })
        .toPromise();
      return videoUrl;
      // return this.http.get(BACKEND_URL + `/media/course-trailer/${courseId}`, { withCredentials: true })

    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  }

  fetchCourseThumbnail(courseId: any) {
    return this.http.get(BACKEND_URL + `/media/course-thumbnail/${courseId}`)
  }

  courseThumbnailCoookieTest(courseId: any) {
    return this.http.get(BACKEND_URL + `/media/courseThumbnailCoookieTest/${courseId}`)
  }

  fetchVideoThumbnail(courseId: any, videoId: any) {
    return this.http.get(BACKEND_URL + `/media/video-thumbnail/${courseId}/${videoId}`)
  }

  async editVideoThumbnail(videoData: any, videoFile: File) {
    const formData = new FormData();
    formData.append('videoThumb', videoFile);
    formData.append('data', JSON.stringify(videoData));

    return this.http.request<any>('put', BACKEND_URL + `/media/video-thumbnail`, {
      body: formData,
      reportProgress: true, // Enable progress events
      observe: 'events' // Listen for all events
    });
  }


  getDocument(courseId: any, documentId: any) {
    return this.http.get(BACKEND_URL + `/media/document/${courseId}/${documentId}`)
  }

  saveVideoProgress(data: any) {
    return this.http.put(BACKEND_URL + `/media/video-progress`, data)
  }

  saveDocumentProgress(data: any) {
    return this.http.put(BACKEND_URL + `/media/document-progress`, data)
  }

  addDocument(documentData: any, document: File) {
    const formData = new FormData();
    formData.append('folderPath', documentData.folderPath)
    formData.append('startTime', documentData.startTime)
    formData.append('courseId', documentData.courseId)
    formData.append('documentId', documentData.documentId)
    formData.append('documents', document)

    return this.http.post(BACKEND_URL + `/media/document`, formData)
  }

  fetchCourseThumbnailFromCDN(path: any) {
    const params = new HttpParams()
      .set('path', path)
    return this.http.get(BACKEND_URL + `/media/category-thumbnail`, { params })

  }


}
