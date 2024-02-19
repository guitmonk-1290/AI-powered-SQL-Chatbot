import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from "@angular/material/icon"
import { MatButtonModule } from "@angular/material/button"
import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked ,Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http"
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Observable, lastValueFrom } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// chat message interface
interface ChatMessage {
  text: any;
  user: boolean;
  date?: boolean;
  loading?: boolean;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  
  // Input string representing the logged-in username.
  @Input() user: string = 'Aditya';

  // reference to the message container in UI
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  // array to store chat messages
  messages: ChatMessage[] = [];

  // handling user string input
  userInput: string = '';

  // loading state
  isLoading: boolean = false;

  // for preventing any unsafe HTML
  formattedResponse: SafeHtml = '';

  // backend server URL -> for getting the response from LLM model
  apiURL = "http://localhost:3010/bot";

  // backend data-view url -> for displaying the detailed result
  dataURL = "http://localhost:3010/data";

  constructor(
    private http: HttpClient, 
    private sanitizer: DomSanitizer,
    private cdRef: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    this.messages.push({ text: this.getDate(), user: false, date: true })
    this.messages.push({ text: 'Ask me anything about your data.', user: false })
  }

  // After angular updates the view
  ngAfterViewChecked() {
      this.scrollToBottom();
  }

  // scrolling to the most recent chat message
  private scrollToBottom(): void {
    try {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    } catch(err) {
      // Error handling
    }
  }

  removeNonWhitespace(str: string) {
    return str.replace(/[^\s]/g, '');
  }

  // Adjust the height of the text input 
  autoGrow(event: any): void {
    const textArea = event.target;
    textArea.style.height = 'auto';
    textArea.style.height = textArea.scrollHeight + 'px';
  }

  sendMessage(message: string): Observable<any> {
    console.log('sending message: ', message);
    return this.http.post<any>(`${this.apiURL}`, {message});
  }

  getResponse() {

    this.isLoading = true;
    this.cdRef.detectChanges();

    if (this.userInput.trim() === '') return;

    this.messages.push({ text: this.userInput, user: true });
    this.messages.push({ text: 'generating response...', user: false });

    try {
      this.sendMessage(this.userInput)
          .subscribe(res => {
            if (res && 'response' in res) {
              // console.log(res.response)
              // console.log("type: ", typeof(res.response.output))

              res.response.output = JSON.parse(res.response.output)
              // console.log("[+] RCVD: ", res)
              this.messages.pop()
              this.messages.push({ text: res.response.output.nlp_response as string, user: false });

              const data = res.response.output.data;
              const encodedArray = encodeURIComponent(JSON.stringify(data))

              // passing encoded data array to our data-view URL
              const dataURI = `${this.dataURL}?array=${encodedArray}`
              const dataAnchorTag = `<a href="${dataURI}" target="_blank">Click here for more details</a>`;

              this.messages.push({ text: dataAnchorTag, user: false })

              this.userInput = '';
      
              // Format and set the response
              this.formattedResponse = this.formatCodeBlock(res.response.output.nlp_response as string);
            } else {
              this.handleError('Invalid or empty response from the API.');
            }
            this.isLoading = false;
          })
      
    } catch (error) {
      this.isLoading = false;
      this.messages.pop()
      this.handleError("I'm experiencing technical difficulties at the moment. Please try again later.");
      console.error(error);
    }
  }

  handleError(errorMessage: string): void {
    // displaying error message in messageContainer
  }

  formatCodeBlock(code: string): SafeHtml {
    const formattedCode = this.sanitizer.bypassSecurityTrustHtml(`<pre><code>${code}</code></pre>`);
    return formattedCode;
  }

  getDate() {
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      weekday: undefined
    });
    return formattedDate;
  }
}

