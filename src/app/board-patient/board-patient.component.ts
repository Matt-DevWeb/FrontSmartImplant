import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Appointment {
  date: string;
  time: string;
  dentist: string;
  status: string;
}

interface MedicalRecord {
  date: string;
  description: string;
}

@Component({
  selector: 'app-board-patient',
  imports: [CommonModule],
  templateUrl: './board-patient.component.html',
  styleUrls: ['./board-patient.component.css'],
})
export class BoardPatientComponent implements OnInit {
  patient = {
    name: 'Votre Nom',
    email: 'votre@email',
    phone: '0123456789',
  };

  notifications: string[] = [
    'Notification 1',
    'Notification 2',
    'Notification 3',
  ];

  appointments: Appointment[] = [
    {
      date: '2025-04-01',
      time: '09:00',
      dentist: 'Dr Dupont',
      status: 'Confirmé',
    },
    {
      date: '2025-04-15',
      time: '10:30',
      dentist: 'Dr Martin',
      status: 'En attente',
    },
  ];

  medicalHistory: MedicalRecord[] = [
    {
      date: '2025-03-12',
      description: 'Consultation générale avec le Dr Dupont',
    },
    {
      date: '2025-02-28',
      description: 'Nettoyage dentaire effectué par le Dr Martin',
    },
    { date: '2025-02-15', description: 'Radiographie dentaire' },
  ];

  constructor() {}

  ngOnInit(): void {}
}
