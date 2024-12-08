import { Component, HostListener, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-typing-game',
  templateUrl: './typing-game.component.html',
  styleUrls: ['./typing-game.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(1.2)' }))
      ])
    ]),
    trigger('errorFlash', [
      transition(':increment', [
        style({ backgroundColor: 'red' }),
        animate('300ms ease-out', style({ backgroundColor: 'transparent' }))
      ])
    ])
  ]
})
export class TypingGameComponent implements OnInit {
  gameForm: FormGroup;
  currentLetter: string = '';
  remainingTime: number = 0;
  typedLetters: number = 0;
  errors: number = 0;
  isGameRunning: boolean = false;
  isGameEnded: boolean = false;
  isTimerStarted: boolean = false;
  spm: number | null = null;
  errorOccurred: boolean = false;
  intervalId: any;
  lastLetter: string = '';

  constructor() {
    this.gameForm = new FormGroup({
      selectedTime: new FormControl(15),
    });
  }

  ngOnInit(): void {
    this.resetGame();
  }

  startGame(): void {
    this.resetGame();
    this.isGameRunning = true;
    this.isGameEnded = false;
    this.remainingTime = this.gameForm.get('selectedTime')?.value;
    this.displayNewLetter();
  }

  playAgain(): void {
    this.isGameRunning = false;
    this.isGameEnded = false;
  }

  resetGame(): void {
    this.isGameRunning = false;
    this.isGameEnded = false;
    this.isTimerStarted = false;
    this.spm = null;
    this.typedLetters = 0;
    this.errors = 0;
    this.remainingTime = 0;
    clearInterval(this.intervalId);
  }

  displayNewLetter(): void {
    let newLetter;

    do {
      newLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
    } while (newLetter === this.lastLetter);
    this.currentLetter = newLetter;
    this.lastLetter = newLetter;
  }

  startTimer(): void {
    this.isTimerStarted = true;
    this.intervalId = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer(): void {
    if (this.remainingTime > 0) {
      this.remainingTime--;
    } else {
      this.endGame();
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.isGameRunning) return;

    const typedLetter = event.key.toUpperCase();

    if (!this.isTimerStarted && typedLetter === this.currentLetter) {
      this.startTimer();
    }

    if (this.isTimerStarted) {
      if (typedLetter === this.currentLetter) {
        this.typedLetters++;
        this.displayNewLetter();
      } else {
        this.errors++;
        this.errorOccurred = true;
        setTimeout(() => (this.errorOccurred = false), 100);
      }
    }
  }

  endGame(): void {
    this.isGameRunning = false;
    this.isGameEnded = true;
    clearInterval(this.intervalId);
    const timeElapsed = this.gameForm.get('selectedTime')?.value / 60;
    this.spm = Math.round(this.typedLetters / timeElapsed);
  }
}
