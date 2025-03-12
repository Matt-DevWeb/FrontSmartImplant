import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Appointment {
  date: string;
  time: string;
  patient: string;
  status: string;
}

interface Patient {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'app-board-dentist',
  imports: [CommonModule],
  templateUrl: './board-dentist.component.html',
  styleUrls: ['./board-dentist.component.css'],
})
export class BoardDentistComponent implements OnInit {
  todaysAppointments: Appointment[] = [
    {
      date: '2025-03-12',
      time: '09:00',
      patient: 'Alice Dupont',
      status: 'Confirmé',
    },
    {
      date: '2025-03-12',
      time: '10:30',
      patient: 'Bob Martin',
      status: 'En attente',
    },
  ];

  patients: Patient[] = [
    { name: 'Alice Dupont', email: 'alice@email.com', phone: '0123456789' },
    { name: 'Bob Martin', email: 'bob@email.com', phone: '0987654321' },
  ];

  statistics = {
    totalPatients: this.patients.length,
    totalOperations: 5,
  };

  careRequests: string[] = [
    'Demande de prise en charge pour Alice Dupont',
    'Demande de prise en charge pour Bob Martin',
  ];

  constructor() {}

  ngOnInit(): void {}
}
