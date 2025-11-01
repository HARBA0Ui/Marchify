import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionList } from './mission-list';

describe('MissionList', () => {
  let component: MissionList;
  let fixture: ComponentFixture<MissionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MissionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
