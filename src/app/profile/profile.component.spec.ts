import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { StorageService } from '../_services/storage.service';
import { UserService } from '../_services/user.service';
import { of } from 'rxjs';

// Création de mocks simples pour StorageService et UserService
const storageServiceMock = {
  getUser: () => ({
    name: 'Test',
    firstName: 'User',
    email: 'test@example.com',
  }),
  saveUser: jasmine.createSpy('saveUser'),
};

const userServiceMock = {
  updateUser: (user: any) => of(user),
};

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: StorageService, useValue: storageServiceMock },
        { provide: UserService, useValue: userServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
